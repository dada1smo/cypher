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
| m1 | Biblioteca SQLite | ⏳ | `expo-sqlite` (se M7 = Expo) ou `op-sqlite`. |
| m2 | Esquema do banco | ✅ | Em uso: `words(id, word, pos, ipa, etymology)` e `senses(word_id, n, gloss, example)`, com índice em `word` (case-insensitive). |
| m3 | Campos do kaikki usados | ✅ | Mínimo: `word`, `pos`, `senses[].glosses`, `senses[].examples`, `sounds[].ipa`, `etymology_text`. |
| m4 | Tipo de busca | ⏳ | v1: busca por prefixo (`LIKE 'abc%'` com índice). Depois: FTS5 e tolerância a erros de digitação. |
| m5 | Tamanho do banco | ✅ | Meta de menos de 100 MB abandonada: aceitamos ~320 MB. Cortamos só nomes e sobrenomes (com seus plurais). Mantidos exemplos, etimologia, lugares e formas flexionadas ("plural of dog"). |
| m6 | Navegação e telas | ⏳ | Busca → Resultado. Histórico e favoritos ficam para depois. |
| m7 | Áudio de pronúncia | ⏳ | Fora da v1, porque exige rede (Wikimedia Commons). |
| m8 | Atualização dos dados | ⏳ | Rodar o script de novo e gerar uma nova versão do app. |

## 3. Etapas

### Etapa 0: Decisões macro
- [x] Fechar M7–M12.
- [x] `git init`, licença MIT, README.
- [x] Repositório público no GitHub: https://github.com/dada1smo/cypher

### Etapa 1: Pipeline de dados (Python)
- [x] Baixar o JSONL de palavras em inglês no kaikki.org (via streaming, sem salvar o dump).
- [x] Script `data/build_db.py`: JSONL → `cypher-en.db`, só com os campos de m3.
- [x] Testes com amostra: `python3 -m unittest discover data`.
- [x] Medir o tamanho e o tempo da busca.

Resultado (dump de 30/10/2026): 1.408.015 palavras, 1.690.837 definições, 317,4 MB.
Busca por prefixo e abertura de verbete: ~0,1 ms. Gerar do zero leva ~30 min (quase tudo é download).
Atenção para a Etapa 3: a busca ignora maiúsculas, então `dog` também traz `DOG` (sigla); mostrar a grafia exata primeiro.

### Etapa 2: Esqueleto do app
- [ ] Criar o projeto (Expo ou RN, conforme M7) com TypeScript, seguindo [docs/architecture](docs/architecture/overview.md).
- [ ] `src/layers.test.ts` verificando camadas e nomes ([app.md](docs/architecture/app.md#verificação)).
- [ ] Rodar no simulador iOS.
- [ ] Embutir o `.db` e abrir o banco no app (contar linhas).

### Etapa 3: Busca e definição (MVP)
- [ ] Tela de busca com resultados por prefixo.
- [ ] Tela de verbete: classe gramatical, IPA, definições, exemplos, etimologia.
- [ ] Crédito ao Wiktionary (CC BY-SA) visível no app.

### Etapa 4: Rodar no iPhone
- [ ] Assinar com a conta escolhida em M9 e instalar no aparelho.
- [ ] Usar no dia a dia e anotar o que falta.

### Etapa 5: Polimento ⏳
- Histórico, favoritos, modo escuro, busca tolerante a erros.

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
