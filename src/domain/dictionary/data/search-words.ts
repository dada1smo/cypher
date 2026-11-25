import type { SQLiteDatabase } from 'expo-sqlite';
import type { SearchResults } from '../types/word';

const PAGE = 50;

// A range on the NOCASE index instead of LIKE: same index, and "%" or "_" typed by the user stay literal.
// char(1114111) is the last Unicode code point, so the upper bound sorts after every word with the prefix.
const IN_RANGE = 'word >= ? AND word < ? || char(1114111)';
const ORDER = 'length(word), word <> ? COLLATE BINARY, word COLLATE NOCASE';

type Row = { word: string; pos: string; gloss: string };

/** Words starting with `prefix` (ASCII case-insensitive), one row per exact spelling, shortest first. */
export async function searchWords(db: SQLiteDatabase, prefix: string): Promise<SearchResults> {
  const counted = await db.getFirstAsync<{ n: number }>(
    `SELECT count(DISTINCT word COLLATE BINARY) AS n FROM words WHERE ${IN_RANGE}`,
    [prefix, prefix],
  );
  // Sorting every match by length is slow for one letter (136k words for "s"). Results are shortest
  // first, so if the short words alone fill a page they are exactly the first page.
  let rows = await page(db, prefix, prefix.length + 2);
  if (rows.length < PAGE) rows = await page(db, prefix, null);
  return {
    prefix,
    count: counted?.n ?? 0,
    results: rows.map((r) => ({ word: r.word, pos: [...new Set(r.pos.split(','))], gloss: r.gloss })),
  };
}

function page(db: SQLiteDatabase, prefix: string, maxLength: number | null) {
  return db.getAllAsync<Row>(
    `SELECT word, pos, (SELECT gloss FROM senses WHERE word_id = first_id ORDER BY n LIMIT 1) AS gloss
     FROM (
       SELECT word, group_concat(pos) AS pos, min(id) AS first_id FROM words
       WHERE ${IN_RANGE} AND (? IS NULL OR length(word) <= ?)
       GROUP BY word COLLATE BINARY ORDER BY ${ORDER} LIMIT ${PAGE}
     )
     ORDER BY ${ORDER}`,
    [prefix, prefix, maxLength, maxLength, prefix, prefix],
  );
}
