import { render, screen } from '@testing-library/react-native';
import { DictionaryNoResults } from './dictionary-no-results';

test('names the prefix that found nothing', async () => {
  await render(<DictionaryNoResults prefix="cyphr" />);
  expect(screen.getByRole('header', { name: 'No words start with “cyphr”' })).toBeOnTheScreen();
  expect(screen.getByText('Check the spelling, or try fewer letters.')).toBeOnTheScreen();
});
