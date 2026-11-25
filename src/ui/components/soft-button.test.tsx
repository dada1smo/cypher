import { fireEvent, render, screen } from '@testing-library/react-native';
import { SoftButton } from './soft-button';

test('is a button with its label', async () => {
  const onPress = jest.fn();
  await render(<SoftButton label="Random word" symbol="dice" onPress={onPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Random word' }));
  expect(onPress).toHaveBeenCalled();
});
