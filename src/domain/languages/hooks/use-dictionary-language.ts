import { useContext } from 'react';
import { DictionaryLanguageContext } from './languages-context';

/** The language of the dictionary this screen reads, set by the nearest `DictionaryDb`. */
export function useDictionaryLanguage() {
  return useContext(DictionaryLanguageContext);
}
