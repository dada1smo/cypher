"""Build the Cypher SQLite dictionary from a kaikki.org (wiktextract) JSONL dump.

Usage:
  python3 data/build_db.py <input.jsonl|input.jsonl.gz|-> <output.db>

"-" reads from stdin, so the dump can be streamed without saving it.
pipefail makes a dropped download fail the command instead of building a short database:
  set -o pipefail; curl -sSf https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl.gz \
    | gunzip | python3 data/build_db.py - data/cypher-en.db
"""

import gzip
import json
import os
import re
import sqlite3
import sys

SCHEMA = """
CREATE TABLE words (
  id INTEGER PRIMARY KEY,
  word TEXT NOT NULL COLLATE NOCASE,
  pos TEXT,
  ipa TEXT,
  etymology TEXT
);
CREATE TABLE senses (
  word_id INTEGER NOT NULL REFERENCES words(id),
  n INTEGER NOT NULL,
  gloss TEXT NOT NULL,
  example TEXT
);
"""

# Personal names are most of the "name" entries and useless in a dictionary.
# Places, brands, etc. stay. Only applied to pos "name", so "last name" (noun) stays.
PERSONAL_NAME = re.compile(r"\b(surname|given name)s?\b")

# Created after the bulk insert: much faster than maintaining them row by row.
INDEXES = """
CREATE INDEX words_word ON words(word);
CREATE INDEX senses_word_id ON senses(word_id);
"""


def open_input(path):
    if path == "-":
        return sys.stdin
    if path.endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8")
    return open(path, encoding="utf-8")


def parse_entry(entry, lang_code="en"):
    """Return ((word, pos, ipa, etymology, [(gloss, example)]) or None to skip, had_personal_name)."""
    if entry.get("lang_code") != lang_code or not entry.get("word"):
        return None, False
    senses = []
    had_personal_name = False
    for s in entry.get("senses", []):
        glosses = s.get("glosses")
        if not glosses:
            continue  # e.g. senses tagged "no-gloss"
        # shortcut: subsenses list the parent gloss first; we keep only the most specific one.
        # Upgrade if the result screen needs to show the sense hierarchy.
        gloss = glosses[-1]
        if entry.get("pos") == "name" and PERSONAL_NAME.search(gloss):
            had_personal_name = True
            continue
        examples = s.get("examples") or []
        example = examples[0].get("text") if examples else None
        senses.append((gloss, example))
    if not senses:
        return None, had_personal_name
    ipa = next((x["ipa"] for x in entry.get("sounds", []) if x.get("ipa")), None)
    return (entry["word"], entry.get("pos"), ipa, entry.get("etymology_text"), senses), had_personal_name


def build(input_path, output_path, lang_code="en"):
    # Build into a temp file and rename at the end, so a failed run never leaves a half database.
    tmp_path = output_path + ".tmp"
    if os.path.exists(tmp_path):
        os.remove(tmp_path)
    db = sqlite3.connect(tmp_path)
    db.executescript("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;" + SCHEMA)

    words = skipped = 0
    # Name words that had a personal-name sense, to drop their plurals ("the Smiths") afterwards.
    db.execute("CREATE TEMP TABLE personal_names (word TEXT PRIMARY KEY)")
    with open_input(input_path) as f:
        for line in f:
            entry = json.loads(line)
            parsed, had_personal_name = parse_entry(entry, lang_code)
            if had_personal_name:
                db.execute("INSERT OR IGNORE INTO personal_names VALUES (?)", (entry["word"],))
            if parsed is None:
                skipped += 1
                continue
            word, pos, ipa, etym, entry_senses = parsed
            words += 1
            db.execute("INSERT INTO words VALUES (?, ?, ?, ?, ?)", (words, word, pos, ipa, etym))
            db.executemany(
                "INSERT INTO senses VALUES (?, ?, ?, ?)",
                [(words, n, g, ex) for n, (g, ex) in enumerate(entry_senses, 1)],
            )

    db.executescript("""
        DELETE FROM senses WHERE word_id IN (SELECT id FROM words WHERE pos = 'name')
          AND gloss LIKE 'plural of %' AND substr(gloss, 11) IN personal_names;
        DELETE FROM words WHERE id NOT IN (SELECT word_id FROM senses);
    """)
    db.executescript(INDEXES)
    db.commit()
    db.execute("VACUUM")
    words, senses = db.execute("SELECT (SELECT count(*) FROM words), (SELECT count(*) FROM senses)").fetchone()
    db.close()
    os.replace(tmp_path, output_path)
    return {"words": words, "senses": senses, "skipped": skipped}


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    stats = build(sys.argv[1], sys.argv[2])
    size_mb = os.path.getsize(sys.argv[2]) / 1e6
    print(f"{stats['words']} words, {stats['senses']} senses, {stats['skipped']} skipped, {size_mb:.1f} MB")
