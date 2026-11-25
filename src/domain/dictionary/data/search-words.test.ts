/** @jest-environment node */
import { createTestDb } from '@/global/db/test-db';
import { searchWords } from './search-words';

const db = createTestDb(`
  INSERT INTO words (id, word, pos) VALUES
    (1, 'dog', 'noun'), (2, 'dog', 'verb'), (3, 'DOG', 'noun'), (4, 'dogma', 'noun'),
    (5, 'Dogs', 'name'), (6, 'cat', 'noun'), (7, 'do%g', 'noun');
  INSERT INTO senses (word_id, n, gloss) VALUES
    (1, 2, 'A second sense.'), (1, 1, 'A mammal.'), (2, 1, 'To follow.'), (3, 1, 'Initialism.'),
    (4, 1, 'A doctrine.'), (5, 1, 'A place.'), (6, 1, 'A feline.'), (7, 1, 'Odd.');
`);

test('one row per exact spelling, the typed spelling first, then shortest', async () => {
  const found = await searchWords(db, 'dog');
  expect(found.count).toBe(4);
  expect(found.results).toEqual([
    { word: 'dog', pos: ['noun', 'verb'], gloss: 'A mammal.' },
    { word: 'DOG', pos: ['noun'], gloss: 'Initialism.' },
    { word: 'Dogs', pos: ['name'], gloss: 'A place.' },
    { word: 'dogma', pos: ['noun'], gloss: 'A doctrine.' },
  ]);
});

test('is case-insensitive and treats % and _ as plain characters', async () => {
  expect((await searchWords(db, 'DOGM')).results.map((r) => r.word)).toEqual(['dogma']);
  expect((await searchWords(db, 'do%')).results.map((r) => r.word)).toEqual(['do%g']);
  expect(await searchWords(db, 'xyz')).toEqual({ prefix: 'xyz', count: 0, results: [] });
});

test('a full first page holds the shortest words', async () => {
  const short = Array.from({ length: 60 }, (_, i) => `(${100 + i}, 'k${String.fromCharCode(97 + (i % 26))}${i >= 26 ? i : ''}', 'noun')`);
  const many = createTestDb(`
    INSERT INTO words (id, word, pos) VALUES ${short.join(', ')}, (999, 'kz', 'noun');
    INSERT INTO senses (word_id, n, gloss) SELECT id, 1, 'x' FROM words;
  `);
  const found = await searchWords(many, 'k');
  expect(found.count).toBe(60); // 'kz' twice is one spelling
  expect(found.results).toHaveLength(50);
  // The 26 two-letter words (ka…kz) come first, then the longer ones.
  expect(found.results.slice(0, 26).every((r) => r.word.length === 2)).toBe(true);
});
