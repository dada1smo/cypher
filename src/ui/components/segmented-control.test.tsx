import { fireEvent, render, screen } from '@testing-library/react-native';
import { SegmentedControl } from './segmented-control';

test('marks the selected tab and reports a new choice', async () => {
  const onSelect = jest.fn();
  const options = [{ key: 'noun', label: 'Noun · 3' }, { key: 'verb', label: 'Verb · 1' }];
  await render(<SegmentedControl label="Part of speech" options={options} selected="noun" onSelect={onSelect} />);
  expect(screen.getByRole('tab', { name: 'Noun · 3' })).toBeSelected();
  expect(screen.getByRole('tab', { name: 'Verb · 1' })).not.toBeSelected();
  await fireEvent.press(screen.getByRole('tab', { name: 'Verb · 1' }));
  expect(onSelect).toHaveBeenCalledWith('verb');
});
