import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { getInfo } from '../data/get-info';
import type { DictionaryInfo } from '../types/word';

/** Word count and build date of the bundled database; null while loading. */
export function useInfo(): DictionaryInfo | null {
  const db = useSQLiteContext();
  const [info, setInfo] = useState<DictionaryInfo | null>(null);
  useEffect(() => {
    getInfo(db).then(setInfo);
  }, [db]);
  return info;
}
