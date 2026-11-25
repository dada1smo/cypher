import type { SQLiteDatabase } from 'expo-sqlite';
import type { DictionaryInfo } from '../types/word';

/** Facts about the bundled database, written by data/build_db.py into `meta`. */
export async function getInfo(db: SQLiteDatabase): Promise<DictionaryInfo> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM meta');
  const meta = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { wordCount: meta.word_count ? Number(meta.word_count) : null, builtAt: meta.built_at ?? null };
}
