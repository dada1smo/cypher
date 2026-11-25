import type { DownloadTask } from 'expo-file-system';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { deleteDictionary, downloadDictionary, isAvailable, keepIfComplete } from '../data/dictionary-files';
import { languageOf } from '../data/languages';
import { loadSettings, saveSettings } from '../data/settings';
import { LanguagesContext, type LanguagesValue } from '../hooks/languages-context';
import type { DownloadState, LanguageCode, LanguageSettings } from '../types/language';

export type LanguagesProviderProps = { children: ReactNode };

/**
 * Owns the enabled languages, the current one and the downloads, above every screen: a download keeps going
 * when the Languages screen is left.
 */
export function LanguagesProvider({ children }: LanguagesProviderProps) {
  const [settings, setSettings] = useState(() => loadSettings(isAvailable));
  const [downloads, setDownloads] = useState<Partial<Record<LanguageCode, DownloadState>>>({});
  const tasks = useRef<Partial<Record<LanguageCode, DownloadTask>>>({});

  const update = useCallback((change: (s: LanguageSettings) => LanguageSettings) => {
    setSettings((s) => {
      const next = change(s);
      saveSettings(next);
      return next;
    });
  }, []);

  const setDownload = useCallback((code: LanguageCode, state: DownloadState | null) => {
    setDownloads(({ [code]: _, ...rest }) => (state ? { ...rest, [code]: state } : rest));
  }, []);

  const turnOn = useCallback(
    (code: LanguageCode) => update((s) => (s.enabled.includes(code) ? s : { ...s, enabled: [...s.enabled, code] })),
    [update],
  );

  const enable = useCallback(
    (code: LanguageCode) => {
      const language = languageOf(code);
      if (!language || language.kind === 'soon' || tasks.current[code]) return;
      if (isAvailable(code)) return turnOn(code);
      if (language.kind !== 'download') return;

      setDownload(code, { progress: 0 });
      let shown = 0;
      const task = downloadDictionary(language, (fraction) => {
        // Re-render once per percent, not on every chunk.
        if (fraction - shown >= 0.01 || fraction === 1) setDownload(code, { progress: (shown = fraction) });
      });
      tasks.current[code] = task;
      task
        .downloadAsync()
        .then((file) => {
          if (file && keepIfComplete(language)) {
            turnOn(code);
            setDownload(code, null);
          } else if (file) {
            setDownload(code, { failed: true });
          }
        })
        .catch(() => setDownload(code, task.state === 'cancelled' ? null : { failed: true }))
        .finally(() => delete tasks.current[code]);
    },
    [setDownload, turnOn],
  );

  const cancel = useCallback(
    (code: LanguageCode) => {
      tasks.current[code]?.cancel();
      setDownload(code, null);
    },
    [setDownload],
  );

  const disable = useCallback(
    (code: LanguageCode) => {
      if (!settings.enabled.includes(code) || settings.enabled.length === 1) return;
      update((s) => {
        const enabled = s.enabled.filter((c) => c !== code);
        return { enabled, current: s.current === code ? enabled[0] : s.current };
      });
      const language = languageOf(code);
      // The home screen may still have this database open; on iOS removing the file is safe while it is open.
      if (language?.kind === 'download') deleteDictionary(language);
    },
    [settings.enabled, update],
  );

  const select = useCallback(
    (code: LanguageCode) => update((s) => (s.enabled.includes(code) ? { ...s, current: code } : s)),
    [update],
  );

  const value = useMemo<LanguagesValue>(
    () => ({ ...settings, downloads, select, enable, disable, cancel }),
    [settings, downloads, select, enable, disable, cancel],
  );
  return <LanguagesContext.Provider value={value}>{children}</LanguagesContext.Provider>;
}
