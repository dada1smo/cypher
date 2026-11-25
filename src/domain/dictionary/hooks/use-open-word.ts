import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { useDictionaryLanguage } from '@/domain/languages/hooks/use-dictionary-language';
import { randomWord } from '../data/random-word';

/**
 * Navigation between entries: `open(word)` pushes its screen in the dictionary being read, `openRandom()` picks a word first, and
 * `newSearch()` leaves every entry for the home screen with an empty, focused field.
 */
export function useOpenWord() {
  const db = useSQLiteContext();
  const router = useRouter();
  const lang = useDictionaryLanguage();
  const open = useCallback(
    (word: string) => router.push({ pathname: '/word/[lang]/[word]', params: { lang, word } }),
    [router, lang],
  );
  const openRandom = useCallback(async () => {
    const word = await randomWord(db);
    if (word) open(word);
  }, [db, open]);
  // A new `search` value each time: the home route keys its search on it, so the field starts over.
  const newSearch = useCallback(() => router.dismissTo({ pathname: '/', params: { search: Date.now() } }), [router]);
  return { open, openRandom, newSearch };
}
