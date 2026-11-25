import { fireEvent, render, screen } from '@testing-library/react-native';
import { BackButton } from './back-button';

test('shows its label and says where it goes', async () => {
  const onPress = jest.fn();
  await render(<BackButton onPress={onPress} />);
  expect(screen.getByText('Back')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  expect(onPress).toHaveBeenCalled();
});
