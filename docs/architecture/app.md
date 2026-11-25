# Camadas do app (`src/`)

Adaptado da arquitetura do app do bloco-ds. Sem essa fronteira, as telas acumulam SQL, regra e UI no mesmo arquivo.

## As quatro camadas

| Camada | Responsabilidade | Exemplo |
|---|---|---|
| `app` | Rotas do Expo Router: telas, hierarquia e layouts (`_layout.tsx`). O arquivo só lê params, redireciona e compõe peças de `domain` e `ui`. Nenhum componente, hook, query ou regra é declarado nele. | `app/word/[id].tsx` |
| `domain` | Regras do dicionário, uma pasta por domínio: componentes, hooks, types, utils e as queries daquele domínio. | `domain/dictionary/` |
| `ui` | Componentes "burros" e reutilizáveis, sem termo do dicionário, mais o tema do app (`ui/theme/`). | `ui/components/search-field.tsx` |
| `global` | O que é do app inteiro: abertura do banco, providers. A pasta só é criada no primeiro uso. | `global/db/` |

`app` tem esse nome porque o Expo Router exige `src/app/`. Uma camada (pasta) só é criada no primeiro uso: na Etapa 2 ainda não existe `ui/`. Na v1 há um domínio, `dictionary` (busca por prefixo e verbete). Histórico e favoritos (Etapa 5) entram como domínios próprios.

**Organização interna.** `app` segue as rotas por arquivo. As outras camadas (e cada domínio) usam `components/`, `hooks/`, `utils/`, `types/`, e `data/` para queries quando fizer sentido.

## Regra de dependência

A seta significa "pode importar de":

```
app    → domain, ui, global
domain → domain (inclusive outro domínio), ui, global
ui     → ui, react-native, expo-*
global → global
```

Import entre camadas usa o alias `@/<camada>/…` (`@/*` → `src/*` no `tsconfig.json`). Import relativo só dentro da mesma camada.

## Banco de dados

- `global/db/db-provider.tsx` (`DbProvider`) abre o `.db` embutido. Não conhece tabela nenhuma. Os hooks de `domain` pegam a conexão com `useSQLiteContext()` do `expo-sqlite`, sem wrapper próprio.
- SQL só em `domain/<nome>/data/`, uma função por consulta (`searchWords(prefix)`, `getWord(id)`), sempre com parâmetros (`?`), nunca string concatenada.
- Componentes não chamam o banco: usam um hook do domínio (`useSearch`, `useWord`), que chama a função de `data/`.
- Os types do domínio descrevem o que a tela usa, não a linha do SQLite. A conversão fica na função de `data/`.

## Nomenclatura

| Camada | Componente | Arquivo |
|---|---|---|
| `ui` | Nome pelo papel na tela, sem termo do dicionário: `SearchField`, `ScreenHeader`, `EmptyState`. | `components/search-field.tsx` |
| `domain` | `{Domínio}{Classificação, se houver}{O que é}`: `DictionaryResultList`, `DictionarySenseItem`. | `components/dictionary-result-list.tsx` |
| `global` | Igual a `domain`, com a área no lugar do domínio: `DbProvider`. | `db/db-provider.tsx` |

Todo arquivo de `ui`, `domain` e `global` fica em kebab-case: `search-field.tsx`, `search-words.ts`, `use-search.ts`. Em `app` vale a convenção do Expo Router (`index.tsx`, `[id].tsx`, `_layout.tsx`).

Nomes curtos: verbo + substantivo (`searchWords`, `getWord`), no máximo três palavras, sem repetir o que o escopo já diz. Hooks: `use` + substantivo. Booleans: `is`/`has`/`can`.

## Componentização

- Um trecho com papel próprio na tela (header, linha de resultado, seção de etimologia) vira componente com nome, mesmo com um uso só.
- Um componente por arquivo em `ui`, `domain` e `global`. Auxiliares vão para arquivos próprios na mesma pasta. Consts e funções minúsculas podem ficar no arquivo.
- Uma peça de `domain` desce para `ui` quando perde o termo de negócio e outro domínio precisa dela.

## Verificação

`src/layers.test.ts` (`npm test`) falha se um import quebrar a regra de dependência, se um arquivo fugir do kebab-case ou se um arquivo de `ui`/`domain`/`global` declarar mais de um componente. Regra sem checagem se perde no primeiro atalho. A contagem de componentes procura declarações `function Foo(` e `const Foo = (` no topo do arquivo; `memo`/`forwardRef` escapam dela (marcado como `shortcut:` no teste).

## Onde cada coisa entra

- Tela nova: arquivo em `app/`, que compõe `domain` e `ui`.
- Regra ou consulta nova: `domain/<nome>/`.
- Peça visual reutilizável: `ui/components/`.
- Cor, espaçamento, tipografia: `ui/theme/`.

Estrutura esperada na v1:

```
src/
  app/_layout.tsx, index.tsx (busca), word/[id].tsx (verbete)
  domain/dictionary/{data/search-words.ts, data/get-word.ts, hooks/use-search.ts, hooks/use-word.ts,
                     types/word.ts, components/dictionary-result-list.tsx, components/dictionary-entry.tsx}
  ui/{components/search-field.tsx, theme/colors.ts, theme/spacing.ts}
  global/db/db-provider.tsx
```
