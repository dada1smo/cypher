import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type SoftButtonProps = { label: string; symbol: SFSymbol; onPress: () => void; style?: StyleProp<ViewStyle> };

/** Wide secondary button on the soft accent background ("Random word"). */
export function SoftButton({ label, symbol, onPress, style }: SoftButtonProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, style]}>
      {({ pressed }) => {
        const color = pressed ? colors.accentPressed : colors.ink;
        return (
          <>
            <SymbolView name={symbol} size={18} tintColor={color} />
            <Text style={[typography.button, { color }]}>{label}</Text>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: 48,
    borderRadius: radius.button,
    backgroundColor: colors.accentSoft,
  },
});
