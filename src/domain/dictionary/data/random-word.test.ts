/** @jest-environment node */
import { createTestDb } from '@/global/db/test-db';
import { randomWord } from './random-word';

test('returns a word from the dictionary, or null when it is empty', async () => {
  const db = createTestDb("INSERT INTO words (id, word) VALUES (10, 'dog'), (20, 'cat'), (30, 'owl');");
  for (let i = 0; i < 20; i++) expect(['dog', 'cat', 'owl']).toContain(await randomWord(db));
  expect(await randomWord(createTestDb())).toBeNull();
});
