import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type LinkRowProps = { label: string; onPress: () => void; style?: StyleProp<ViewStyle> };

/** A card-styled row that opens something, with a chevron. */
export function LinkRow({ label, onPress, style }: LinkRowProps) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={[styles.row, style]}>
      <Text style={[typography.bodySmall, { color: colors.ink }]}>{label}</Text>
      <SymbolView name="chevron.right" size={14} tintColor={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.field,
  },
});
