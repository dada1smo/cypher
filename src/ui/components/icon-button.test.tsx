import { fireEvent, render, screen } from '@testing-library/react-native';
import { IconButton } from './icon-button';

test('is a labelled button', async () => {
  const onPress = jest.fn();
  await render(<IconButton symbol="square.and.arrow.up" label="Share" onPress={onPress} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Share' }));
  expect(onPress).toHaveBeenCalled();
});
