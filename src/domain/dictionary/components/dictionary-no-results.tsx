import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';

export type DictionaryNoResultsProps = { prefix: string };

/** Empty search state. "Did you mean" and searching inside definitions come later (PLANO m4). */
export function DictionaryNoResults({ prefix }: DictionaryNoResultsProps) {
  return (
    <View style={styles.box}>
      <Text accessibilityRole="header" style={[typography.stateTitle, { color: colors.ink }]}>
        No words start with “{prefix}”
      </Text>
      <Text style={[typography.bodySmall, { color: colors.muted }]}>Check the spelling, or try fewer letters.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing[2], paddingTop: spacing[6], paddingHorizontal: spacing[5] },
});
