# Visão geral

Dois pedaços no mesmo repo, sem código compartilhado entre eles:

| Pasta | Papel |
|---|---|
| `data/` | Pipeline em Python: dump do kaikki → `assets/cypher-en.db` (SQLite). Ver [PLANO.md](../../PLANO.md), Etapa 1. |
| `src/` | O app: Expo + React Native + TypeScript, rotas por arquivo com Expo Router (M7, M10). |

O único contrato entre os dois é o esquema do banco (m2): `words(id, word, pos, ipa, etymology)`, `senses(word_id, n, gloss, example, links)` e `meta(key, value)`. Os testes do app leem esse esquema direto de `data/build_db.py` (`createTestDb`). Mudou o esquema no script, muda o `domain` que lê aquelas tabelas no mesmo PR.

O projeto Expo fica na raiz do repo (`package.json`, `app.json`, `metro.config.js`); `src/` é só o código do app.

O app é offline (M5): nada de rede para consultar. O `.db` vai embutido (M8) e é aberto só para leitura:

- `data/build_db.py` lê o dump salvo em `data/raw/kaikki-en.jsonl.gz` e grava em `assets/cypher-en.db`. Os dois ficam fora do git: baixe o dump e gere o banco antes de rodar o app (comandos no topo do script).
- `metro.config.js` registra `.db` como asset, e `global/db/db-provider.tsx` passa o arquivo ao `SQLiteProvider` do `expo-sqlite`.
- Na primeira abertura o `expo-sqlite` copia o banco para os documentos do app (~2× o tamanho no aparelho). A cópia só acontece uma vez por nome, então `DB_NAME` no provider muda junto com cada banco novo (o nome leva a data do build).
- A conexão roda `PRAGMA query_only = ON`: qualquer escrita falha.

Documentos:

- [Camadas do app](app.md) — `app`, `domain`, `ui`, `global`, quem importa quem e como nomear.
- [Componentes](components.md) — estrutura, estilos, acessibilidade e testes.
- [Design](../design/DESIGN.md) — telas, fluxos, tokens (cores, tipografia, medidas) e comportamento. Fonte para o visual; as regras de código continuam aqui.

Decisões novas entram no registro do [PLANO.md](../../PLANO.md#4-registro-de-decisões); regras que valem para o código entram aqui.
