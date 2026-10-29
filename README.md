# Retro-Ghost-85

**English (default)** · [Português brasileiro](README.pt-BR.md)

A retro board game about making your first computer game in **1985**: BASIC listings, cassette backups, floppy disks, stubborn sprites, BBS messages, and finally seeing your name in a catalog.

**40 squares · 1–4 local players · Four Acts · One Master storyteller**

[Play on the project site](https://jrpasolini.tech/retro-ghost-85/) · [Render deployment](https://retro-ghost-85.onrender.com/)

## The die decides. The AI narrates.

The browser rolls one six-sided die, moves tokens, applies consequences, controls local CPU turns, and determines the winner. **Gemma never decides gameplay.** The first player to reach square 40 wins; project progress is recorded but is not a condition for winning.

The first player to enter each later Act earns that Act's trophy. The trophy records that player's historical journey at the moment of the achievement. Each journey combines approved story beats with a brief closing comment from **Google Gemma 7B**, served through **Cloudflare Workers AI**. There are at most two selected beats per Act narration and five for Endgame, preserving chronology and the ending.

Optional voice uses the configured **ElevenLabs** voice. The retro **PLAY/PAUSE** key generates and plays the journey; the adjacent cassette downloads the resulting MP3. Replay and download reuse audio within the session. The soundtrack pauses during narration and resumes afterward, respecting AUDIO OFF.

Gameplay remains available if narration services fail. Authored beats provide the story fallback. AI commentary and voice require a network connection and configured services; the project does not implement an installable offline/PWA cache.

## Play and save

- Choose one to four human/local CPU participants, with at least one human.
- Advance through the board using **1D6**. Bonuses and penalties are deterministic local rules.
- **REC / SAVE** downloads a readable Markdown match file. **PLAY / LOAD** resumes it.
- The embedded JSON block is the save's source of truth; narrative prose is not executed as instructions.
- English is the default on a fresh visit. Brazilian Portuguese is available through the flag selector. An explicit language choice is remembered without changing match state.
- Sound starts after a user gesture where required by the browser. The opening uses a single **PRESS SPACE TO START** step.

## Run locally

Use Node.js **22.18 or newer** and npm. CI targets Node.js 22.

```sh
npm ci
npm run dev
```

Vite prints the local URL. To use the port employed during project review:

```sh
npm run dev -- --host 127.0.0.1 --port 4185 --strictPort
```

Release checks:

```sh
npm test
npm run build
npm audit
```

`npm run build` runs TypeScript, builds `dist/`, and verifies relative asset paths. `base: "./"` supports hosting beneath `/retro-ghost-85/` as well as at a domain root. No database, login, or server-side match state is needed.

## Narration and hosting

| Layer | Role |
| --- | --- |
| Vite + TypeScript + DOM/CSS | Game UI, local rules, save/load and localization |
| Render | Static frontend hosting/deployment |
| .Tech Domains | The project's `.tech` web identity |
| Cloudflare Workers | `/health`, `/narrate` and `/tts` API |
| Cloudflare Workers AI + Google Gemma 7B | Brief Master commentary after approved beats |
| Cloudflare Workers KV | Versioned text and audio caches |
| ElevenLabs Music | Six soundtrack tracks generated using the ElevenLabs web music-creation tool |
| ElevenLabs Text to Speech | Optional voiced journeys and MP3 download |
| GitHub Actions + Playwright | Build, unit, language and layout checks |

`VITE_NARRATOR_URL` selects the narration Worker; see [.env.example](.env.example). It is a public URL, never an API key. Provider credentials remain in Worker secrets. The current default model is `@cf/google/gemma-7b-it-lora`.

The Worker makes at most one model call per uncached narration, with 96 output tokens and a 40-word comment limit. The inference wait is bounded to 20 seconds and the client timeout is 25 seconds. Complete narration/TTS text is limited to 2,800 characters. These are **per-request bounds**, not authenticated per-game quotas or a guarantee of zero cost. See the [Worker guide](workers/narrator/README.md) and [deployment guide](docs/DEPLOYMENT.md).

## Documentation

- [Documentation index](docs/README.md) — current documents and historical archive.
- [Architecture](docs/ARCHITECTURE.md) — rules, snapshots, narration, audio and failure handling.
- [Deployment](docs/DEPLOYMENT.md) — frontend, Worker bindings and verification.
- [Contributing](CONTRIBUTING.md) — setup, checks and preservation of approved artwork.
- [Credits](CREDITS.md) — creator, technology and development acknowledgements.
- [Third-party notices](THIRD_PARTY_NOTICES.md) — fonts, external models, services and media scope.
- [Release review](docs/RELEASE_REVIEW.md) — evidence and remaining operational limitations.

## Author and license

Created and maintained by **Antonio Pasolini (jrpasolini)**.

Copyright (c) 2026 Antonio Pasolini and contributors. The project's original source code, documentation and authored narrative text are licensed under the [MIT License](LICENSE).

Fonts retain their **SIL Open Font License 1.1** notices. Bundled artwork, portrait and music are documented separately in [third-party notices](THIRD_PARTY_NOTICES.md); the MIT software license does not relicense external services, model weights, trademarks or media rights. No proprietary ROMs, BIOS or disk images are included. Historical brand references are descriptive; technology credits do not imply sponsorship or endorsement.
