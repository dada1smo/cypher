// kaikki's part-of-speech codes that are abbreviated; the rest are already words ("noun", "verb").
const LABELS: Record<string, string> = {
  adj: 'adjective',
  adv: 'adverb',
  intj: 'interjection',
  prep: 'preposition',
  conj: 'conjunction',
  pron: 'pronoun',
  det: 'determiner',
  num: 'numeral',
  abbrev: 'abbreviation',
  name: 'proper noun',
};

/** "adj" → "adjective", "prep_phrase" → "prep phrase". */
export function posLabel(pos: string): string {
  return LABELS[pos] ?? pos.replace(/_/g, ' ');
}
