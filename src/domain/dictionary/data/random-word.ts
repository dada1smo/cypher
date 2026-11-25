import type { SQLiteDatabase } from 'expo-sqlite';

/** A random word, or null if the dictionary is empty. Picks by id: ORDER BY random() would scan every row. */
export async function randomWord(db: SQLiteDatabase): Promise<string | null> {
  const row = await db.getFirstAsync<{ word: string }>(
    'SELECT word FROM words WHERE id >= abs(random()) % (SELECT max(id) FROM words) LIMIT 1',
  );
  return row?.word ?? null;
}
