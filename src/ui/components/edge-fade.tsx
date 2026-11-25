import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// DESIGN.md: 32 wide, solid surface for the first 15%, then transparent.
const FADE_COLORS = [colors.surface, `${colors.surface}00`] as const;
const FADE_STOPS = [0.15, 1] as const;

export type EdgeFadeProps = { side: 'left' | 'right' };

/** Fades the `surface` color out over one edge of a scrolling bar, to show more content is hidden there. */
export function EdgeFade({ side }: EdgeFadeProps) {
  const left = side === 'left';
  return (
    <LinearGradient
      pointerEvents="none"
      colors={FADE_COLORS}
      locations={FADE_STOPS}
      start={{ x: left ? 0 : 1, y: 0 }}
      end={{ x: left ? 1 : 0, y: 0 }}
      style={[styles.fade, left ? { left: 0 } : { right: 0 }]}
    />
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', top: 0, bottom: 0, width: 32 },
});
