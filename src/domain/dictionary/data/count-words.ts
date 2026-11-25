import type { SQLiteDatabase } from 'expo-sqlite';

export async function countWords(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT count(*) AS n FROM words');
  return row?.n ?? 0;
}
