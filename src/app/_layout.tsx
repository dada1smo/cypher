import { Stack } from 'expo-router';
import { DbProvider } from '@/global/db/db-provider';
import { colors } from '@/ui/theme/colors';

export default function RootLayout() {
  return (
    <DbProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </DbProvider>
  );
}
