# Visão geral

Dois pedaços no mesmo repo, sem código compartilhado entre eles:

| Pasta | Papel |
|---|---|
| `data/` | Pipeline em Python: dump do kaikki → `cypher-en.db` (SQLite). Ver [PLANO.md](../../PLANO.md), Etapa 1. |
| `src/` | O app: Expo + React Native + TypeScript, rotas por arquivo com Expo Router (M7, M10). |

O único contrato entre os dois é o esquema do banco (m2): `words(id, word, pos, ipa, etymology)` e `senses(word_id, n, gloss, example)`. Mudou o esquema no script, muda o `domain` que lê aquelas tabelas no mesmo PR.

O app é offline (M5): nada de rede para consultar. O `.db` vai embutido (M8) e é aberto só para leitura.

Documentos:

- [Camadas do app](app.md) — `app`, `domain`, `ui`, `global`, quem importa quem e como nomear.
- [Componentes](components.md) — estrutura, estilos, acessibilidade e testes.

Decisões novas entram no registro do [PLANO.md](../../PLANO.md#4-registro-de-decisões); regras que valem para o código entram aqui.
