import type { DownloadState, Language } from '../types/language';
import { formatSize, formatWords } from './format';

/** The line under a language's name on the Languages screen (DESIGN §6). */
export function languageDetail(language: Language, on: boolean, download?: DownloadState): string {
  if (language.kind === 'soon') return 'Coming soon';
  if (download && 'progress' in download) {
    const size = language.kind === 'download' ? ` of ${formatSize(language.size)}` : '';
    return `Downloading… ${Math.round(download.progress * 100)}%${size}`;
  }
  const words = language.words ? ` · ${formatWords(language.words)}` : '';
  if (language.kind === 'bundled') return `${language.english}${words} · included`;
  return on ? `${language.english}${words} · ${formatSize(language.size)}` : `${language.english} · Download ${formatSize(language.size)}`;
}
