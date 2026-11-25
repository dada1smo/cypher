# Cypher — Design

Especificação das telas e fluxos do app. As telas do canvas de design estão copiadas em
[`screens/`](screens/) como referência.

Como este doc se liga ao resto: regras de código em [docs/architecture](../architecture/overview.md),
etapas e decisões em [PLANO.md](../../PLANO.md). Os nomes de token abaixo são os nomes no código
(`ui/theme/`: `colors.ink`, `colors.accent`…).

> **Sobre `screens/*.dc.html`:** são arquivos do canvas, não código do app. Não rodam
> fora dele (dependem de `support.js`). Leia-os para tirar medidas, espaçamentos,
> textos e cores; implemente em React Native. Em caso de conflito, **este arquivo vence**.
> Quando o canvas mudar, atualize este arquivo e copie as telas de novo.

Os textos das telas (definições, exemplos) são conteúdo de exemplo; no app vêm do banco.

---

## 1. Tokens

### Cores

Primária: escala **amber** do Tailwind. O amber-500 puro não passa contraste em texto
sobre fundo claro, por isso cada uso tem seu tom.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `bg` | `#FAFAF9` | `#111317` | Fundo das telas |
| `ink` | `#16181D` | `#ECEDEF` | Texto principal |
| `muted` | `#5B606B` | `#A3A7B0` | Texto secundário, rótulos, exemplos |
| `surface` | `#EFEFF1` | `#1E2128` | Fundo do controle de abas, número da definição |
| `line` | `#E4E4E7` | `#2A2E36` | Divisórias, borda do footer |
| `card` | `#FFFFFF` | — | Campo de busca, cartões, aba selecionada (claro) |
| `tabOn` | `#FFFFFF` | `#2C3140` | Aba selecionada |
| `accent` | `#B45309` (amber-700) | `#FBBF24` (amber-400) | Links (inclusive nas definições), ícones, botões de texto |
| `accentPressed` | `#92400E` (amber-800) | — | Estado pressionado/hover |
| `accentBorder` | `#D97706` (amber-600) | — | Borda do campo de busca focado |
| `accentSoft` | `#FEF3C7` (amber-100) | — | Fundo de "Random word", chips de sugestão, toque em link |
| `keyboard` | `#D1D3D9` | — | Só no mock: placeholder do teclado |

**Modo escuro: Etapa 5**, não v1. Vai seguir o sistema (`useColorScheme`). A coluna Escuro já fica
nos tokens; faltam os valores escuros de `card`, `accentPressed`, `accentBorder` e `accentSoft`.

### Tipografia

Duas famílias, ambas do Google Fonts (OFL), embutidas no binário via `@expo-google-fonts`
(funciona offline):

- **Fraunces**: palavras, definições e títulos. Sempre com o eixo `SOFT` em 100 (serifas
  arredondadas). Se a versão estática do `@expo-google-fonts/fraunces` não expuser o eixo
  `SOFT`, use o arquivo variável da fonte e `fontVariationSettings` / a instância "Soft".
- **Archivo**: todo o resto da interface (campo de busca, abas, rótulos, botões, footer).

| Estilo | Família | Tamanho / peso | Onde |
|---|---|---|---|
| Palavra do verbete | Fraunces | 44 / 600, `letterSpacing -0.8` | Cabeçalho do verbete |
| Título de tela | Fraunces | 32–34 / 600 | Início ("Cypher"), Your words, About |
| Título de estado | Fraunces | 26 / 600 | Sem resultados |
| Definição | Fraunces | 18 / 400, altura de linha 1.45 | Lista de definições |
| Palavra em lista | Fraunces | 19–20 / 400 | Recentes, resultados, favoritos |
| Corpo | Archivo | 15–17 / 400 | Campo, textos |
| Exemplo | Archivo | 15 / 400 itálico, `muted` | Abaixo da definição |
| Rótulo de seção | Archivo | 13 / 600, maiúsculas, `letterSpacing 0.6`, `muted` | "RECENT", "DID YOU MEAN", "CREDITS" |
| Meta | Archivo | 12–13 / 400, `muted` | Classe gramatical, contagem, footer |

### Medidas

- Tela de referência: 390 × 844 pt (iPhone). Margem lateral: 20.
- Alvos de toque: mínimo 44 × 44.
- Campo de busca: altura 52, raio 14, borda 1.5 `accentBorder`, fundo `card`.
- Botões e cartões: raio 12–14. Chips: altura 44, raio 22.
- Linha de lista: altura mínima 48, divisória `line` de 1 px.
- Use a safe area do sistema (`react-native-safe-area-context`), nunca valores fixos de status bar.

---

## 2. Componentes compartilhados

### Footer ([`Footer.dc.html`](screens/Footer.dc.html))

Texto: `Works offline · Definitions from Wiktionary, CC BY-SA 4.0`, com "Wiktionary"
levando para a tela About. Archivo 12, `muted`, centralizado, borda superior `line`.

- Aparece em **todas** as telas, sempre colado no limite inferior.
- Inclui a safe area inferior (indicador de início): 10 em cima + inset inferior.
- **Fica sob o teclado** quando ele abre: não sobe com ele. Posicione o footer
  absoluto no fundo, **fora** de qualquer `KeyboardAvoidingView`.
- Nas telas que rolam, só o conteúdo rola; o footer fica fixo.
- Recebe o tema (claro/escuro).

### Campo de busca

Ícone de lupa à esquerda, texto, e um botão **X** circular (32, fundo `line`, área de toque 44)
à direita quando há texto.

- **Não há botão "Cancel".** O X limpa o texto e volta ao Início (estado de campo vazio).
- Para só fechar o teclado sem apagar: arrastar a lista (`keyboardDismissMode="on-drag"`).

### Controle de abas (classe gramatical)

Segmentado: fundo `surface`, raio 12, padding 4; aba selecionada com fundo `tabOn` e
sombra leve. Rótulo `Noun · 3` (classe + número de definições).

- **Só aparece quando a palavra tem mais de uma classe gramatical.**
- Com uma só classe, a classe aparece em itálico (Fraunces, cor `ink`) no início da linha
  da pronúncia: *noun* · /ˌsɛɹənˈdɪpɪti/ — e as definições vêm logo abaixo.
- **Rótulos nunca quebram nem são cortados.** Cada aba tem a largura do seu rótulo
  (padding 14 nas laterais, uma linha só) e cresce para preencher a barra quando cabem todas
  (`flexGrow: 1, flexShrink: 0`). Quando não cabem (ex.: "c", 6 classes), a barra **rola na horizontal**
  (`ScrollView horizontal`, sem indicador); a última aba aparece cortada na borda, o que mostra que há mais.
- **Esmaecido nas bordas**: um gradiente de 32 de largura, da cor `surface` (sólida nos primeiros 15%) para
  transparente, sobre a borda onde ainda há abas escondidas. O da direita aparece quando há mais à direita,
  o da esquerda depois de rolar; somem no início/fim. Sem toque (`pointerEvents="none"`), dentro do
  contorno arredondado da barra. Calcule pelo `onScroll` + `onContentSizeChange`/`onLayout`. No app,
  o gradiente pede `expo-linear-gradient` (ainda não instalado: `npx expo install expo-linear-gradient`).
  Ao selecionar uma aba, role para deixá-la inteira à vista. Referência: [`EntryMany.dc.html`](screens/EntryMany.dc.html).
- Rótulos por extenso: `Numeral`, `Preposition`, `Adjective` (não as siglas do kaikki).

### Links nas definições

Palavras com link dentro de uma definição abrem o verbete dessa palavra.

- **Só cor**: a palavra fica em `accent` (amber-700 no claro, amber-400 no escuro), **sem sublinhado**,
  mesmo peso e fonte da definição. É o padrão do iOS para referências dentro de um texto; basta
  `color` + `onPress` num `<Text>` aninhado.
- Sem sublinhado, o `Fraunces.ttf` não precisa mais da edição em `underlinePosition`: volte ao arquivo original da fonte.
- Ao tocar: fundo `accentSoft` rápido como confirmação, depois navega.
- Ideia para depois: toque longo mostra uma prévia da primeira definição.
- **Nem toda palavra vira link**: só as que o Wiktionary liga a outra página
  (ver §4, dados).

---

## 3. Telas e fluxos

Fluxo principal da v1: **Início → digitar → resultados → verbete**. Sem tab bar: a busca é a tela inicial.

| # | Tela | Arquivo | Rota sugerida (Expo Router) |
|---|---|---|---|
| 1 | Início | [`Main.dc.html`](screens/Main.dc.html) | `src/app/index.tsx` |
| 2 | Digitando / resultados | [`Search.dc.html`](screens/Search.dc.html) | estado do Início (mesma tela, campo com texto) |
| 3 | Verbete | [`Entry.dc.html`](screens/Entry.dc.html) | `src/app/word/[word].tsx` |
| 3b | Verbete com uma só classe | [`EntryNoun.dc.html`](screens/EntryNoun.dc.html) | mesma rota do 3 |
| 3c | Verbete com muitas classes (abas rolam) | [`EntryMany.dc.html`](screens/EntryMany.dc.html) | mesma rota do 3 |
| 4 | Sem resultados | [`NoResults.dc.html`](screens/NoResults.dc.html) | estado do Início |
| 5 | Histórico e favoritos | [`Saved.dc.html`](screens/Saved.dc.html) | `src/app/saved.tsx` (Etapa 5) |
| 6 | Verbete no modo escuro | [`EntryDark.dc.html`](screens/EntryDark.dc.html) | tema do 3 (Etapa 5) |
| 7 | Sobre e créditos | [`About.dc.html`](screens/About.dc.html) | `src/app/about.tsx` |

### 1 · Início
- Título "Cypher".
- Campo de busca já focado ao abrir.
- **Etapa 5, não v1:** a lista "Recent" (palavra + classes gramaticais) e o botão de marcador para
  Histórico e favoritos, no canto superior direito. Os dois precisam gravar dados, e o banco do
  dicionário abre só para leitura: vão num armazenamento próprio.
- Botão "Random word" perto do fim: um `SELECT` aleatório no banco. Como o campo abre focado, o teclado cobre o botão e o footer: tocar na área vazia fecha o teclado.
- Footer.

### 2 · Digitando
- Busca por prefixo a cada tecla (`LIKE 'abc%'` com o índice em `words.word`).
- Linha mostra "*N* words start with “abc”".
- Cada resultado: palavra com o prefixo digitado em negrito, classes gramaticais
  (`noun · verb`) e a primeira definição numa linha com reticências.
- Uma palavra com várias classes é **uma** linha só, agrupada pela **grafia exata**
  (`GROUP BY word COLLATE BINARY`): a coluna ignora maiúsculas, e sem isso `dog` e `DOG` (sigla)
  virariam uma linha. A grafia igual à digitada vem primeiro.
- Return abre o primeiro resultado. Footer fica sob o teclado.

### 3 · Verbete
- Barra: "‹ Search" à esquerda; compartilhar à direita (ícone, `accent`). Favoritar entra na Etapa 5.
- Rota por palavra (`word/[word]`), não por id: o verbete junta as classes da mesma grafia, e os
  links nas definições apontam para o texto da palavra.
- Cabeçalho: palavra, pronúncia (IPA).
- Abas de classe gramatical (só com mais de uma classe — ver §2).
- Definições numeradas (número num círculo `surface` de 22); exemplo em itálico abaixo, quando houver.
- Etimologia recolhida por padrão, botão "Etymology · Show/Hide".
- A área de conteúdo rola; footer fixo.

### 4 · Sem resultados
- "No words start with “xyz”" + "Check the spelling, or try fewer letters."
- v1: só isso.
- Depois (decisão m4 do plano): "Did you mean" (chips) com busca tolerante a erros, e
  "Search inside definitions" (FTS5 sobre `senses.gloss`).

### 5 · Histórico e favoritos (Etapa 5)
- "Your words", controle segmentado Saved / History, botão Edit.
- Lista igual à de resultados; em History, a meta é a data ("Today", "Yesterday", "Mon").

### 7 · Sobre
- Texto curto, tabela com número de palavras, data de geração do banco e versão do app.
  Número de palavras e data vêm da tabela `meta`, gravada pelo script.
- Créditos: Wiktionary, kaikki.org (wiktextract), CC BY-SA 4.0; código MIT; link para o GitHub.

---

## 4. Impacto nos dados

Os links nas definições (§2) precisam de dados que o `data/build_db.py` hoje descarta.
O kaikki traz em cada sentido `senses[].links` (pares `[texto, destino]`). Proposta:
guardar a definição já marcada, por exemplo `A method of [transforming] a text in order to [conceal] its meaning.`,
e o app só divide o texto pelos colchetes. Só marcar links cujo destino exista em `words`.
Cuidado: algumas definições do Wiktionary já têm colchetes literais; se isso atrapalhar,
troque o marcador ou guarde os links numa tabela `links(word_id, n, start, end, target)`.

**Implementado (Etapa 3)** de outro jeito: em vez de marcadores no texto, a coluna `senses.links` guarda
JSON `[[início, fim, destino], …]` com offsets em UTF-16, e o app corta a definição por esses offsets
(`splitGloss`). Isso evita o problema dos colchetes literais. Detalhes em `PLANO.md` (m2).
