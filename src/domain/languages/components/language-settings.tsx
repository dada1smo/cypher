import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '@/ui/components/back-button';
import { colors } from '@/ui/theme/colors';
import { radius, spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import { LANGUAGES } from '../data/languages';
import { useLanguages } from '../hooks/use-languages';
import { LanguageRow } from './language-row';

/** The Languages screen: turn dictionaries on (downloading them) and off (freeing their space). */
export function LanguageSettings() {
  const router = useRouter();
  const { enabled, downloads, enable, disable, cancel } = useLanguages();
  const onlyOne = enabled.length === 1;
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={router.back} style={styles.back} />
      <Text accessibilityRole="header" style={[typography.screenTitle, { color: colors.ink }]}>
        Languages
      </Text>
      <Text style={[typography.lead, { color: colors.ink }]}>
        Turn on the dictionaries you want on the home screen. Each one works offline once it is on this iPhone.
      </Text>
      <View style={styles.card}>
        {LANGUAGES.map((language, i) => {
          const on = enabled.includes(language.code);
          return (
            <View key={language.code} style={i < LANGUAGES.length - 1 && styles.divider}>
              <LanguageRow
                language={language}
                on={on}
                download={downloads[language.code]}
                locked={on && onlyOne}
                onChange={(value) =>
                  value ? enable(language.code) : downloads[language.code] ? cancel(language.code) : disable(language.code)
                }
                onCancel={() => cancel(language.code)}
              />
            </View>
          );
        })}
      </View>
      <Text style={[typography.meta, { color: colors.muted }]}>
        {onlyOne && 'Keep at least one dictionary on. '}
        Turning a downloaded dictionary off frees its space; turning it on again downloads it again.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[5], paddingHorizontal: spacing[5], paddingBottom: spacing[5] },
  back: { marginLeft: -spacing[1] },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.field },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
});
