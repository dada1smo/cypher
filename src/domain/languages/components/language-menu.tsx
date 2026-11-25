import { Button, Divider, HStack, Host, Image, Menu, Text, Toggle } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  background,
  font,
  foregroundStyle,
  frame,
  menuIndicator,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { colorsFor } from '@/ui/theme/colors';
import { radius } from '@/ui/theme/spacing';
import { languageOf } from '../data/languages';
import { useLanguages } from '../hooks/use-languages';

/**
 * The language pill next to the home title, opening the native iOS menu: one item per enabled language
 * (checked: the current one) and "Manage languages…". Shown even with one language: it is the way to add others.
 */
export function LanguageMenu() {
  const router = useRouter();
  const { enabled, current, select } = useLanguages();
  // SwiftUI views take plain strings, not dynamic colors: pick the appearance here.
  const colors = colorsFor(useColorScheme());
  const language = languageOf(current);
  if (!language) return null;

  const archivo = (size: number) => font({ family: 'Archivo', size, weight: 'semibold' });
  const pill = (
    <HStack
      spacing={6}
      modifiers={[
        padding({ leading: 8, trailing: 14 }),
        frame({ height: 44 }),
        background(colors.accentSoft, shapes.capsule()),
        accessibilityLabel(`Dictionary: ${language.english}. Change language`),
      ]}
    >
      <Text
        modifiers={[
          archivo(11),
          foregroundStyle(colors.badgeInk),
          padding({ horizontal: 5, vertical: 2 }),
          background(colors.badgeBg, shapes.roundedRectangle({ cornerRadius: radius.badge })),
        ]}
      >
        {language.badge}
      </Text>
      <Text modifiers={[archivo(15), foregroundStyle(colors.accentInk)]}>{language.native}</Text>
      <Image systemName="chevron.down" size={11} color={colors.accentInk} />
    </HStack>
  );

  return (
    <Host matchContents>
      <Menu label={pill} modifiers={[menuIndicator('hidden')]}>
        {enabled.map((code) => {
          const l = languageOf(code)!;
          return (
            <Toggle
              key={code}
              isOn={code === current}
              label={l.native === l.english ? l.native : `${l.native} · ${l.english}`}
              onIsOnChange={() => select(code)}
            />
          );
        })}
        <Divider />
        <Button label="Manage languages…" onPress={() => router.push('/languages')} />
      </Menu>
    </Host>
  );
}
