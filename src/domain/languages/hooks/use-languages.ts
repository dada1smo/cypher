import { useContext } from 'react';
import { LanguagesContext, type LanguagesValue } from './languages-context';

/** Enabled languages, the current one, downloads, and the actions that change them (needs `LanguagesProvider`). */
export function useLanguages(): LanguagesValue {
  const value = useContext(LanguagesContext);
  if (!value) throw new Error('useLanguages needs a LanguagesProvider above it');
  return value;
}
