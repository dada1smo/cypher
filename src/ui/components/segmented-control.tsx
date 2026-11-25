import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutRectangle,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing, touchTarget } from '../theme/spacing';
import { typography } from '../theme/typography';
import { EdgeFade } from './edge-fade';

export type SegmentedControlProps = {
  label: string;
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * iOS-style segmented tabs; `label` names the group for VoiceOver. Labels never wrap: tabs fill the bar
 * when they all fit, otherwise the bar scrolls sideways, keeps the selected tab in view and fades the
 * edges that hide more tabs.
 */
export function SegmentedControl({ label, options, selected, onSelect, style }: SegmentedControlProps) {
  const scroll = useRef<ScrollViewInstance>(null);
  const tabs = useRef<Record<string, LayoutRectangle>>({});
  const [width, setWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  // 2 pt of slack so rounding at either end does not leave a fade showing.
  const fadeLeft = offset > 2;
  const fadeRight = offset + width < contentWidth - 2;

  useEffect(() => {
    const tab = tabs.current[selected];
    // Centering the selected tab always shows it whole; ScrollView clamps at both ends.
    if (tab && width) scroll.current?.scrollTo({ x: Math.max(0, tab.x - (width - tab.width) / 2) });
  }, [selected, width]);

  return (
    <View style={[styles.track, style]}>
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        accessibilityLabel={label}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onContentSizeChange={setContentWidth}
        onScroll={(e) => setOffset(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        {options.map((o) => {
          const isSelected = o.key === selected;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(o.key)}
              onLayout={(e) => (tabs.current[o.key] = e.nativeEvent.layout)}
              style={[styles.tab, isSelected && styles.tabOn]}
            >
              <Text numberOfLines={1} style={[typography.button, { color: isSelected ? colors.ink : colors.muted }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {fadeLeft && <EdgeFade side="left" />}
      {fadeRight && <EdgeFade side="right" />}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', backgroundColor: colors.surface, borderRadius: radius.button },
  content: { flexGrow: 1, gap: spacing[1], padding: spacing[1] },
  tab: {
    flexGrow: 1,
    flexShrink: 0,
    paddingHorizontal: 14,
    minHeight: touchTarget - spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.tab,
  },
  tabOn: {
    backgroundColor: colors.tabOn,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});
