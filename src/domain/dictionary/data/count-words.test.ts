/** @jest-environment node */
import { createTestDb } from '@/global/db/test-db';
import { countWords } from './count-words';

test('counts the words in the dictionary', async () => {
  const db = createTestDb("INSERT INTO words (word, pos) VALUES ('dog', 'noun'), ('cat', 'noun');");
  expect(await countWords(db)).toBe(2);
});

test('is zero for an empty dictionary', async () => {
  expect(await countWords(createTestDb())).toBe(0);
});
