import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export type ProgressBarProps = { progress: number; label: string; style?: StyleProp<ViewStyle> };

/** A thin bar from 0 to 1; `label` names it for VoiceOver. */
export function ProgressBar({ progress, label, style }: ProgressBarProps) {
  const now = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now }}
      style={[styles.track, style]}
    >
      <View style={[styles.fill, { width: `${now}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: colors.accentSoft, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accentBorder },
});
