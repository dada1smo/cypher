import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { DictionarySearch } from '@/domain/dictionary/components/dictionary-search';
import { Screen } from '@/ui/components/screen';

export default function SearchScreen() {
  return (
    <Screen footer={<DictionaryFooter />}>
      <DictionarySearch />
    </Screen>
  );
}
