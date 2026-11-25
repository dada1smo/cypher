import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/ui/theme/colors';
import { radius } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import { languageOf } from '../data/languages';
import type { LanguageCode } from '../types/language';

export type LanguageTagProps = { code: LanguageCode };

/** "EN English" above an entry's word: which dictionary this is. Informative only, not a button. */
export function LanguageTag({ code }: LanguageTagProps) {
  const language = languageOf(code);
  if (!language) return null;
  return (
    <View accessible accessibilityLabel={`Dictionary: ${language.english}`} style={styles.tag}>
      <Text style={[typography.tag, styles.badge]}>{language.badge}</Text>
      <Text style={[typography.metaMedium, { color: colors.muted }]}>{language.native}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 4 },
  badge: {
    color: colors.badgeInk,
    backgroundColor: colors.badgeBg,
    borderRadius: radius.badge,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});
