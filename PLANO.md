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
| m9 | Como os outros idiomas chegam ao app | ✅ | **Um `.db` por idioma** (`cypher-fr.db`, …). O inglês continua embutido (M8); os outros são **baixados uma vez ao ligar o idioma** e depois funcionam offline. Embutir todos dobraria o app (o inglês já ocupa ~320 MB, e o m1 copia o banco, ~2× no aparelho). O download abre o banco direto dos documentos do app, sem a cópia do m1. Exige rede só nesse momento: exceção aceita ao M5. |
| m10 | Fonte dos dados do francês | ✅ | **Edição francesa do Wiktionary** (kaikki `frwiktionary`, dump de ~390 MB comprimido). Diferenças do inglês: sem `senses[].links` (as definições em francês não terão links), etimologia em `etymology_texts` (lista) e IPA entre barras invertidas (`\a.kœj\`). Opções avaliadas: (a) **Edição francesa do Wiktionary** (o kaikki publica a extração do fr.wiktionary): definições em francês, um dicionário monolíngue como o de inglês. (b) **Verbetes franceses do Wiktionary em inglês** (o mesmo dump do inglês, `lang_code = "fr"`, que o `build_db.py` já aceita): definições em inglês, bom para aprender o idioma, zero trabalho extra no script. O português segue a mesma decisão. |
| m11 | Onde hospedar os `.db` para download | ✅ | **GitHub Releases** do repositório (grátis, arquivos de até 2 GB, mesma licença CC BY-SA citada na release). O app guarda só a URL e o tamanho esperado de cada idioma. |

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
  Conferido com testes e com `npx expo export --platform ios` (o bundle inclui o banco). Rodou no simulador (Etapa 3) e no iPhone (Etapa 4).
- [x] Rodar no simulador iOS (`npm run ios`).

### Etapa 3: Busca e definição (MVP)
- [x] Tela de busca com resultados por prefixo, "Random word" e estado sem resultados.
- [x] Tela de verbete: classe gramatical (abas só com mais de uma), IPA, definições com links, exemplos, etimologia, compartilhar.
- [x] Crédito ao Wiktionary (CC BY-SA) visível no app: o footer do [DESIGN.md](docs/design/DESIGN.md#footer-footerdchtml).
- [x] Tela Sobre (`about.tsx`).
- [x] Conferir as telas no simulador (iPhone 18 Pro): Início, resultados, sem resultados, verbete (abas, links, etimologia) e Sobre batem com o DESIGN. Ajuste: no Início, tocar na área vazia fecha o teclado, senão "Random word" e o crédito ficavam escondidos. Se o `pod install` falhar com erro de encoding, rode com `LANG=en_US.UTF-8`. O Metro com `CI=1` não recarrega o código.

Telas, tokens e comportamento seguem o [DESIGN.md](docs/design/DESIGN.md). Fora da v1: "Recent", favoritos e modo escuro (Etapa 5).

Pendências da Etapa 3, resolvidas:
- **Links nas definições:** coluna `senses.links` (m2). O script acha cada link do kaikki no texto da definição (palavra inteira; as sub-acepções herdam links da acepção-mãe que não aparecem no texto) e guarda só os que apontam para palavras do banco.
- **Data de geração do banco:** tabela `meta` com `built_at` e `word_count` (contar grafias distintas no aparelho varreria o índice inteiro).
- **Fraunces com `SOFT`:** o React Native 0.88 aceita `fontVariationSettings` no iOS. As fontes variáveis oficiais (Fraunces e Archivo, OFL) vêm do repositório `google/fonts` e ficam em `assets/fonts/`, embutidas pelo plugin `expo-font`. O `@expo-google-fonts` só tem arquivos estáticos, sem o eixo `SOFT`, e não foi usado.
- **Agrupar pela grafia exata:** `GROUP BY word COLLATE BINARY`, a grafia digitada primeiro.

### Etapa 4: Rodar no iPhone
- [x] Assinar com a conta escolhida em M9 e instalar no aparelho. Apple ID gratuito, equipe em `ios.appleTeamId` (`app.json`), build em Release pelo `xcodebuild` com `-allowProvisioningUpdates` (o `expo run:ios` não deixa o Xcode criar o perfil). Passo a passo no README. Reinstalar a cada 7 dias.
- [x] Ícone do app (`assets/icon.png`, gerado por `docs/design/make_icon.py`; DESIGN §5).
- [ ] Usar no dia a dia e anotar o que falta.

### Etapa 5: Idiomas e polimento ⏳

**5a. Outros idiomas (primeiro):** inglês e francês; português depois. Telas e regras: [DESIGN.md §6](docs/design/DESIGN.md#6-idiomas).
- [x] Fechar m9, m10 e m11.
- [x] Gerar `cypher-fr.db`: `python3 data/build_db.py data/raw/kaikki-fr.jsonl.gz data/out/cypher-fr.db fr` (~40 s). Dump de 25/11/2026: 2.083.570 verbetes, 2.628.098 definições, 484 MB. Busca por "a" (167 mil palavras): 111 ms no Mac.
  Mantidas as formas flexionadas (1,9 milhão das definições, sobretudo conjugações): buscar "suis" leva a "être". Sem elas o banco teria 191 MB.
- [x] Publicar `cypher-fr.db` no GitHub Releases (m11): release [`data-fr-2026-11-25`](https://github.com/dada1smo/cypher/releases/tag/data-fr-2026-11-25), 483.975.168 bytes, SHA-256 `3943a9c7…42a6ffb`. Um banco novo vira uma release nova (`data-fr-AAAA-MM-DD`).
- [ ] Seletor de idioma no Início: pílula no cabeçalho com menu dos idiomas habilitados; a busca e o "Random word" usam o idioma escolhido. O verbete não troca de idioma.
- [ ] Tela "Languages": ligar/desligar dicionários, baixar com progresso e cancelar, apagar ao desligar, pelo menos um sempre ligado. Português como "Coming soon".
- [ ] Guardar os idiomas habilitados e o último usado (armazenamento gravável, separado dos bancos, que abrem só para leitura).
- [ ] Rota do verbete com o idioma (ex. `word/[lang]/[word]`), para links e compartilhamento apontarem para o dicionário certo.

**5b. Modo escuro (junto com 5a):** segue o sistema (`useColorScheme`). Bloqueado: faltam no DESIGN os valores escuros de `card`, `accentPressed`, `accentBorder`, `accentSoft` e da pílula de idioma (a cargo do agente de design).

**5c. Polimento:**
- Histórico (lista "Recent" no Início), favoritos, busca tolerante a erros. Histórico e favoritos gravam dados: precisam de um armazenamento separado do banco do dicionário, que abre só para leitura.

### Futuro ⏳
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
| 2026-11-25 | Etapa 4: app assinado com o Apple ID gratuito e instalado num iPhone 15 (build Release, 415 MB). Ícone "Cy" do DESIGN. Ajustes da conferência no simulador: teclado do Início, links só com cor, abas que rolam com bordas esmaecidas (`expo-linear-gradient`), barra do verbete com Back e nova busca. |
| 2026-11-25 | Idiomas entram na Etapa 5, antes do polimento: inglês e francês, português depois. Troca de idioma só no Início, tela para escolher os idiomas habilitados. m9–m11 em aberto (um banco por idioma, baixado ao ligar; fonte do francês; hospedagem). |
| 2026-11-25 | m9–m11 fechados: um `.db` por idioma, baixado do GitHub Releases ao ligar o idioma; francês da edição francesa do Wiktionary (definições em francês, sem links). Modo escuro sobe para junto do francês, à espera dos tokens escuros no DESIGN. |
| 2026-11-25 | Banco francês com as formas flexionadas (484 MB para baixar, em vez de 191 MB só com os lemas): achar a forma conjugada é o que mais ajuda no francês. |
