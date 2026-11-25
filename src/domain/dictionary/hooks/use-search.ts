import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { searchWords } from '../data/search-words';
import type { SearchResults } from '../types/word';

/**
 * Results for `prefix`, or null when it is empty or nothing has loaded yet. While the next prefix
 * loads, the previous results stay (their `prefix` says which), so the list does not flicker.
 */
export function useSearch(prefix: string): SearchResults | null {
  const db = useSQLiteContext();
  const [found, setFound] = useState<SearchResults | null>(null);
  useEffect(() => {
    if (!prefix) return;
    let isCurrent = true; // a slow query for an old prefix must not overwrite a newer one
    searchWords(db, prefix).then((r) => isCurrent && setFound(r));
    return () => {
      isCurrent = false;
    };
  }, [db, prefix]);
  return prefix ? found : null;
}
