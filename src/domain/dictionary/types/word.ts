export type SearchResult = { word: string; pos: string[]; gloss: string };

/** Search results for one prefix. `count` is every match; `results` only the first page. */
export type SearchResults = { prefix: string; count: number; results: SearchResult[] };

/** A span of a definition that opens another word. Offsets are UTF-16 units, like JS string indexes. */
export type GlossLink = { start: number; end: number; target: string };

export type Sense = { n: number; gloss: string; example: string | null; links: GlossLink[] };

export type PosGroup = { pos: string; senses: Sense[] };

/** Every part of speech of one exact spelling. */
export type WordEntry = { word: string; ipa: string | null; etymology: string | null; groups: PosGroup[] };

export type DictionaryInfo = { wordCount: number | null; builtAt: string | null };
