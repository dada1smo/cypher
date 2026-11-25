/** @jest-environment node */
import { createTestDb } from '@/global/db/test-db';
import { getWord } from './get-word';

const db = createTestDb(`
  INSERT INTO words (id, word, pos, ipa, etymology) VALUES
    (1, 'dog', 'noun', NULL, 'From Old English.'), (2, 'dog', 'verb', '/dɒɡ/', 'From Old English.'),
    (3, 'dog', 'noun', NULL, 'From slang.'), (4, 'DOG', 'noun', NULL, NULL);
  INSERT INTO senses (word_id, n, gloss, example, links) VALUES
    (1, 1, 'A mammal.', 'The dog barked.', '[[2, 8, "mammal"]]'), (2, 1, 'To follow.', NULL, NULL),
    (3, 1, 'A bad person.', NULL, NULL), (4, 1, 'Initialism.', NULL, NULL);
`);

test('groups senses of the exact spelling by part of speech', async () => {
  expect(await getWord(db, 'dog')).toEqual({
    word: 'dog',
    ipa: '/dɒɡ/',
    etymology: 'From Old English.\n\nFrom slang.',
    groups: [
      {
        pos: 'noun',
        senses: [
          { n: 1, gloss: 'A mammal.', example: 'The dog barked.', links: [{ start: 2, end: 8, target: 'mammal' }] },
          { n: 2, gloss: 'A bad person.', example: null, links: [] },
        ],
      },
      { pos: 'verb', senses: [{ n: 1, gloss: 'To follow.', example: null, links: [] }] },
    ],
  });
});

test('is null for a missing word, and "DOG" is not "dog"', async () => {
  expect(await getWord(db, 'cat')).toBeNull();
  expect((await getWord(db, 'DOG'))?.groups[0].senses[0].gloss).toBe('Initialism.');
});
