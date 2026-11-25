import { FlatList, StyleSheet, Text } from 'react-native';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import type { SearchResults } from '../types/word';
import { DictionaryResultItem } from './dictionary-result-item';

export type DictionaryResultListProps = { found: SearchResults; onOpen: (word: string) => void };

/** "N words start with “abc”" and the first page of matches. Dragging the list closes the keyboard. */
export function DictionaryResultList({ found, onOpen }: DictionaryResultListProps) {
  const noun = found.count === 1 ? 'word starts' : 'words start';
  return (
    <FlatList
      data={found.results}
      keyExtractor={(r) => r.word}
      renderItem={({ item }) => (
        <DictionaryResultItem result={item} prefix={found.prefix} onPress={() => onOpen(item.word)} />
      )}
      ListHeaderComponent={
        <Text style={[typography.meta, styles.count]}>
          {found.count.toLocaleString('en-US')} {noun} with “{found.prefix}”
        </Text>
      }
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing[5] },
  count: { color: colors.muted, paddingTop: spacing[1], paddingBottom: spacing[2] },
});
