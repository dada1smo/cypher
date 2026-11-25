import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { typography } from '../theme/typography';

export type SegmentedControlProps = {
  label: string;
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

/** iOS-style segmented tabs; `label` names the group for VoiceOver. */
export function SegmentedControl({ label, options, selected, onSelect, style }: SegmentedControlProps) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={[styles.track, style]}>
      {options.map((o) => {
        const isSelected = o.key === selected;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(o.key)}
            style={[styles.tab, isSelected && styles.tabOn]}
          >
            <Text style={[typography.button, { color: isSelected ? colors.ink : colors.muted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: spacing[1], padding: spacing[1], backgroundColor: colors.surface, borderRadius: radius.button },
  tab: { flex: 1, minHeight: touchTarget - spacing[1], alignItems: 'center', justifyContent: 'center', borderRadius: radius.tab },
  tabOn: {
    backgroundColor: colors.tabOn,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});
