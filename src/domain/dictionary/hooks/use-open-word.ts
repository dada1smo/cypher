import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';
import { randomWord } from '../data/random-word';

/** Navigation into entries: `open(word)` pushes its screen, `openRandom()` picks a word first. */
export function useOpenWord() {
  const db = useSQLiteContext();
  const router = useRouter();
  const open = useCallback(
    (word: string) => router.push({ pathname: '/word/[word]', params: { word } }),
    [router],
  );
  const openRandom = useCallback(async () => {
    const word = await randomWord(db);
    if (word) open(word);
  }, [db, open]);
  return { open, openRandom };
}
