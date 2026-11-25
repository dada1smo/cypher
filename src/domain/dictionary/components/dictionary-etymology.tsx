import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';

export type DictionaryEtymologyProps = { text: string };

/** Etymology, collapsed by default. */
export function DictionaryEtymology({ text }: DictionaryEtymologyProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View style={styles.box}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(!isOpen)}
        style={styles.toggle}
      >
        <Text style={[typography.bodySmall, styles.label]}>Etymology</Text>
        <Text style={[typography.bodySmall, { color: colors.muted }]}>{isOpen ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {isOpen && <Text style={[typography.bodySmall, styles.text]}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing[1] },
  toggle: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.ink, fontWeight: '600' },
  text: { color: colors.muted, marginBottom: spacing[2] },
});
