# Contributing

English is the default language for current documentation and the application's first visit. Keep the Brazilian Portuguese alternative functional. Historical Portuguese planning and QA notes are retained under [docs/archive](docs/archive/README.md).

## Setup and checks

Use Node.js 22.18+ and npm:

```sh
npm ci
npm test
npm run build
npm audit
```

The test runner uses Node's TypeScript support. Build output belongs in `dist/`, which is ignored by Git. Environment files and Worker secrets must never be committed; `.env.example` contains only a public URL.

For the existing browser checks, install the pinned CI runner without changing the lockfile:

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install --with-deps chromium
node qa/verify-resize.mjs
node qa/verify-solo-ui.mjs
node qa/verify-i18n.mjs
```

These scripts start their own local servers; their ports must be free. They mock narrator routes and disable real TTS. They do not verify a production deployment or paid-provider availability. Artifacts go under ignored `qa/output/`.

## Preserve the game contract

- Local code owns RNG, movement, effects, penalties, CPU turns and victory.
- Do not change approved board pixels, house geometry or token alignment as incidental cleanup.
- Narration must use the trophy's stored historical path, not future turns or other players' paths.
- Preserve save schema compatibility and English/Portuguese state invariance.
- Generate voice only after the player's explicit PLAY action. Reuse generated audio for replay/download.
- Keep keyboard focus, mobile layouts, user audio settings and failure recovery usable.
- Test meaningful behavioral changes and report the exact checks actually performed.

## Attribution and scope

Contributions to original code, authored text and documentation are made under the [MIT License](LICENSE). Third-party code, fonts and media keep their own terms; add source and license records to [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [docs/ASSETS.md](docs/ASSETS.md) when adding assets. Do not add provider credentials, private prompts, personal browser captures or generated test MP3s to the repository.
