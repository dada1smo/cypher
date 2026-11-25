import { fireEvent, render, screen } from '@testing-library/react-native';
import { LinkRow } from './link-row';

test('is a link with its label', async () => {
  const onPress = jest.fn();
  await render(<LinkRow label="Source code on GitHub" onPress={onPress} />);
  await fireEvent.press(screen.getByRole('link', { name: 'Source code on GitHub' }));
  expect(onPress).toHaveBeenCalled();
});
