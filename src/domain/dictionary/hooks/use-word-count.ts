import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { countWords } from '../data/count-words';

/** Number of words in the dictionary, or null while it loads. */
export function useWordCount() {
  const db = useSQLiteContext();
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    countWords(db).then(setCount);
  }, [db]);
  return count;
}
