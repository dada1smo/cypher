import { posLabel } from './pos-label';

test('spells out abbreviated parts of speech', () => {
  expect(posLabel('adj')).toBe('adjective');
  expect(posLabel('noun')).toBe('noun');
  expect(posLabel('prep_phrase')).toBe('prep phrase');
});
