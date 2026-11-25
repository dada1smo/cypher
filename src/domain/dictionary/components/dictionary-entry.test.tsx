import { fireEvent, render, screen } from '@testing-library/react-native';
import { useOpenWord } from '../hooks/use-open-word';
import { useWord } from '../hooks/use-word';
import { DictionaryEntry } from './dictionary-entry';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('../hooks/use-word');
jest.mock('../hooks/use-open-word');
const newSearch = jest.fn();
jest.mocked(useOpenWord).mockReturnValue({ open: jest.fn(), openRandom: jest.fn(), newSearch });
const mockUseWord = jest.mocked(useWord);

const sense = (n: number, gloss: string) => ({ n, gloss, example: null, links: [] });

test('several parts of speech: tabs switch the definitions', async () => {
  mockUseWord.mockReturnValue({
    word: 'cipher',
    ipa: '/ˈsaɪfə/',
    etymology: null,
    groups: [
      { pos: 'noun', senses: [sense(1, 'A code.'), sense(2, 'A zero.')] },
      { pos: 'verb', senses: [sense(1, 'To calculate.')] },
    ],
  });
  await render(<DictionaryEntry word="cipher" />);
  expect(screen.getByRole('header', { name: 'cipher' })).toBeOnTheScreen();
  expect(screen.getByText('A code.')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('tab', { name: 'Verb · 1' }));
  expect(screen.getByText('To calculate.')).toBeOnTheScreen();
  expect(screen.queryByText('A code.')).toBeNull();
});

test('one part of speech: no tabs, the class leads the pronunciation line', async () => {
  mockUseWord.mockReturnValue({
    word: 'sonder',
    ipa: '/ˈsɒndə/',
    etymology: 'Coined in 2012.',
    groups: [{ pos: 'noun', senses: [sense(1, 'A realization.')] }],
  });
  await render(<DictionaryEntry word="sonder" />);
  expect(screen.queryByRole('tab')).toBeNull();
  expect(screen.getByText('noun · /ˈsɒndə/')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Etymology Show' })).toBeOnTheScreen();
});

test('a missing word says so', async () => {
  mockUseWord.mockReturnValue(null);
  await render(<DictionaryEntry word="zzzq" />);
  expect(screen.getByText('“zzzq” is not in the dictionary.')).toBeOnTheScreen();
});

test('the search button starts a new search', async () => {
  mockUseWord.mockReturnValue({ word: 'sonder', ipa: null, etymology: null, groups: [{ pos: 'noun', senses: [sense(1, 'A realization.')] }] });
  await render(<DictionaryEntry word="sonder" />);
  await fireEvent.press(screen.getByRole('button', { name: 'New search' }));
  expect(newSearch).toHaveBeenCalled();
});

test('the entry says which dictionary it is from', async () => {
  mockUseWord.mockReturnValue({ word: 'sonder', ipa: null, etymology: null, groups: [{ pos: 'noun', senses: [sense(1, 'A realization.')] }] });
  await render(<DictionaryEntry word="sonder" />);
  expect(screen.getByLabelText('Dictionary: English')).toBeOnTheScreen();
});
