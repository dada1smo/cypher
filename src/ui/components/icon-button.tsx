import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { touchTarget } from '../theme/spacing';

export type IconButtonProps = {
  symbol: SFSymbol;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** A 44 × 44 tappable SF Symbol in the accent color. */
export function IconButton({ symbol, label, onPress, style }: IconButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.button, style]}>
      {({ pressed }) => <SymbolView name={symbol} size={22} tintColor={pressed ? colors.accentPressed : colors.accent} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center' },
});
