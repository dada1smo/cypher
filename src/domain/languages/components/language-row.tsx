import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ProgressBar } from '@/ui/components/progress-bar';
import { colors } from '@/ui/theme/colors';
import { radius, spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import type { DownloadState, Language } from '../types/language';
import { languageDetail } from '../utils/language-detail';

export type LanguageRowProps = {
  language: Language;
  on: boolean;
  download?: DownloadState;
  /** The last enabled language cannot be turned off. */
  locked: boolean;
  onChange: (on: boolean) => void;
  onCancel: () => void;
};

/** One dictionary on the Languages screen: badge, names, status line and its switch. */
export function LanguageRow({ language, on, download, locked, onChange, onCancel }: LanguageRowProps) {
  const soon = language.kind === 'soon';
  const downloading = !!download && 'progress' in download;
  const failed = !!download && 'failed' in download;
  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Text style={[typography.tag, styles.badge, soon && styles.badgeSoon]}>{language.badge}</Text>
        <View style={styles.names}>
          <Text style={[typography.rowTitle, { color: soon ? colors.muted : colors.ink }]}>{language.native}</Text>
          <Text style={[typography.meta, { color: colors.muted }]}>{languageDetail(language, on, download)}</Text>
          {failed && <Text style={[typography.meta, { color: colors.accent }]}>Download failed. Try again.</Text>}
        </View>
        {!soon && (
          <Switch
            accessibilityLabel={language.english}
            value={on || downloading}
            disabled={locked}
            onValueChange={onChange}
            trackColor={{ true: colors.accentBorder, false: colors.switchOff }}
            style={locked && styles.locked}
          />
        )}
      </View>
      {downloading && (
        <View style={styles.progress}>
          <ProgressBar progress={download.progress} label={`Downloading ${language.english}`} style={styles.bar} />
          <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={spacing[2]}>
            <Text style={[typography.meta, { color: colors.accent }]}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing[2], paddingVertical: spacing[3], paddingHorizontal: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  names: { flex: 1, gap: 2 },
  badge: {
    color: colors.accentInk,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.badge,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeSoon: { color: colors.muted, backgroundColor: colors.surface },
  locked: { opacity: 0.5 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  bar: { flex: 1 },
});
