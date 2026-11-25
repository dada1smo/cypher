import type { Language, LanguageCode } from '../types/language';

// A rebuilt database gets a new name (and, for downloads, a new release), so a copy on the phone is never
// mistaken for a newer one. shortcut: old copies stay on disk; delete them when data updates become frequent.
export const LANGUAGES: Language[] = [
  { code: 'en', badge: 'EN', native: 'English', english: 'English', words: 1_308_843, kind: 'bundled', dbName: 'cypher-en-2026-11-25.db' },
  {
    code: 'fr',
    badge: 'FR',
    native: 'Français',
    english: 'French',
    words: 2_011_226,
    kind: 'download',
    dbName: 'cypher-fr-2026-11-25.db',
    url: 'https://github.com/dada1smo/cypher/releases/download/data-fr-2026-11-25/cypher-fr.db',
    size: 483_975_168,
  },
  { code: 'pt', badge: 'PT', native: 'Português', english: 'Portuguese', kind: 'soon' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function languageOf(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
