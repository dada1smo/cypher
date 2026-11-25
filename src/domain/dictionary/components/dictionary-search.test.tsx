import { fireEvent, render, screen } from '@testing-library/react-native';
import { useOpenWord } from '../hooks/use-open-word';
import { useSearch } from '../hooks/use-search';
import { DictionarySearch } from './dictionary-search';

jest.mock('../hooks/use-search');
jest.mock('../hooks/use-open-word');
const mockUseSearch = jest.mocked(useSearch);
const open = jest.fn();
const openRandom = jest.fn();
jest.mocked(useOpenWord).mockReturnValue({ open, openRandom });

const field = () => screen.getByPlaceholderText('Search a word');

test('empty: shows the title and Random word', async () => {
  mockUseSearch.mockReturnValue(null);
  await render(<DictionarySearch />);
  expect(screen.getByRole('header', { name: 'Cypher' })).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Random word' }));
  expect(openRandom).toHaveBeenCalled();
});

test('typing: searches the trimmed text, lists results and Return opens the first', async () => {
  mockUseSearch.mockImplementation((prefix) =>
    prefix ? { prefix, count: 2, results: [{ word: 'cipher', pos: ['noun'], gloss: 'A code.' }] } : null,
  );
  await render(<DictionarySearch />);
  await fireEvent.changeText(field(), ' ciph ');
  expect(mockUseSearch).toHaveBeenLastCalledWith('ciph');
  expect(screen.queryByRole('header', { name: 'Cypher' })).toBeNull();
  expect(screen.getByText('2 words start with “ciph”')).toBeOnTheScreen();
  await fireEvent(field(), 'submitEditing');
  expect(open).toHaveBeenCalledWith('cipher');
});

test('no match: shows the empty state, and X goes back to the start', async () => {
  mockUseSearch.mockImplementation((prefix) => (prefix ? { prefix, count: 0, results: [] } : null));
  await render(<DictionarySearch />);
  await fireEvent.changeText(field(), 'cyphr');
  expect(screen.getByRole('header', { name: 'No words start with “cyphr”' })).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByRole('header', { name: 'Cypher' })).toBeOnTheScreen();
});
