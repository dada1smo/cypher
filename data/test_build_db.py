"""Run: python3 -m unittest discover data"""

import json
import os
import sqlite3
import tempfile
import unittest

from build_db import build

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
        self.assertEqual(self.stats, {"words": 5, "senses": 6, "skipped": 4})

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

    def test_prefix_search_is_case_insensitive_and_indexed(self):
        query = "SELECT word FROM words WHERE word LIKE ? ORDER BY word"
        self.assertEqual(self.db.execute(query, ("DOG%",)).fetchall(), [("dog",), ("Dogma",)])
        plan = " ".join(r[-1] for r in self.db.execute("EXPLAIN QUERY PLAN " + query, ("dog%",)))
        self.assertIn("words_word", plan)


if __name__ == "__main__":
    unittest.main()
