import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/ui/theme/colors';
import { typography } from '@/ui/theme/typography';

/** Offline note and the Wiktionary credit (CC BY-SA) on every screen; the credit opens About. */
export function DictionaryFooter() {
  const router = useRouter();
  return (
    <Text style={[typography.footer, { color: colors.muted, textAlign: 'center' }]}>
      Works offline · Definitions from{' '}
      <Text accessibilityRole="link" onPress={() => router.navigate('/about')} style={{ color: colors.accent }}>
        Wiktionary, CC BY-SA 4.0
      </Text>
    </Text>
  );
}
