import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, touchTarget } from '../theme/spacing';
import { typography } from '../theme/typography';

export type BackButtonProps = { onPress: () => void; style?: StyleProp<ViewStyle> };

/** "‹ Back", the way back to the previous screen (which may be another entry). */
export function BackButton({ onPress, style }: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={spacing[2]}
      style={[styles.button, style]}
    >
      {({ pressed }) => {
        const color = pressed ? colors.accentPressed : colors.accent;
        return (
          <>
            <SymbolView name="chevron.left" size={17} tintColor={color} />
            <Text style={[typography.nav, { color }]}>Back</Text>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], minHeight: touchTarget, alignSelf: 'flex-start' },
});
