import { fireEvent, render, screen } from '@testing-library/react-native';
import { DictionaryFooter } from './dictionary-footer';

const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: mockNavigate }) }));

test('credits Wiktionary and opens About', async () => {
  await render(<DictionaryFooter />);
  await fireEvent.press(screen.getByRole('link', { name: 'Wiktionary, CC BY-SA 4.0' }));
  expect(mockNavigate).toHaveBeenCalledWith('/about');
});
