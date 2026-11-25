import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { getWord } from '../data/get-word';
import type { WordEntry } from '../types/word';

/** The entry for `word`: undefined while loading, null if the word is not in the dictionary. */
export function useWord(word: string): WordEntry | null | undefined {
  const db = useSQLiteContext();
  const [entry, setEntry] = useState<{ word: string; value: WordEntry | null }>();
  useEffect(() => {
    let isCurrent = true;
    getWord(db, word).then((value) => isCurrent && setEntry({ word, value }));
    return () => {
      isCurrent = false;
    };
  }, [db, word]);
  return entry?.word === word ? entry.value : undefined;
}
