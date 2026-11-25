import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/ui/theme/colors';
import { spacing } from '@/ui/theme/spacing';
import { typography } from '@/ui/theme/typography';
import type { Sense } from '../types/word';
import { splitGloss } from '../utils/split-gloss';

export type DictionarySenseItemProps = { sense: Sense; onOpenWord: (word: string) => void };

/** A numbered definition with its linked words (dotted underline) and an example in italics. */
export function DictionarySenseItem({ sense, onOpenWord }: DictionarySenseItemProps) {
  const [pressed, setPressed] = useState<number | null>(null);
  return (
    <View style={styles.row}>
      <View style={styles.number}>
        <Text style={[typography.badge, { color: colors.muted }]}>{sense.n}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[typography.definition, { color: colors.ink }]}>
          {splitGloss(sense.gloss, sense.links).map((part, i) =>
            part.target ? (
              <Text
                key={i}
                accessibilityRole="link"
                accessibilityHint={`Opens ${part.target}`}
                onPressIn={() => setPressed(i)}
                onPressOut={() => setPressed(null)}
                onPress={() => onOpenWord(part.target!)}
                style={[styles.link, pressed === i && styles.linkPressed]}
              >
                {part.text}
              </Text>
            ) : (
              part.text
            ),
          )}
        </Text>
        {sense.example && <Text style={[typography.example, { color: colors.muted }]}>“{sense.example}”</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing[3] },
  number: {
    width: 22,
    height: 22,
    marginTop: 2,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 6 },
  // React Native has no underline offset: iOS takes it from the font, so the embedded Fraunces.ttf has its
  // underlinePosition raised (README). shortcut: thickness stays the system's, not the design's 1.5.
  link: { textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: colors.link },
  linkPressed: { backgroundColor: colors.accentSoft },
});
