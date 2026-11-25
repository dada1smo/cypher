import { fireEvent, render, screen } from '@testing-library/react-native';
import { DictionarySenseItem } from './dictionary-sense-item';

test('shows number, definition and example, and linked words open their entry', async () => {
  const onOpenWord = jest.fn();
  const sense = {
    n: 2,
    gloss: 'A method of transforming a text.',
    example: 'A simple cipher.',
    links: [{ start: 12, end: 24, target: 'transform' }],
  };
  await render(<DictionarySenseItem sense={sense} onOpenWord={onOpenWord} />);
  expect(screen.getByText('2')).toBeOnTheScreen();
  expect(screen.getByText('“A simple cipher.”')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('link', { name: 'transforming' }));
  expect(onOpenWord).toHaveBeenCalledWith('transform');
});
