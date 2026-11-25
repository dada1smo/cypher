import Storage from 'expo-sqlite/kv-store';
import type { LanguageCode, LanguageSettings } from '../types/language';
import { DEFAULT_LANGUAGE, languageOf } from './languages';

const KEY = 'languages';

/**
 * Keeps only languages that are known and usable now (a downloaded file can be gone, e.g. after the app is
 * reinstalled), never leaves the list empty, and makes `current` one of the enabled languages.
 */
export function sanitizeSettings(raw: unknown, isAvailable: (code: LanguageCode) => boolean): LanguageSettings {
  const saved = (raw ?? {}) as Partial<LanguageSettings>;
  const enabled = (Array.isArray(saved.enabled) ? saved.enabled : []).filter(
    (code, i, all): code is LanguageCode => !!languageOf(code) && isAvailable(code) && all.indexOf(code) === i,
  );
  if (enabled.length === 0) enabled.push(DEFAULT_LANGUAGE);
  const current = saved.current && enabled.includes(saved.current) ? saved.current : enabled[0];
  return { enabled, current };
}

// Sync reads: the home screen needs the language on its first render.
export function loadSettings(isAvailable: (code: LanguageCode) => boolean): LanguageSettings {
  let raw: unknown = null;
  try {
    raw = JSON.parse(Storage.getItemSync(KEY) ?? 'null');
  } catch {
    // A corrupt value falls back to the defaults below.
  }
  return sanitizeSettings(raw, isAvailable);
}

export function saveSettings(settings: LanguageSettings) {
  Storage.setItemSync(KEY, JSON.stringify(settings));
}
