import { fireEvent, render, screen } from '@testing-library/react-native';
import { BackButton } from './back-button';

test('shows its label and says where it goes', async () => {
  const onPress = jest.fn();
  await render(<BackButton label="Search" onPress={onPress} />);
  expect(screen.getByText('Search')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Back to Search' }));
  expect(onPress).toHaveBeenCalled();
});
