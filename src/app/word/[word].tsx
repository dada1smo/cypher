import { useLocalSearchParams } from 'expo-router';
import { DictionaryEntry } from '@/domain/dictionary/components/dictionary-entry';
import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { Screen } from '@/ui/components/screen';

export default function WordScreen() {
  const { word } = useLocalSearchParams<{ word: string }>();
  return (
    <Screen footer={<DictionaryFooter />}>
      <DictionaryEntry key={word} word={word} />
    </Screen>
  );
}
