import { Stack } from 'expo-router';
import { LanguagesProvider } from '@/domain/languages/components/languages-provider';
import { colors } from '@/ui/theme/colors';

export default function RootLayout() {
  return (
    <LanguagesProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </LanguagesProvider>
  );
}
