# Retro-Ghost-85

**🇺🇸 English (default)** · [🇧🇷 Português brasileiro](./README.pt-BR.md)

A digital board game set in **1985**, where up to four players follow the journey of a budding computer game developer—from BASIC listings copied out of a magazine to the day their own game appears in a catalog.

**40 squares. Four Acts. One Master storyteller.**

---

## The adventure

This is not a generic board of random challenges. It is a trip through the real-world obstacles of writing games in 1985: an obscure typo in a magazine listing, a cassette that will not load, a floppy disk drive, a stubborn sprite, the modem's unmistakable handshake, the BBS, the local user group, and the final publication deadline.

Every square carries a moment of wonder—or a setback hidden in the machine.

## The guiding rule

> **The die decides. The AI narrates.**

Local code rolls the die, moves tokens, and applies consequences. At Act trophies and Endgame, the Cloudflare Worker receives selected canonical story beats from the **already-decided outcome**, and Gemma appends a short closing comment. The model does not roll, choose winners, alter progress, or control the CPU.

The complete local board remains playable when the model API is unavailable, using the authored English and Brazilian Portuguese stories. This is **local gameplay resilience**, not a claim that the hosted site and TTS work fully offline.

## English / Portuguese localization

- **English (United States)** is the default on first launch, regardless of the browser's language.
- **Brazilian Portuguese** is available from the **🇺🇸 USA / 🇧🇷 BR** flag switch in the opening setup dialog and the game toolbar.
- You can switch languages without restarting the match, changing token positions, consuming random values, or losing progress.
- The prologue, all forty squares, the four Acts, game log, player controls, trophy descriptions, Endgame, and readable Markdown exports follow the selected language.
- Only an explicit choice is stored as a local preference. Language is not a gameplay property.

## Save your match to Markdown

The REC/PLAY cassette controls export and import a readable `.md` file containing a structured JSON block plus a narrated log. The JSON is the source of truth; its schema and mechanical values stay the same across languages. A save exported in Portuguese can be loaded while playing in English, and vice versa.

## Run locally

```bash
npm ci
npm run dev
```

Vite runs the development server. To verify a release:

```bash
npm test
npm run build
```

GitHub Actions also checks compilation, unit tests, layout/resize behavior, and English/Portuguese browser acceptance via Playwright.

## Architecture

```
https://jrpasolini.tech/retro-ghost-85/   → static site (Vite base "./")
GitHub Actions + Playwright               → automated game and UI checks
Cloudflare Worker + Gemma 7B              → authored journeys and brief closing comments in trophy/Endgame dialogs
ElevenLabs API                            → on-demand voice for Act trophies / Endgame (via Worker)
```

No account, database, or server-side game state is required for the local multiplayer experience. CPU decisions and die rolls remain local and deterministic with a saved RNG state.

The documented project entry points are `https://jrpasolini.tech/retro-ghost-85/` and `https://retro-ghost-85.onrender.com/`. Verify the deployed demo and Worker from a private browsing session before submission. `vite.config.ts` keeps `base: "./"` so scripts and assets resolve on the subpath.

## Narration worker

The Master uses authored Portuguese and English beats for all forty squares. A shared selector keeps at most two beats per act and five at the ending, before inference. Gemma 7B adds a brief closing comment after the authored story; it never changes gameplay. The trophy and Endgame dialogs display these journeys and use a themed PLAY/cassette deck. PLAY requests the configured ElevenLabs voice through the Worker, starts playback, and unlocks an MP3 download. Replay and download reuse the generated audio during the session.

| | |
| --- | --- |
| Worker | `https://retro-ghost-85-narrator.antonio-pasolini.workers.dev` |
| Default model | `@cf/google/gemma-7b-it-lora`, overridable by `NARRATION_MODEL` |
| Client | `prepareNarrationRequest(logSnapshot, playerId, act, lang)`, `checkNarratorHealth()`, `requestNarration({ player, act, lang, beats })` |
| Contract | `POST /narrate → { text, model, fallback, cached, ... }`; `POST /tts → audio/mpeg` |
| Bounds | One model call per uncached request, 96 output tokens, up to 40 comment words; 20-second inference deadline and 25-second client timeout; composed text and TTS at most 2,800 characters |

The Worker resolves canonical text by ID and language, validates inputs, and checks its versioned cache before inference. Gemma 7B receives the instructions and full beats in one user message, without a separate system turn. The story remains unchanged and the model only adds its closing comment. On model failure it returns the authored body. TTS uses the configured voice and a separate audio cache. These are per-request bounds, not authenticated per-game quotas or a zero-cost guarantee. See [the Worker documentation](workers/narrator/README.md) for contracts, configuration, and remaining safeguards before enabling narration buttons.

## Documentation

- [`STATUS_ATUAL.md`](./STATUS_ATUAL.md) — **current** gameplay, integration, decisions and known limitations (Portuguese).
- [`SUBMISSAO_WEEK4_2026.md`](./SUBMISSAO_WEEK4_2026.md) — challenge submission and release checklist (Portuguese).
- [`ESTRUTURA.md`](./ESTRUTURA.md) — historical design evolution and implementation log (Portuguese).
- [`HISTORICO_NARRATIVO.md`](./HISTORICO_NARRATIVO.md) — historical background and the 40-square canon (Portuguese).
- [`estrategia.md`](./estrategia.md) — local players and CPU game modes (Portuguese).
- [`PLANO_I18N_EN_DEFAULT.md`](./PLANO_I18N_EN_DEFAULT.md) — **historical** localization plan (Portuguese); localization has since been implemented.

## Credits and legal notes

**MSX** is a trademark of its respective owners. Retro-Ghost-85 is an independent project, unaffiliated with and neither sponsored nor endorsed by any trademark holder.

No proprietary ROMs, BIOS, disk images, or other proprietary software are distributed. This is a text-and-DOM board game; it does not emulate hardware.

Historical references to companies, magazines, and equipment are descriptive and remain the property of their respective owners.

The six soundtrack tracks are attributed to **ElevenLabs Music**. The separate **ElevenLabs API TTS** path generates spoken narration on demand for the Act trophies and Endgame. The short dynamic closing comment is generated with **Gemma 7B by default**; its exact deployed model can be overridden with `NARRATION_MODEL`. Asset rights must be checked before public release.

## License and media rights

Original source code and accompanying software documentation are under the **MIT License** (`LICENSE`). Original artwork, images, audio, voice and other media are **not automatically licensed under MIT**; see [`ASSETS_E_CREDITOS.md`](./ASSETS_E_CREDITOS.md) for the publication rights checklist. Dependencies and fonts retain their respective licenses.

## Hacktoberfest Week 4 — Ghost in the Machine

The project and repository were created on **October 26, 2026**, within Week 4 of the Hacktoberfest Open-Source AI Challenge. The open-weight Gemma model supplies an intentionally small, variable **narrative closing comment** during Act trophies and Endgame; handcrafted stories and the deterministic local board are distinct components. This is real but limited AI involvement, not a claim that the model generates all stories or drives the game mechanics. The article will explain the open-weight choice, demonstrate the runtime response and discuss fallback behavior.

The repository stays **private until the DEV publication day** by the author's decision; then it will become public with the final submission. See [`STATUS_ATUAL.md`](./STATUS_ATUAL.md) for the authoritative implementation state and [`SUBMISSAO_WEEK4_2026.md`](./SUBMISSAO_WEEK4_2026.md) for official rules and publication checks. Any commits made after the challenge deadline must be disclosed here with dates.
