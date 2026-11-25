import { Directory, File, Paths, type DownloadTask } from 'expo-file-system';
import type { Language, LanguageCode } from '../types/language';
import { languageOf } from './languages';

// expo-sqlite opens database names from Documents/SQLite, so downloads go there and open by name.
const sqliteDir = () => new Directory(Paths.document, 'SQLite');

function fileOf(language: Language & { kind: 'download' }) {
  return new File(sqliteDir(), language.dbName);
}

/** Whether a dictionary can be opened now: bundled ones always, downloaded ones once their file is here. */
export function isAvailable(code: LanguageCode): boolean {
  const language = languageOf(code);
  if (!language || language.kind === 'soon') return false;
  return language.kind === 'bundled' || fileOf(language).exists;
}

/**
 * Starts downloading a dictionary; call `downloadAsync()` on the result. On iOS the file only appears
 * once the download has finished, so a failed or cancelled one leaves nothing behind.
 */
export function downloadDictionary(
  language: Language & { kind: 'download' },
  onProgress: (fraction: number) => void,
): DownloadTask {
  const dir = sqliteDir();
  if (!dir.exists) dir.create({ intermediates: true });
  return File.createDownloadTask(language.url, fileOf(language), {
    // Typed as number, but iOS sends a BigInt: Number() before any arithmetic.
    onProgress: ({ bytesWritten }) => onProgress(Math.min(Number(bytesWritten) / language.size, 1)),
  });
}

/** Whether a finished download has exactly the published size; a wrong one is deleted. */
export function keepIfComplete(language: Language & { kind: 'download' }): boolean {
  const file = fileOf(language);
  if (file.exists && Number(file.size) === language.size) return true;
  if (file.exists) file.delete();
  return false;
}

export function deleteDictionary(language: Language & { kind: 'download' }) {
  const file = fileOf(language);
  if (file.exists) file.delete();
}
