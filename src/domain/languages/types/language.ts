export type LanguageCode = 'en' | 'fr' | 'pt';

/** A dictionary the app knows about: bundled in the app, downloaded on demand, or not available yet. */
export type Language = {
  code: LanguageCode;
  /** Short tag shown in the pill and on entries: "EN". */
  badge: string;
  /** Name in the language itself: "Français". */
  native: string;
  /** Name in English: "French". */
  english: string;
  /** Distinct spellings, for the Languages screen ("1.3M words"). */
  words?: number;
} & (
  | { kind: 'bundled'; dbName: string }
  /** `size` is the exact byte count of the release asset: it is shown before downloading and checked after. */
  | { kind: 'download'; dbName: string; url: string; size: number }
  | { kind: 'soon' }
);

export type LanguageSettings = { enabled: LanguageCode[]; current: LanguageCode };

/** Progress of a dictionary download, from 0 to 1, or the failure to show. */
export type DownloadState = { progress: number } | { failed: true };
