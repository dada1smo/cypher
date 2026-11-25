import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { DbProvider } from '@/global/db/db-provider';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import { isAvailable } from '../data/dictionary-files';
import { languageOf } from '../data/languages';
import { DictionaryLanguageContext } from '../hooks/languages-context';
import type { LanguageCode } from '../types/language';

const EN_ASSET = { assetId: require('../../../../assets/cypher-en.db') };

export type DictionaryDbProps = { code: LanguageCode; children: ReactNode };

/**
 * Opens one language's dictionary for the screen below it. A dictionary that is not on the phone is not
 * opened: expo-sqlite would create an empty file under its name.
 */
export function DictionaryDb({ code, children }: DictionaryDbProps) {
  const language = languageOf(code);
  if (!language || language.kind === 'soon' || !isAvailable(code)) {
    return (
      <Text style={[typography.bodySmall, styles.missing]}>
        The {language?.english ?? code} dictionary is not on this iPhone. Turn it on in Languages, from About.
      </Text>
    );
  }
  return (
    <DbProvider
      key={code}
      databaseName={language.dbName}
      assetSource={language.kind === 'bundled' ? EN_ASSET : undefined}
    >
      <DictionaryLanguageContext.Provider value={code}>{children}</DictionaryLanguageContext.Provider>
    </DbProvider>
  );
}

const styles = StyleSheet.create({
  missing: { color: colors.muted, padding: spacing[5] },
});
