import { DynamicColorIOS, type ColorValue } from 'react-native';

// Values from docs/design/DESIGN.md §1: [light, dark]. The app follows the system appearance.
const palette = {
  bg: ['#FAFAF9', '#111317'],
  ink: ['#16181D', '#ECEDEF'],
  muted: ['#5B606B', '#A3A7B0'],
  surface: ['#EFEFF1', '#1E2128'],
  line: ['#E4E4E7', '#2A2E36'],
  card: ['#FFFFFF', '#1A1D22'],
  tabOn: ['#FFFFFF', '#2C3140'],
  accent: ['#B45309', '#FBBF24'],
  accentPressed: ['#92400E', '#FCD34D'],
  accentBorder: ['#D97706', '#F59E0B'],
  accentSoft: ['#FEF3C7', '#2B2412'],
  // Text on accentSoft (the language pill).
  accentInk: ['#92400E', '#FCD34D'],
  // Language badge (EN, FR).
  badgeBg: ['#FDE68A', '#3A2E12'],
  badgeInk: ['#92400E', '#FBBF24'],
  // Switch track when off.
  switchOff: ['#D4D4D8', '#3A3F4A'],
} as const;

type Token = keyof typeof palette;

/**
 * Colors that switch with the system appearance on their own (iOS dynamic colors), so styles can stay in
 * `StyleSheet.create`. Native views that take plain strings (gradients, SwiftUI) use `colorsFor` instead.
 */
export const colors = Object.fromEntries(
  Object.entries(palette).map(([token, [light, dark]]) => [token, DynamicColorIOS({ light, dark })]),
) as Record<Token, ColorValue>;

/** Plain hex values for one appearance, from `useColorScheme()`. */
export function colorsFor(scheme: 'light' | 'dark' | null | undefined): Record<Token, string> {
  const i = scheme === 'dark' ? 1 : 0;
  return Object.fromEntries(Object.entries(palette).map(([token, pair]) => [token, pair[i]])) as Record<Token, string>;
}
