import { DictionaryAbout } from '@/domain/dictionary/components/dictionary-about';
import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { Screen } from '@/ui/components/screen';

export default function AboutScreen() {
  return (
    <Screen footer={<DictionaryFooter />}>
      <DictionaryAbout />
    </Screen>
  );
}
