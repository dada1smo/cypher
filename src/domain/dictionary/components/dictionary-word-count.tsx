import { Text } from 'react-native';
import { useWordCount } from '../hooks/use-word-count';

export function DictionaryWordCount() {
  const count = useWordCount();
  return <Text>{count === null ? 'Abrindo o dicionário…' : `${count.toLocaleString('pt-BR')} palavras`}</Text>;
}
