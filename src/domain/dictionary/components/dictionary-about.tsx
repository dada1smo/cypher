import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '@/ui/components/back-button';
import { InfoTable } from '@/ui/components/info-table';
import { LinkRow } from '@/ui/components/link-row';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import { useInfo } from '../hooks/use-info';

const SOURCE_URL = 'https://github.com/dada1smo/cypher';

/** About and credits: database facts, Wiktionary / kaikki attribution (CC BY-SA 4.0) and the code license. */
export function DictionaryAbout() {
  const router = useRouter();
  const info = useInfo();
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton label="Back" onPress={router.back} style={styles.back} />
      <Text accessibilityRole="header" style={[typography.screenTitle, { color: colors.ink }]}>
        About Cypher
      </Text>
      <Text style={[typography.lead, { color: colors.ink }]}>
        An offline English dictionary. Every word lives on your phone: no account, no network, no tracking.
      </Text>
      <InfoTable
        rows={[
          { label: 'Words', value: info?.wordCount?.toLocaleString('en-US') ?? '—' },
          { label: 'Data built', value: info?.builtAt ?? '—' },
          { label: 'App version', value: Constants.expoConfig?.version ?? '—' },
        ]}
      />
      <View style={styles.credits}>
        <Text accessibilityRole="header" style={[typography.sectionLabel, { color: colors.muted }]}>
          Credits
        </Text>
        <Text style={[typography.bodySmall, { color: colors.ink }]}>
          Definitions come from Wiktionary, extracted by kaikki.org (wiktextract), and are shared under CC BY-SA 4.0.
        </Text>
        <Text style={[typography.bodySmall, { color: colors.ink }]}>App code is open source under the MIT license.</Text>
      </View>
      <LinkRow label="Source code on GitHub" onPress={() => Linking.openURL(SOURCE_URL)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[5], paddingHorizontal: spacing[5], paddingBottom: spacing[5] },
  back: { marginLeft: -spacing[1] },
  credits: { gap: spacing[2] },
});
