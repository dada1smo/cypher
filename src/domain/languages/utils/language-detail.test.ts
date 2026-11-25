import { LANGUAGES } from '../data/languages';
import { languageDetail } from './language-detail';

const [en, fr, pt] = LANGUAGES;

test('status lines from the design', () => {
  expect(languageDetail(en, true)).toBe('English · 1.3M words · included');
  expect(languageDetail(fr, false)).toBe('French · Download 484 MB');
  expect(languageDetail(fr, false, { progress: 0.424 })).toBe('Downloading… 42% of 484 MB');
  expect(languageDetail(fr, true)).toBe('French · 2.0M words · 484 MB');
  expect(languageDetail(fr, false, { failed: true })).toBe('French · Download 484 MB');
  expect(languageDetail(pt, false)).toBe('Coming soon');
});
