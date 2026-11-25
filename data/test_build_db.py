"""Run: python3 -m unittest discover data"""

import json
import os
import sqlite3
import tempfile
import unittest

from build_db import build, find_links

SAMPLE = [
    {"word": "dog", "lang_code": "en", "pos": "noun",
     "sounds": [{"audio": "x.ogg"}, {"ipa": "/dɒɡ/"}],
     "etymology_text": "From Old English docga.",
     "senses": [
         {"glosses": ["A mammal."], "examples": [{"text": "The dog barked."}]},
         {"glosses": ["A mammal.", "A male dog."]},
         {"tags": ["no-gloss"]},
     ]},
    {"word": "Dogma", "lang_code": "en", "pos": "noun", "senses": [{"glosses": ["A doctrine."]}]},
    {"word": "chien", "lang_code": "fr", "pos": "noun", "senses": [{"glosses": ["dog"]}]},
    {"word": "empty", "lang_code": "en", "pos": "adj", "senses": []},
    # Personal names go, with their plurals; places and the noun "surname" stay.
    {"word": "Smith", "lang_code": "en", "pos": "name", "senses": [{"glosses": ["A surname."]}]},
    {"word": "Smiths", "lang_code": "en", "pos": "name", "senses": [{"glosses": ["plural of Smith"]}]},
    {"word": "Mary", "lang_code": "en", "pos": "name",
     "senses": [{"glosses": ["A female given name."]}, {"glosses": ["The mother of Jesus."]}]},
    {"word": "Al", "lang_code": "en", "pos": "name",
     "senses": [{"glosses": ["A diminutive of the male given names Alan and Albert."]}]},
    {"word": "Als", "lang_code": "en", "pos": "name", "senses": [{"glosses": ["plural of Al"]}]},
    {"word": "Koreas", "lang_code": "en", "pos": "name", "senses": [{"glosses": ["plural of Korea"]}]},
    {"word": "surname", "lang_code": "en", "pos": "noun", "senses": [{"glosses": ["A family name."]}]},
    # Links: "doctrine" has no entry, so only the link to "dog" survives. Offsets count UTF-16 units ("🐕" is 2).
    {"word": "puppy", "lang_code": "en", "pos": "noun",
     "senses": [{"glosses": ["A young 🐕 dog, not a doctrine."],
                 "links": [["dog", "dog#English"], ["doctrine", "doctrine"]]}]},
]


class BuildDbTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        src = os.path.join(self.dir.name, "sample.jsonl")
        with open(src, "w", encoding="utf-8") as f:
            f.writelines(json.dumps(e) + "\n" for e in SAMPLE)
        self.db_path = os.path.join(self.dir.name, "out.db")
        self.stats = build(src, self.db_path)
        self.db = sqlite3.connect(self.db_path)

    def tearDown(self):
        self.db.close()
        self.dir.cleanup()

    def test_counts_and_filtering(self):
        self.assertEqual(self.stats, {"words": 6, "senses": 7, "skipped": 4})

    def test_personal_names_removed(self):
        rows = self.db.execute(
            "SELECT word, gloss FROM words JOIN senses ON id = word_id WHERE pos != 'noun' OR word = 'surname' ORDER BY word"
        ).fetchall()
        self.assertEqual(rows, [
            ("Koreas", "plural of Korea"), ("Mary", "The mother of Jesus."), ("surname", "A family name."),
        ])

    def test_failed_build_leaves_no_database(self):
        broken = os.path.join(self.dir.name, "broken.jsonl")
        with open(broken, "w", encoding="utf-8") as f:
            f.write(json.dumps(SAMPLE[0]) + '\n{"word": "cut off')
        out = os.path.join(self.dir.name, "broken.db")
        with self.assertRaises(json.JSONDecodeError):
            build(broken, out)
        self.assertFalse(os.path.exists(out))

    def test_entry_fields(self):
        row = self.db.execute("SELECT pos, ipa, etymology FROM words WHERE word = 'dog'").fetchone()
        self.assertEqual(row, ("noun", "/dɒɡ/", "From Old English docga."))
        senses = self.db.execute(
            "SELECT n, gloss, example FROM senses JOIN words ON id = word_id WHERE word = 'dog' ORDER BY n"
        ).fetchall()
        self.assertEqual(senses, [(1, "A mammal.", "The dog barked."), (2, "A male dog.", None)])

    def test_links_point_to_existing_words_with_utf16_offsets(self):
        gloss, links = self.db.execute(
            "SELECT gloss, links FROM senses JOIN words ON id = word_id WHERE word = 'puppy'"
        ).fetchone()
        self.assertEqual(json.loads(links), [[11, 14, "dog"]])
        self.assertEqual(gloss.encode("utf-16-le")[22:28].decode("utf-16-le"), "dog")
        self.assertIsNone(self.db.execute("SELECT links FROM senses WHERE gloss = 'A mammal.'").fetchone()[0])

    def test_meta_has_build_date_and_word_count(self):
        meta = dict(self.db.execute("SELECT key, value FROM meta"))
        self.assertRegex(meta["built_at"], r"^\d{4}-\d{2}-\d{2}$")
        self.assertEqual(meta["word_count"], "6")

    def test_prefix_search_is_case_insensitive_and_indexed(self):
        query = "SELECT word FROM words WHERE word LIKE ? ORDER BY word"
        self.assertEqual(self.db.execute(query, ("DOG%",)).fetchall(), [("dog",), ("Dogma",)])
        plan = " ".join(r[-1] for r in self.db.execute("EXPLAIN QUERY PLAN " + query, ("dog%",)))
        self.assertIn("words_word", plan)


class FrenchEditionTest(unittest.TestCase):
    """The French edition: etymology as a list, personal names marked in pos_title, other languages skipped."""

    def test_french_entries(self):
        sample = [
            {"word": "accueil", "lang_code": "fr", "pos": "noun", "pos_title": "Nom commun",
             "sounds": [{"ipa": "\\a.kœj\\"}], "etymology_texts": ["Déverbal de accueillir.", "Voir aussi accueillir."],
             "senses": [{"glosses": ["Action d’accueillir."], "examples": [{"text": "Un accueil chaleureux."}]}]},
            {"word": "Dupont", "lang_code": "fr", "pos": "name", "pos_title": "Nom de famille",
             "senses": [{"glosses": ["Nom de famille."]}]},
            {"word": "Marie", "lang_code": "fr", "pos": "name", "pos_title": "Prénom 2",
             "senses": [{"glosses": ["Prénom féminin."]}]},
            {"word": "Toulouse", "lang_code": "fr", "pos": "name", "pos_title": "Nom propre",
             "senses": [{"glosses": ["Ville de France."]}]},
            {"word": "dog", "lang_code": "en", "pos": "noun", "senses": [{"glosses": ["Chien."]}]},
        ]
        with tempfile.TemporaryDirectory() as tmp:
            src = os.path.join(tmp, "fr.jsonl")
            with open(src, "w", encoding="utf-8") as f:
                f.writelines(json.dumps(e, ensure_ascii=False) + "\n" for e in sample)
            out = os.path.join(tmp, "fr.db")
            self.assertEqual(build(src, out, "fr"), {"words": 2, "senses": 2, "skipped": 3})
            db = sqlite3.connect(out)
            self.assertEqual(
                db.execute("SELECT word, ipa, etymology FROM words ORDER BY word").fetchall(),
                [("accueil", "\\a.kœj\\", "Déverbal de accueillir.\nVoir aussi accueillir."), ("Toulouse", None, None)],
            )
            db.close()


class FindLinksTest(unittest.TestCase):
    def test_whole_words_in_order_without_overlaps_or_namespaces(self):
        gloss = "Listing words; a word list in reference works."
        links = [
            ["reference work", "reference work"],  # inherited from a parent sense: not in this gloss
            ["word", "word"],                       # must skip "words", match "word"
            ["word list", "word list"],             # same start as "word": the longer one wins
            ["reference", "w:Reference"],           # Wikipedia namespace: dropped
            ["list", "list#Noun"],                  # inside "word list": dropped
            ["works", "work"],
        ]
        self.assertEqual(find_links(gloss, links), [(17, 26, "word list"), (40, 45, "work")])


if __name__ == "__main__":
    unittest.main()
