# Visão geral

Dois pedaços no mesmo repo, sem código compartilhado entre eles:

| Pasta | Papel |
|---|---|
| `data/` | Pipeline em Python: dump do kaikki → `assets/cypher-en.db` (SQLite). Ver [PLANO.md](../../PLANO.md), Etapa 1. |
| `src/` | O app: Expo + React Native + TypeScript, rotas por arquivo com Expo Router (M7, M10). |

O único contrato entre os dois é o esquema do banco (m2): `words(id, word, pos, ipa, etymology)`, `senses(word_id, n, gloss, example, links)` e `meta(key, value)`. Os testes do app leem esse esquema direto de `data/build_db.py` (`createTestDb`). Mudou o esquema no script, muda o `domain` que lê aquelas tabelas no mesmo PR.

O projeto Expo fica na raiz do repo (`package.json`, `app.json`, `metro.config.js`); `src/` é só o código do app.

O app é offline (M5): nada de rede para consultar. Um banco por idioma (m9), aberto só para leitura. O inglês vai embutido (M8); os outros são baixados uma vez do GitHub Releases ao ligar o idioma, a única vez que o app usa a rede:

- `data/build_db.py` lê o dump salvo em `data/raw/kaikki-en.jsonl.gz` e grava em `assets/cypher-en.db`. Os dois ficam fora do git: baixe o dump e gere o banco antes de rodar o app (comandos no topo do script).
- `metro.config.js` registra `.db` como asset. `domain/languages/data/languages.ts` lista os idiomas com o nome de cada banco (e, para os baixados, URL e tamanho exato), e `DictionaryDb` abre o banco certo pelo `DbProvider` de `global/db`.
- Na primeira abertura o `expo-sqlite` copia o banco embutido para `Documents/SQLite` (~2× o tamanho no aparelho). Os baixados vão direto para essa pasta, sem cópia. A cópia só acontece uma vez por nome, então o nome do banco leva a data do build e muda a cada banco novo.
- `data/build_db.py <dump> <saída> fr` gera o francês, publicado como release `data-fr-AAAA-MM-DD`.
- A conexão roda `PRAGMA query_only = ON`: qualquer escrita falha.

Documentos:

- [Camadas do app](app.md) — `app`, `domain`, `ui`, `global`, quem importa quem e como nomear.
- [Componentes](components.md) — estrutura, estilos, acessibilidade e testes.
- [Design](../design/DESIGN.md) — telas, fluxos, tokens (cores, tipografia, medidas) e comportamento. Fonte para o visual; as regras de código continuam aqui.

Decisões novas entram no registro do [PLANO.md](../../PLANO.md#4-registro-de-decisões); regras que valem para o código entram aqui.
