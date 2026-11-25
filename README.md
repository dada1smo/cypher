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

If `pod install` fails with an encoding error, run with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`.

### On an iPhone (free Apple ID)

Set your team in `app.json` (`ios.appleTeamId`, the OU of your Apple Development certificate), connect the
iPhone with Developer Mode on, then build in Release (the JavaScript goes inside the app, no Metro needed) and install.
`npx expo run:ios --device` cannot do the first build: it does not let Xcode create the provisioning profile, so use `xcodebuild` with `-allowProvisioningUpdates`:

```bash
npx expo prebuild --platform ios
xcodebuild -workspace ios/Cypher.xcworkspace -scheme Cypher -configuration Release -destination id=<UDID> -derivedDataPath ios/build -allowProvisioningUpdates build
xcrun devicectl device install app --device <UDID> ios/build/Build/Products/Release-iphoneos/Cypher.app
```

`xcrun devicectl list devices` shows the UDID. The first time, trust your certificate on the iPhone: Settings → General → VPN & Device Management.
With a free Apple ID the app stops opening after 7 days: run the last two commands again.

Fonts: Fraunces and Archivo (SIL Open Font License, `assets/fonts/`).

Architecture: [docs/architecture](docs/architecture/overview.md). Screens and visual design: [docs/design/DESIGN.md](docs/design/DESIGN.md).
