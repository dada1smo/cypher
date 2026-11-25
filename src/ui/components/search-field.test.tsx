import { fireEvent, render, screen } from '@testing-library/react-native';
import { SearchField } from './search-field';

const props = { placeholder: 'Search a word', onChangeText: jest.fn(), onSubmit: jest.fn(), onClear: jest.fn() };

test('reports typing and submit', async () => {
  await render(<SearchField {...props} value="" />);
  await fireEvent.changeText(screen.getByPlaceholderText('Search a word'), 'cip');
  await fireEvent(screen.getByPlaceholderText('Search a word'), 'submitEditing');
  expect(props.onChangeText).toHaveBeenCalledWith('cip');
  expect(props.onSubmit).toHaveBeenCalled();
});

test('shows the clear button only with text', async () => {
  const { rerender } = await render(<SearchField {...props} value="" />);
  expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  await rerender(<SearchField {...props} value="cip" />);
  await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
  expect(props.onClear).toHaveBeenCalled();
});
