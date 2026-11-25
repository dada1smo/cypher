import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type ScreenProps = { children: ReactNode; footer?: ReactNode };

/**
 * Full-screen page with the top safe area and an optional footer pinned to the bottom.
 * There is no KeyboardAvoidingView on purpose: the keyboard covers the footer (docs/design/DESIGN.md §2).
 */
export function Screen({ children, footer }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.content}>{children}</View>
      {footer && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing[2] + 2) }]}>{footer}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  footer: {
    paddingTop: spacing[2] + 2,
    paddingHorizontal: spacing[5],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
});
