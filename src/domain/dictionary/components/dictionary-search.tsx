import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { SearchField } from '@/ui/components/search-field';
import { SoftButton } from '@/ui/components/soft-button';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import { useOpenWord } from '../hooks/use-open-word';
import { useSearch } from '../hooks/use-search';
import { DictionaryNoResults } from './dictionary-no-results';
import { DictionaryResultList } from './dictionary-result-list';

/** The home screen: title and Random word while empty, prefix results while typing. */
export function DictionarySearch() {
  const [query, setQuery] = useState('');
  const prefix = query.trim();
  const found = useSearch(prefix);
  const { open, openRandom } = useOpenWord();
  const first = found?.prefix === prefix ? found.results[0] : undefined;

  return (
    <View style={styles.screen}>
      {!prefix && (
        <Text accessibilityRole="header" style={[typography.screenTitle, styles.title]}>
          Cypher
        </Text>
      )}
      <SearchField
        value={query}
        placeholder="Search a word"
        onChangeText={setQuery}
        onSubmit={() => first && open(first.word)}
        onClear={() => setQuery('')}
        style={styles.field}
      />
      {!prefix && (
        // The field opens focused, so the keyboard hides Random word and the footer: tapping the empty area closes it.
        <Pressable accessible={false} onPress={Keyboard.dismiss} style={styles.empty}>
          <SoftButton label="Random word" symbol="dice" onPress={openRandom} style={styles.random} />
        </Pressable>
      )}
      {found && found.count > 0 && <DictionaryResultList found={found} onOpen={open} />}
      {found?.prefix === prefix && found.count === 0 && <DictionaryNoResults prefix={prefix} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: spacing[3] },
  title: { color: colors.ink, paddingHorizontal: spacing[5], paddingTop: spacing[6], paddingBottom: spacing[7] },
  field: { marginHorizontal: spacing[5], marginBottom: spacing[3] },
  empty: { flex: 1 },
  random: { marginHorizontal: spacing[5], marginTop: 'auto', marginBottom: spacing[5] },
});
