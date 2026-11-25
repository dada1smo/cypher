import type { SQLiteDatabase } from 'expo-sqlite';
import type { GlossLink, PosGroup, WordEntry } from '../types/word';

type Row = {
  pos: string;
  ipa: string | null;
  etymology: string | null;
  gloss: string;
  example: string | null;
  links: string | null;
};

/** The entry for one exact spelling ("dog", not "DOG"), with senses grouped by part of speech; null if missing. */
export async function getWord(db: SQLiteDatabase, word: string): Promise<WordEntry | null> {
  // The first condition uses the NOCASE index, the second keeps only the exact spelling.
  const rows = await db.getAllAsync<Row>(
    `SELECT w.pos, w.ipa, w.etymology, s.gloss, s.example, s.links
     FROM words w JOIN senses s ON s.word_id = w.id
     WHERE w.word = ? AND w.word = ? COLLATE BINARY
     ORDER BY w.id, s.n`,
    [word, word],
  );
  if (rows.length === 0) return null;

  const groups = new Map<string, PosGroup>();
  for (const r of rows) {
    const group = groups.get(r.pos) ?? { pos: r.pos, senses: [] };
    groups.set(r.pos, group);
    group.senses.push({ n: group.senses.length + 1, gloss: r.gloss, example: r.example, links: parseLinks(r.links) });
  }
  const etymologies = [...new Set(rows.map((r) => r.etymology).filter((e) => e !== null))];
  return {
    word,
    ipa: rows.find((r) => r.ipa)?.ipa ?? null,
    etymology: etymologies.length ? etymologies.join('\n\n') : null,
    groups: [...groups.values()],
  };
}

function parseLinks(json: string | null): GlossLink[] {
  if (!json) return [];
  return (JSON.parse(json) as [number, number, string][]).map(([start, end, target]) => ({ start, end, target }));
}
