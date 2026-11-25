import { DictionaryFooter } from '@/domain/dictionary/components/dictionary-footer';
import { LanguageSettings } from '@/domain/languages/components/language-settings';
import { Screen } from '@/ui/components/screen';

export default function LanguagesScreen() {
  return (
    <Screen footer={<DictionaryFooter />}>
      <LanguageSettings />
    </Screen>
  );
}
