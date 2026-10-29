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

Local code rolls the die, moves tokens, and applies consequences. In a future integration, the language model will receive an **already-decided outcome** and narrate the scene. It will not roll, choose winners, alter progress, or control the CPU.

The complete local board remains playable without a model API. Story text is authored in advance in both English and Brazilian Portuguese.

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
ElevenLabs                                → planned: narration voice delivery
```

No account, database, or server-side game state is required for the local multiplayer experience. CPU decisions and die rolls remain local and deterministic with a saved RNG state.

The public site is served at `https://jrpasolini.tech/retro-ghost-85/`. `vite.config.ts` keeps `base: "./"` so scripts and assets resolve on that subpath.

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

- [`ESTRUTURA.md`](./ESTRUTURA.md) — living architecture and design notes (Portuguese).
- [`HISTORICO_NARRATIVO.md`](./HISTORICO_NARRATIVO.md) — historical background and the 40-square canon (Portuguese).
- [`estrategia.md`](./estrategia.md) — local players and CPU game modes (Portuguese).
- [`PLANO_I18N_EN_DEFAULT.md`](./PLANO_I18N_EN_DEFAULT.md) — localization checklist and compatibility requirements (Portuguese).

## Credits and legal notes

**MSX** is a trademark of its respective owners. Retro-Ghost-85 is an independent project, unaffiliated with and neither sponsored nor endorsed by any trademark holder.

No proprietary ROMs, BIOS, disk images, or other proprietary software are distributed. This is a text-and-DOM board game; it does not emulate hardware.

Historical references to companies, magazines, and equipment are descriptive and remain the property of their respective owners.

The existing original soundtrack was created with **ElevenLabs Music**. AI narration through Cloudflare Worker/Gemma and subsequent voice synthesis are separate development stages.

## License

To be determined.
