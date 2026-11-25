# Cypher

Offline, open-source dictionary app for iOS (React Native + Expo).
v1: English only. Definitions come from [Wiktionary](https://en.wiktionary.org) via [kaikki.org](https://kaikki.org) (wiktextract), stored in a local SQLite database.

Plano e decisões: [PLANO.md](PLANO.md). Arquitetura e regras do app: [docs/architecture](docs/architecture/overview.md).

## License

Code: [MIT](LICENSE).
Dictionary data: Wiktionary, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The generated database is not committed; build it with the data script.

## Development

Requires Node, Python 3.11+ and, for iOS, Xcode.

```bash
npm install
npm test            # Jest: app + architecture checks
npm run typecheck
python3 -m unittest discover data   # data pipeline tests
```

The app needs `assets/cypher-en.db` (not in git). Download the kaikki dump once (~530 MB, ~30 min) and build the database (a few minutes):

```bash
mkdir -p data/raw
curl -sSf https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl.gz -o data/raw/kaikki-en.jsonl.gz
python3 data/build_db.py data/raw/kaikki-en.jsonl.gz assets/cypher-en.db
npm run ios
```

Fonts: Fraunces and Archivo (SIL Open Font License, `assets/fonts/`). `Fraunces.ttf` is modified: its underline sits closer to the text (React Native cannot set the underline offset). If you replace the file, apply it again with fontTools: `post.underlinePosition = -180` (the original is -300).

Architecture: [docs/architecture](docs/architecture/overview.md). Screens and visual design: [docs/design/DESIGN.md](docs/design/DESIGN.md).
