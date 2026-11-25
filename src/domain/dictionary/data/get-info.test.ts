/** @jest-environment node */
import { createTestDb } from '@/global/db/test-db';
import { getInfo } from './get-info';

test('reads word count and build date from meta', async () => {
  const db = createTestDb("INSERT INTO meta VALUES ('built_at', '2026-11-25'), ('word_count', '1300000');");
  expect(await getInfo(db)).toEqual({ wordCount: 1300000, builtAt: '2026-11-25' });
  expect(await getInfo(createTestDb())).toEqual({ wordCount: null, builtAt: null });
});
