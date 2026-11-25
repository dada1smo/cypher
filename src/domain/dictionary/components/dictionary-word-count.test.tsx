import { render, screen } from '@testing-library/react-native';
import { useWordCount } from '../hooks/use-word-count';
import { DictionaryWordCount } from './dictionary-word-count';

jest.mock('../hooks/use-word-count');
const mockUseWordCount = jest.mocked(useWordCount);

test('shows a loading message until the count arrives', async () => {
  mockUseWordCount.mockReturnValue(null);
  await render(<DictionaryWordCount />);
  expect(screen.getByText('Abrindo o dicionário…')).toBeOnTheScreen();
});

test('shows the number of words', async () => {
  mockUseWordCount.mockReturnValue(42);
  await render(<DictionaryWordCount />);
  expect(screen.getByText('42 palavras')).toBeOnTheScreen();
});
