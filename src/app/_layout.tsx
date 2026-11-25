import { Stack } from 'expo-router';
import { DbProvider } from '@/global/db/db-provider';

export default function RootLayout() {
  return (
    <DbProvider>
      <Stack />
    </DbProvider>
  );
}
