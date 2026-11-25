import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { Screen } from './screen';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

test('renders the content and the footer', async () => {
  await render(<Screen footer={<Text>Footer</Text>}><Text>Content</Text></Screen>);
  expect(screen.getByText('Content')).toBeOnTheScreen();
  expect(screen.getByText('Footer')).toBeOnTheScreen();
});
