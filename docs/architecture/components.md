# Componentes

Vale para `ui`, `domain` e `global` ([camadas](app.md)).

## Composição

Prefira, nesta ordem: componentes que já existem no app (`ui` primeiro); componentes do React Native e do Expo (`Pressable`, `FlatList`, `TextInput`, `expo-router`'s `Link`); outra lib já instalada; só então código novo. Lib nova só se poupar bem mais que algumas linhas.

Listas longas (resultados de busca) usam `FlatList`, nunca `map` dentro de `ScrollView`.

## Props

- Props tipadas com `type XProps = { … }`, exportado junto com o componente.
- Componentes de `ui` aceitam `style` e o repassam por último, para quem usa poder sobrescrever.
- Componentes de `ui` recebem dados prontos e callbacks (`onPress`, `onChangeText`): não buscam dado nem conhecem o banco.
- O pai é dono do layout: o espaço entre irmãos é o `gap` do pai, e o componente não define a própria margem externa.

## Estilos

- `StyleSheet.create` no fim do arquivo do componente. Sem objeto de estilo inline no JSX, exceto valor que depende de prop ou estado.
- Cor, espaçamento e tipografia só pelos tokens de `ui/theme/` (`colors.text`, `spacing[4]`). Proibido hex, `rgb()` ou número mágico de cor no componente.
- Faltou um token? Ele entra em `ui/theme/` no mesmo PR que o usa.
- Modo escuro (Etapa 5) chega trocando os valores dos tokens, não os componentes.

## Acessibilidade

- Todo elemento tocável tem `accessibilityRole` e, se não tiver texto visível, `accessibilityLabel`.
- Alvo de toque com no mínimo 44×44 pt (use `hitSlop` se o visual for menor).
- Texto respeita o tamanho de fonte do sistema: não desligue `allowFontScaling`.

## Testes

`x.test.tsx` ao lado de `x.tsx`, com Jest (`jest-expo`) e `@testing-library/react-native`. Testa só comportamento: o que aparece para um dado input, callbacks de toque e digitação, estados de vazio e carregando, props de acessibilidade. Busca por `getByRole`/`getByText`. Proibido assert de aparência (`toHaveStyle`, snapshot).

Funções de `domain/<nome>/data/` testam contra `createTestDb()` (`global/db/test-db.ts`): um SQLite em memória (`node:sqlite`) com o esquema lido de `data/build_db.py`, nunca o `.db` de 320 MB. Esses testes começam com `/** @jest-environment node */`. Componentes de `domain` testam mockando o hook do domínio (`jest.mock('../hooks/use-x')`). Componente ou query nova entra com o seu teste.

## Checklist de componente novo

1. Camada certa ([onde cada coisa entra](app.md#onde-cada-coisa-entra)) e nome pela regra da camada.
2. Arquivo kebab-case, um componente.
3. Tokens de `ui/theme/`, `style` repassado (em `ui`).
4. Acessibilidade.
5. Teste de comportamento ao lado.
