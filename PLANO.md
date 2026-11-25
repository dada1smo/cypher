# Cypher — Plano geral

Dicionário mobile, open-source, o mais gratuito possível. Uso pessoal no início.
Este arquivo é a memória do projeto: decisões tomadas, decisões em aberto e etapas.

Legenda: ✅ decidido · ❓ em aberto (com recomendação) · ⏳ depois

---

## 1. Decisões macro

| # | Tema | Status | Decisão / recomendação |
|---|------|--------|------------------------|
| M1 | Plataforma | ✅ | **iOS nativo** apenas, por enquanto. |
| M2 | Framework | ✅ | **React Native**. |
| M3 | Escopo v1 | ✅ | **Só dicionário de inglês** (palavras em inglês, definições em inglês). FR e PT depois. |
| M4 | Fonte de dados | ✅ | **Wiktionary**, via dados já extraídos do **kaikki.org** (wiktextract), não a API ao vivo. |
| M5 | Online vs offline | ✅ | **Offline**: definições num **SQLite** local, sem servidor e sem chamadas de rede para consultar. |
| M6 | Custo | ✅ | Zero sempre que possível. Nenhum serviço pago na v1. |
| M7 | Expo ou RN "puro" | ✅ | **Expo** (com *development build*, compilando localmente pelo Xcode). Menos configuração nativa, `expo-sqlite` pronto, e ainda dá para sair do Expo depois. |
| M8 | Como o banco chega ao app | ✅ | **`.db` embutido no app** na v1. Funciona offline desde o primeiro uso. |
| M9 | Instalação no iPhone | ✅ | Começar com o **Apple ID gratuito** (o app expira em 7 dias e precisa ser reinstalado pelo Xcode). Reavaliar a conta de desenvolvedor (US$ 99/ano) depois. |
| M10 | Linguagem | ✅ | **TypeScript** no app e **Python** no script que gera o banco. |
| M11 | Licença do código | ✅ | **MIT** para o código. Os dados são CC BY-SA 4.0: crédito ao Wiktionary no app, e o banco, se distribuído, mantém a mesma licença. |
| M12 | Repositório | ✅ | **GitHub público desde o início.** O `.db` gerado não vai para o git (é grande e pode ser recriado pelo script). |

## 2. Decisões micro (depois das macro)

| # | Tema | Status | Notas |
|---|------|--------|-------|
| m1 | Biblioteca SQLite | ✅ | `expo-sqlite` (`SQLiteProvider` com `assetSource`). Na primeira abertura ele copia o `.db` para os documentos do app, então o app ocupa ~2× o banco no iPhone (~640 MB). Abrir direto do bundle não é documentado; rever se o espaço incomodar. |
| m2 | Esquema do banco | ✅ | Em uso: `words(id, word, pos, ipa, etymology)`, `senses(word_id, n, gloss, example, links)` e `meta(key, value)`, com índice em `word` (case-insensitive). `senses.links` é JSON `[[início, fim, destino], …]` com offsets em UTF-16 (os índices de string do JS), só para destinos que existem em `words`. `meta` guarda `built_at` e `word_count`. |
| m3 | Campos do kaikki usados | ✅ | `word`, `pos`, `senses[].glosses`, `senses[].examples`, `senses[].links`, `sounds[].ipa`, `etymology_text`. |
| m4 | Tipo de busca | ⏳ | v1: busca por prefixo com intervalo no índice (`word >= 'abc' AND word < 'abc' || U+10FFFF`), que trata `%` e `_` como texto. Uma linha por grafia exata, a mais curta primeiro. Depois: FTS5 e tolerância a erros de digitação. |
| m5 | Tamanho do banco | ✅ | Meta de menos de 100 MB abandonada: aceitamos ~320 MB. Cortamos só nomes e sobrenomes (com seus plurais). Mantidos exemplos, etimologia, lugares e formas flexionadas ("plural of dog"). |
| m6 | Navegação e telas | ✅ | Início (busca) → Verbete (`word/[word]`) → Sobre. Sem tab bar. Histórico e favoritos na Etapa 5. Telas, tokens e comportamento: [docs/design/DESIGN.md](docs/design/DESIGN.md). |
| m7 | Áudio de pronúncia | ⏳ | Fora da v1, porque exige rede (Wikimedia Commons). |
| m8 | Atualização dos dados | ⏳ | Rodar o script de novo e gerar uma nova versão do app. |

## 3. Etapas

### Etapa 0: Decisões macro
- [x] Fechar M7–M12.
- [x] `git init`, licença MIT, README.
- [x] Repositório público no GitHub: https://github.com/dada1smo/cypher

### Etapa 1: Pipeline de dados (Python)
- [x] Baixar o JSONL de palavras em inglês no kaikki.org (via streaming, sem salvar o dump).
- [x] Script `data/build_db.py`: JSONL → `assets/cypher-en.db`, só com os campos de m3.
- [x] Testes com amostra: `python3 -m unittest discover data`.
- [x] Medir o tamanho e o tempo da busca.

Resultado (dump de 30/10/2026): 1.408.015 palavras, 1.690.837 definições, 317,4 MB.
Busca por prefixo e abertura de verbete: ~0,1 ms. Gerar do zero leva ~30 min (quase tudo é download).
Atenção para a Etapa 3: a busca ignora maiúsculas, então `dog` também traz `DOG` (sigla); mostrar a grafia exata primeiro.

### Etapa 2: Esqueleto do app
- [x] Criar o projeto (Expo SDK 58, Expo Router, TypeScript) na raiz do repo, seguindo [docs/architecture](docs/architecture/overview.md).
- [x] `src/layers.test.ts` verificando camadas e nomes ([app.md](docs/architecture/app.md#verificação)).
- [x] Embutir o `.db` e abrir o banco no app (tela inicial mostra o número de palavras).
  Conferido com testes e com `npx expo export --platform ios` (o bundle inclui o banco). **Ainda não rodou num aparelho.**
- [ ] Rodar no simulador iOS. Bloqueado: falta o Xcode, que pede atualizar o macOS. Depois: `npm run ios`.

### Etapa 3: Busca e definição (MVP)
- [x] Tela de busca com resultados por prefixo, "Random word" e estado sem resultados.
- [x] Tela de verbete: classe gramatical (abas só com mais de uma), IPA, definições com links, exemplos, etimologia, compartilhar.
- [x] Crédito ao Wiktionary (CC BY-SA) visível no app: o footer do [DESIGN.md](docs/design/DESIGN.md#footer-footerdchtml).
- [x] Tela Sobre (`about.tsx`).
- [ ] Conferir as telas no simulador. O build nativo (`npm run ios`) compila e instala; falta abrir o app e comparar com o DESIGN. Se o `pod install` falhar com erro de encoding, rode com `LANG=en_US.UTF-8`.

Telas, tokens e comportamento seguem o [DESIGN.md](docs/design/DESIGN.md). Fora da v1: "Recent", favoritos e modo escuro (Etapa 5).

Pendências da Etapa 3, resolvidas:
- **Links nas definições:** coluna `senses.links` (m2). O script acha cada link do kaikki no texto da definição (palavra inteira; as sub-acepções herdam links da acepção-mãe que não aparecem no texto) e guarda só os que apontam para palavras do banco.
- **Data de geração do banco:** tabela `meta` com `built_at` e `word_count` (contar grafias distintas no aparelho varreria o índice inteiro).
- **Fraunces com `SOFT`:** o React Native 0.88 aceita `fontVariationSettings` no iOS. As fontes variáveis oficiais (Fraunces e Archivo, OFL) vêm do repositório `google/fonts` e ficam em `assets/fonts/`, embutidas pelo plugin `expo-font`. O `@expo-google-fonts` só tem arquivos estáticos, sem o eixo `SOFT`, e não foi usado.
- **Agrupar pela grafia exata:** `GROUP BY word COLLATE BINARY`, a grafia digitada primeiro.

### Etapa 4: Rodar no iPhone
- [ ] Assinar com a conta escolhida em M9 e instalar no aparelho.
- [ ] Usar no dia a dia e anotar o que falta.

### Etapa 5: Polimento ⏳
- Histórico (lista "Recent" no Início), favoritos, modo escuro, busca tolerante a erros. Histórico e favoritos gravam dados: precisam de um armazenamento separado do banco do dicionário, que abre só para leitura.

### Futuro ⏳
- Francês e português (definições em inglês, ou edições fr/pt do Wiktionary, se o kaikki as publicar).
- Android.
- Áudio de pronúncia.

---

## 4. Registro de decisões

| Data | Decisão |
|------|---------|
| 2026-11-24 | M1–M6 definidos: iOS, React Native, só inglês na v1, dados do kaikki/Wiktionary, SQLite offline, custo zero. |
| 2026-11-24 | M7–M12 definidos: Expo, `.db` embutido, Apple ID gratuito, TypeScript + Python, MIT, GitHub público desde já. |
| 2026-11-24 | Etapa 1 concluída. Banco de inglês com ~320 MB; cortados só nomes e sobrenomes. |
| 2026-11-24 | Arquitetura do app em `docs/architecture/`: camadas `app`, `domain`, `ui`, `global` (adaptado do bloco-ds), Expo Router, SQL só em `domain/*/data/`, Jest + Testing Library. |
| 2026-11-24 | Etapa 2 (sem simulador): projeto Expo SDK 58 na raiz, `expo-sqlite` lendo o banco embutido em `assets/`, banco aberto com `PRAGMA query_only`. |
| 2026-11-25 | Design integrado: v1 sem "Recent" e sem favoritos, modo escuro na Etapa 5, rota `word/[word]`, resultados agrupados pela grafia exata, tokens com os nomes do DESIGN.md. Links nas definições, data do banco e fonte Fraunces ficam como pendências da Etapa 3. |
| 2026-11-25 | Etapa 3: telas de busca, verbete e Sobre; links nas definições e tabela `meta` no banco; fontes variáveis (Fraunces `SOFT` 100, Archivo) embutidas; ícones do sistema (SF Symbols, `expo-symbols`); dump do kaikki salvo em `data/raw/` para refazer o banco sem baixar de novo. |
