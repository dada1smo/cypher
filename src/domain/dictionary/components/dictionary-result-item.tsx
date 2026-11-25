import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import type { SearchResult } from '../types/word';
import { posLabel } from '../utils/pos-label';

export type DictionaryResultItemProps = { result: SearchResult; prefix: string; onPress: () => void };

/** One search result: the typed prefix in bold, parts of speech and the first definition on one line. */
export function DictionaryResultItem({ result, prefix, onPress }: DictionaryResultItemProps) {
  const pos = result.pos.map(posLabel).join(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${result.word}, ${pos}`}
      accessibilityHint={result.gloss}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.head}>
        <Text style={[typography.listWord, { color: colors.ink }]}>
          <Text style={typography.listWordStrong}>{result.word.slice(0, prefix.length)}</Text>
          {result.word.slice(prefix.length)}
        </Text>
        <Text style={[typography.meta, { color: colors.muted }]}>{pos}</Text>
      </View>
      <Text numberOfLines={1} style={[typography.snippet, { color: colors.muted }]}>
        {result.gloss}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: 3, paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.line },
  pressed: { backgroundColor: colors.accentSoft },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[2] + 2 },
});
