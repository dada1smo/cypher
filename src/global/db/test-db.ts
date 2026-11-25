import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

// The schema is read from data/build_db.py, so tests break when the contract between the two changes.
const SCHEMA = readFileSync(join(__dirname, '../../../data/build_db.py'), 'utf8').match(/SCHEMA = """([\s\S]*?)"""/)![1];

/** In-memory SQLite (node:sqlite) for Jest, with the methods the app's queries use. */
export function createTestDb(rowsSql = ''): SQLiteDatabase {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA + rowsSql);
  const fake = {
    getFirstAsync: async (sql: string, ...params: never[]) => db.prepare(sql).get(...params.flat()) ?? null,
    getAllAsync: async (sql: string, ...params: never[]) => db.prepare(sql).all(...params.flat()),
  };
  return fake as unknown as SQLiteDatabase;
}
