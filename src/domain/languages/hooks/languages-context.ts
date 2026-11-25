import { createContext } from 'react';
import type { DownloadState, LanguageCode, LanguageSettings } from '../types/language';

export type LanguagesValue = LanguageSettings & {
  /** Downloads in progress or just failed, by language. */
  downloads: Partial<Record<LanguageCode, DownloadState>>;
  /** Makes an enabled language the one the home screen searches. */
  select: (code: LanguageCode) => void;
  /** Turns a language on, downloading its dictionary first if needed. */
  enable: (code: LanguageCode) => void;
  /** Turns a language off and deletes its downloaded file. The last enabled one stays on. */
  disable: (code: LanguageCode) => void;
  cancel: (code: LanguageCode) => void;
};

export const LanguagesContext = createContext<LanguagesValue | null>(null);

/** The dictionary the screen below a `DictionaryDb` reads. */
export const DictionaryLanguageContext = createContext<LanguageCode>('en');
