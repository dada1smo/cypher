import { fireEvent, render, screen } from '@testing-library/react-native';
import { DictionaryResultList } from './dictionary-result-list';

test('shows the match count and opens a result', async () => {
  const onOpen = jest.fn();
  const found = { prefix: 'ciph', count: 1234, results: [{ word: 'cipher', pos: ['noun'], gloss: 'A code.' }] };
  await render(<DictionaryResultList found={found} onOpen={onOpen} />);
  expect(screen.getByText('1,234 words start with “ciph”')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'cipher, noun' }));
  expect(onOpen).toHaveBeenCalledWith('cipher');
});

test('uses the singular for one match', async () => {
  const found = { prefix: 'cipherz', count: 1, results: [{ word: 'cipherz', pos: ['noun'], gloss: 'x' }] };
  await render(<DictionaryResultList found={found} onOpen={jest.fn()} />);
  expect(screen.getByText('1 word starts with “cipherz”')).toBeOnTheScreen();
});
