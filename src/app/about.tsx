import { DictionaryAbout } from '@/domain/dictionary/components/dictionary-about';
import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { DictionaryDb } from '@/domain/languages/components/dictionary-db';
import { useLanguages } from '@/domain/languages/hooks/use-languages';
import { Screen } from '@/ui/components/screen';

export default function AboutScreen() {
  const { current } = useLanguages();
  return (
    <Screen footer={<DictionaryFooter />}>
      <DictionaryDb code={current}>
        <DictionaryAbout />
      </DictionaryDb>
    </Screen>
  );
}
