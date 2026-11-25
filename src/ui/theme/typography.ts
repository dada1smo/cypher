import type { TextStyle } from 'react-native';

// Fraunces always uses its SOFT axis at 100 (rounded serifs); the weight goes in the same setting
// because fontVariationSettings overrides fontWeight. Fonts are embedded by the expo-font plugin (app.json).
const fraunces = (weight: 400 | 600): TextStyle => ({
  fontFamily: 'Fraunces',
  fontVariationSettings: `'SOFT' 100, 'wght' ${weight}`,
});
const archivo: TextStyle = { fontFamily: 'Archivo' };

// Styles from docs/design/DESIGN.md §1, Tipografia.
export const typography = {
  entryWord: { ...fraunces(600), fontSize: 44, letterSpacing: -0.8 },
  screenTitle: { ...fraunces(600), fontSize: 34, letterSpacing: -0.5 },
  stateTitle: { ...fraunces(600), fontSize: 26 },
  definition: { ...fraunces(400), fontSize: 18, lineHeight: 26 },
  listWord: { ...fraunces(400), fontSize: 20 },
  listWordStrong: { ...fraunces(600), fontSize: 20 },
  posInline: { ...fraunces(400), fontSize: 16, fontStyle: 'italic' },
  body: { ...archivo, fontSize: 17 },
  lead: { ...archivo, fontSize: 16, lineHeight: 24 },
  nav: { ...archivo, fontSize: 16 },
  bodySmall: { ...archivo, fontSize: 15, lineHeight: 22 },
  button: { ...archivo, fontSize: 15, fontWeight: '500' },
  example: { ...archivo, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  sectionLabel: { ...archivo, fontSize: 13, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  meta: { ...archivo, fontSize: 13 },
  metaMedium: { ...archivo, fontSize: 13, fontWeight: '500' },
  tag: { ...archivo, fontSize: 11, fontWeight: '600', letterSpacing: 0.6 },
  pill: { ...archivo, fontSize: 15, fontWeight: '600' },
  rowTitle: { ...archivo, fontSize: 17, fontWeight: '500' },
  snippet: { ...archivo, fontSize: 14, lineHeight: 20 },
  badge: { ...archivo, fontSize: 12, fontWeight: '600' },
  footer: { ...archivo, fontSize: 12, lineHeight: 20 },
} satisfies Record<string, TextStyle>;
