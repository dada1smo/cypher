import { useLocalSearchParams } from 'expo-router';
import { DictionaryEntry } from '@/domain/dictionary/components/dictionary-entry';
import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { DictionaryDb } from '@/domain/languages/components/dictionary-db';
import type { LanguageCode } from '@/domain/languages/types/language';
import { Screen } from '@/ui/components/screen';

export default function WordScreen() {
  const { lang, word } = useLocalSearchParams<{ lang: LanguageCode; word: string }>();
  return (
    <Screen footer={<DictionaryFooter />}>
      <DictionaryDb code={lang}>
        <DictionaryEntry key={word} word={word} />
      </DictionaryDb>
    </Screen>
  );
}
