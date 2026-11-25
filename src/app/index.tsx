import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { DictionarySearch } from '@/domain/dictionary/components/dictionary-search';
import { Screen } from '@/ui/components/screen';
import { useLocalSearchParams } from 'expo-router';

export default function SearchScreen() {
  // Set by the entry's search button: a new value starts the search over.
  const { search } = useLocalSearchParams<{ search?: string }>();
  return (
    <Screen footer={<DictionaryFooter />}>
      <DictionarySearch key={search} />
    </Screen>
  );
}
