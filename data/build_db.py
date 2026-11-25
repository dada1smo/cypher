"""Build the Cypher SQLite dictionary from a kaikki.org (wiktextract) JSONL dump.

Usage:
  python3 data/build_db.py <input.jsonl|input.jsonl.gz|-> <output.db> [lang_code, default en]

Usual run, from the dump saved in data/raw/ (not in git):
  curl -sSf https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl.gz -o data/raw/kaikki-en.jsonl.gz
  python3 data/build_db.py data/raw/kaikki-en.jsonl.gz assets/cypher-en.db

French, from the French edition of Wiktionary (definitions in French; downloaded by the app, not embedded):
  curl -sSf "https://kaikki.org/frwiktionary/Fran%C3%A7ais/kaikki.org-dictionary-Fran%C3%A7ais.jsonl.gz" -o data/raw/kaikki-fr.jsonl.gz
  python3 data/build_db.py data/raw/kaikki-fr.jsonl.gz data/out/cypher-fr.db fr

"-" reads from stdin, so the dump can be streamed without saving it.
pipefail makes a dropped download fail the command instead of building a short database:
  set -o pipefail; curl -sSf https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl.gz \
    | gunzip | python3 data/build_db.py - assets/cypher-en.db
"""

import datetime
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
  example TEXT,
  -- JSON [[start, end, target], ...]: spans of gloss that link to another word in `words`.
  -- Offsets are UTF-16 code units, so the app can slice the gloss string directly. NULL if none.
  links TEXT
);
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
"""

# Personal names are most of the "name" entries and useless in a dictionary.
# Places, brands, etc. stay. Only applied to pos "name", so "last name" (noun) stays.
PERSONAL_NAME = re.compile(r"\b(surname|given name)s?\b")
# The French edition says it in the section title instead ("Nom de famille", "Prénom 2"...).
PERSONAL_NAME_TITLE = re.compile(r"^(Nom de famille|Prénom)\b")

def find_links(gloss, links):
    """Place kaikki's [text, target] pairs in gloss: [(start, end, target)] in code points, sorted.

    Subsenses inherit their parent's links, so pairs whose text is not in this gloss are dropped.
    Text must match as a whole word ("word" does not link inside "words"); overlapping spans keep the earliest.
    """
    found = []
    for pair in links:
        if len(pair) < 2 or not pair[0]:
            continue
        target = pair[1].split("#")[0]
        if not target or ":" in target:  # namespaces: w:, Appendix:, Citations:...
            continue
        m = re.search(r"(?<!\w)" + re.escape(pair[0]) + r"(?!\w)", gloss)
        if m:
            found.append((m.start(), m.end(), target))
    found.sort(key=lambda span: (span[0], -span[1]))  # same start: the longer, more specific link wins
    spans = []
    for start, end, target in found:
        if not spans or start >= spans[-1][1]:
            spans.append((start, end, target))
    return spans


def utf16_offset(text, i):
    return len(text[:i].encode("utf-16-le")) // 2


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
    """Return ((word, pos, ipa, etymology, [(gloss, example, links)]) or None to skip, had_personal_name)."""
    if entry.get("lang_code") != lang_code or not entry.get("word"):
        return None, False
    if PERSONAL_NAME_TITLE.match(entry.get("pos_title", "")):
        return None, True
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
        senses.append((gloss, example, find_links(gloss, s.get("links", []))))
    if not senses:
        return None, had_personal_name
    ipa = next((x["ipa"] for x in entry.get("sounds", []) if x.get("ipa")), None)
    # English edition: one etymology_text; French edition: a list of paragraphs.
    etymology = entry.get("etymology_text") or "\n".join(entry.get("etymology_texts") or []) or None
    return (entry["word"], entry.get("pos"), ipa, etymology, senses), had_personal_name


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
                "INSERT INTO senses VALUES (?, ?, ?, ?, ?)",
                [(words, n, g, ex, json.dumps(ln) if ln else None) for n, (g, ex, ln) in enumerate(entry_senses, 1)],
            )

    db.executescript("""
        DELETE FROM senses WHERE word_id IN (SELECT id FROM words WHERE pos = 'name')
          AND gloss LIKE 'plural of %' AND substr(gloss, 11) IN personal_names;
        DELETE FROM words WHERE id NOT IN (SELECT word_id FROM senses);
    """)
    resolve_links(db)
    db.execute("INSERT INTO meta VALUES ('built_at', ?)", (datetime.date.today().isoformat(),))
    # Distinct spellings, as the app lists them; counting them on the phone would scan the whole index.
    db.execute("INSERT INTO meta SELECT 'word_count', count(DISTINCT word COLLATE BINARY) FROM words")
    db.executescript(INDEXES)
    db.commit()
    db.execute("VACUUM")
    words, senses = db.execute("SELECT (SELECT count(*) FROM words), (SELECT count(*) FROM senses)").fetchone()
    db.close()
    os.replace(tmp_path, output_path)
    return {"words": words, "senses": senses, "skipped": skipped}


def resolve_links(db):
    """Keep only links whose target is a word in the database (exact spelling); store UTF-16 offsets."""
    known = {w for (w,) in db.execute("SELECT word FROM words")}
    updates = []
    for rowid, gloss, links in db.execute("SELECT rowid, gloss, links FROM senses WHERE links IS NOT NULL"):
        kept = [
            [utf16_offset(gloss, start), utf16_offset(gloss, end), target]
            for start, end, target in json.loads(links)
            if target in known
        ]
        updates.append((json.dumps(kept, ensure_ascii=False) if kept else None, rowid))
    db.executemany("UPDATE senses SET links = ? WHERE rowid = ?", updates)


if __name__ == "__main__":
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    stats = build(*sys.argv[1:])
    size_mb = os.path.getsize(sys.argv[2]) / 1e6
    print(f"{stats['words']} words, {stats['senses']} senses, {stats['skipped']} skipped, {size_mb:.1f} MB")
