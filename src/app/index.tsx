import { Stack } from 'expo-router';
import { DictionaryWordCount } from '@/domain/dictionary/components/dictionary-word-count';

export default function SearchScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Cypher' }} />
      <DictionaryWordCount />
    </>
  );
}
