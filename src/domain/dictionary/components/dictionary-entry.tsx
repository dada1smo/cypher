import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '@/ui/components/back-button';
import { IconButton } from '@/ui/components/icon-button';
import { SegmentedControl } from '@/ui/components/segmented-control';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import { useOpenWord } from '../hooks/use-open-word';
import { useWord } from '../hooks/use-word';
import { posLabel } from '../utils/pos-label';
import { DictionaryEtymology } from './dictionary-etymology';
import { DictionarySenseItem } from './dictionary-sense-item';

export type DictionaryEntryProps = { word: string };

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A word's page: pronunciation, definitions by part of speech (tabs only if more than one), etymology. */
export function DictionaryEntry({ word }: DictionaryEntryProps) {
  const entry = useWord(word);
  const router = useRouter();
  const { open, newSearch } = useOpenWord();
  const [selectedPos, setSelectedPos] = useState<string>();
  const group = entry?.groups.find((g) => g.pos === selectedPos) ?? entry?.groups[0];
  const hasTabs = (entry?.groups.length ?? 0) > 1;

  return (
    <View style={styles.screen}>
      <View style={styles.bar}>
        <BackButton onPress={router.back} />
        <View style={styles.actions}>
          <IconButton symbol="magnifyingglass" label="New search" onPress={newSearch} />
          {entry && (
            <IconButton
              symbol="square.and.arrow.up"
              label="Share"
              onPress={() => Share.share({ message: `${entry.word}: ${entry.groups[0].senses[0].gloss}` })}
            />
          )}
        </View>
      </View>
      {entry === null && (
        <Text style={[typography.bodySmall, styles.missing]}>“{word}” is not in the dictionary.</Text>
      )}
      {entry && group && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={[typography.entryWord, { color: colors.ink }]}>
              {entry.word}
            </Text>
            {(!hasTabs || entry.ipa) && (
              <Text style={[typography.nav, { color: colors.muted }]}>
                {!hasTabs && <Text style={[typography.posInline, { color: colors.ink }]}>{posLabel(group.pos)}</Text>}
                {!hasTabs && entry.ipa && ' · '}
                {entry.ipa}
              </Text>
            )}
          </View>
          {hasTabs && (
            <SegmentedControl
              label="Part of speech"
              options={entry.groups.map((g) => ({ key: g.pos, label: `${capitalize(posLabel(g.pos))} · ${g.senses.length}` }))}
              selected={group.pos}
              onSelect={setSelectedPos}
            />
          )}
          <View style={styles.senses}>
            {group.senses.map((s) => (
              <DictionarySenseItem key={s.n} sense={s} onOpenWord={open} />
            ))}
          </View>
          {entry.etymology && <DictionaryEtymology text={entry.etymology} />}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  actions: { flexDirection: 'row' },
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[3] },
  content: { gap: 18, paddingHorizontal: spacing[5], paddingTop: spacing[2], paddingBottom: spacing[6] },
  header: { gap: spacing[1] },
  senses: { gap: spacing[4] },
  missing: { color: colors.muted, paddingHorizontal: spacing[5], paddingTop: spacing[6] },
});
