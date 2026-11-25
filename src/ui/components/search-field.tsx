import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { typography } from '../theme/typography';

export type SearchFieldProps = {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Search input, focused on open, with a clear (X) button while it has text. There is no Cancel button. */
export function SearchField({ value, placeholder, onChangeText, onSubmit, onClear, style }: SearchFieldProps) {
  return (
    <View style={[styles.field, style]}>
      <SymbolView name="magnifyingglass" size={18} tintColor={colors.muted} />
      <TextInput
        accessibilityLabel="Search"
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={onClear} style={styles.clear}>
          <View style={styles.clearCircle}>
            <SymbolView name="xmark" size={12} weight="bold" tintColor={colors.muted} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2] + 2,
    height: 52,
    paddingLeft: spacing[4],
    paddingRight: spacing[1],
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.accentBorder,
    borderRadius: radius.field,
  },
  input: { ...typography.body, flex: 1, color: colors.ink },
  clear: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center' },
  clearCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
