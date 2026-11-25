import { fireEvent, render, screen } from '@testing-library/react-native';
import { DictionaryEtymology } from './dictionary-etymology';

test('is collapsed until tapped', async () => {
  await render(<DictionaryEtymology text="From Arabic ṣifr." />);
  expect(screen.queryByText('From Arabic ṣifr.')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Etymology Show' }));
  expect(screen.getByText('From Arabic ṣifr.')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Etymology Hide' })).toBeExpanded();
});
