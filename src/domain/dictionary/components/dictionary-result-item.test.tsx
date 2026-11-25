import { fireEvent, render, screen } from '@testing-library/react-native';
import { DictionaryResultItem } from './dictionary-result-item';

test('shows the word, spelled-out parts of speech and the first definition', async () => {
  const onPress = jest.fn();
  const result = { word: 'cipher', pos: ['noun', 'adj'], gloss: 'A method of transforming a text.' };
  await render(<DictionaryResultItem result={result} prefix="ciph" onPress={onPress} />);
  expect(screen.getByText('noun · adjective')).toBeOnTheScreen();
  expect(screen.getByText('A method of transforming a text.')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'cipher, noun · adjective' }));
  expect(onPress).toHaveBeenCalled();
});
