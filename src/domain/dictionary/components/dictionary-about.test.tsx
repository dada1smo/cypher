import { render, screen } from '@testing-library/react-native';
import { useInfo } from '../hooks/use-info';
import { DictionaryAbout } from './dictionary-about';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('../hooks/use-info');

test('shows database facts and the credits', async () => {
  jest.mocked(useInfo).mockReturnValue({ wordCount: 1234567, builtAt: '2026-11-25' });
  await render(<DictionaryAbout />);
  expect(screen.getByText('1,234,567')).toBeOnTheScreen();
  expect(screen.getByText('2026-11-25')).toBeOnTheScreen();
  expect(screen.getByText(/shared under CC BY-SA 4.0/)).toBeOnTheScreen();
  expect(screen.getByRole('link', { name: 'Source code on GitHub' })).toBeOnTheScreen();
});
