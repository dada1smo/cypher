import { useLocalSearchParams } from 'expo-router';
import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { DictionarySearch } from '@/domain/dictionary/components/dictionary-search';
import { DictionaryDb } from '@/domain/languages/components/dictionary-db';
import { useLanguages } from '@/domain/languages/hooks/use-languages';
import { Screen } from '@/ui/components/screen';

export default function SearchScreen() {
  const { current } = useLanguages();
  // Set by the entry's search button: a new value starts the search over.
  const { search } = useLocalSearchParams<{ search?: string }>();
  return (
    <Screen footer={<DictionaryFooter />}>
      <DictionaryDb code={current}>
        <DictionarySearch key={search} />
      </DictionaryDb>
    </Screen>
  );
}
