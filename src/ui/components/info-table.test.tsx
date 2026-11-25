import { render, screen } from '@testing-library/react-native';
import { InfoTable } from './info-table';

test('shows each label with its value', async () => {
  await render(<InfoTable rows={[{ label: 'Words', value: '42' }, { label: 'App version', value: '1.0.0' }]} />);
  expect(screen.getByText('Words')).toBeOnTheScreen();
  expect(screen.getByText('42')).toBeOnTheScreen();
  expect(screen.getByText('1.0.0')).toBeOnTheScreen();
});
