import { splitGloss } from './split-gloss';

test('cuts a definition into plain and linked parts', () => {
  expect(splitGloss('A young dog, a pup.', [
    { start: 8, end: 11, target: 'dog' },
    { start: 15, end: 18, target: 'pup' },
  ])).toEqual([
    { text: 'A young ' },
    { text: 'dog', target: 'dog' },
    { text: ', a ' },
    { text: 'pup', target: 'pup' },
    { text: '.' },
  ]);
});

test('keeps all the text when a link is out of range or overlaps', () => {
  const parts = splitGloss('A dog.', [
    { start: 2, end: 5, target: 'dog' },
    { start: 3, end: 4, target: 'o' },
    { start: 4, end: 99, target: 'bad' },
  ]);
  expect(parts.map((p) => p.text).join('')).toBe('A dog.');
  expect(parts.filter((p) => p.target)).toEqual([{ text: 'dog', target: 'dog' }]);
});

test('uses UTF-16 offsets, like the database', () => {
  expect(splitGloss('🐕 dog', [{ start: 3, end: 6, target: 'dog' }])).toEqual([
    { text: '🐕 ' },
    { text: 'dog', target: 'dog' },
  ]);
});
