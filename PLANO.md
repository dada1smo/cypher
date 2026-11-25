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
| m2 | Esquema do banco | ✅ | Em uso: `words(id, word, pos, ipa, etymology)` e `senses(word_id, n, gloss, example)`, com índice em `word` (case-insensitive). |
| m3 | Campos do kaikki usados | ✅ | Mínimo: `word`, `pos`, `senses[].glosses`, `senses[].examples`, `sounds[].ipa`, `etymology_text`. |
| m4 | Tipo de busca | ⏳ | v1: busca por prefixo (`LIKE 'abc%'` com índice). Depois: FTS5 e tolerância a erros de digitação. |
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
- [ ] Tela de busca com resultados por prefixo.
- [ ] Tela de verbete: classe gramatical, IPA, definições, exemplos, etimologia.
- [ ] Crédito ao Wiktionary (CC BY-SA) visível no app: o footer do [DESIGN.md](docs/design/DESIGN.md#footer-footerdchtml).
- [ ] Tela Sobre (`about.tsx`).

Telas, tokens e comportamento seguem o [DESIGN.md](docs/design/DESIGN.md). Fora da v1: "Recent", favoritos e modo escuro (Etapa 5).

Pendências a decidir na Etapa 3:
- **Links nas definições** ([DESIGN §4](docs/design/DESIGN.md#4-impacto-nos-dados)): guardar `senses[].links` do kaikki, com marcadores na definição ou numa tabela `links`. Muda m2/m3 e exige gerar o banco de novo (~30 min).
- **Data de geração do banco** para a tela Sobre: o banco não guarda isso. Opção: tabela `meta(key, value)` gravada pelo script.
- **Fonte Fraunces com o eixo `SOFT`**: confirmar se o React Native no iOS aceita `fontVariationSettings`; se não, usar um arquivo estático já "Soft". Instalar `expo-font` e `@expo-google-fonts`.
- **Agrupar resultados pela grafia exata** (`GROUP BY word COLLATE BINARY`), com a grafia digitada primeiro.

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
