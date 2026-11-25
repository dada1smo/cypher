import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type InfoTableProps = { rows: { label: string; value: string }[]; style?: StyleProp<ViewStyle> };

/** A card of label / value rows. */
export function InfoTable({ rows, style }: InfoTableProps) {
  return (
    <View style={[styles.card, style]}>
      {rows.map((r, i) => (
        <View key={r.label} style={[styles.row, i < rows.length - 1 && styles.divider]}>
          <Text style={[typography.bodySmall, { color: colors.ink }]}>{r.label}</Text>
          <Text style={[typography.bodySmall, { color: colors.muted }]}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.field },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: spacing[4] },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
});
