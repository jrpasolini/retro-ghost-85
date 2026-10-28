# EN-US / PT-BR — Localization QA and Handoff

**Branch:** `i18n/en-us` · **Base:** validated `master` (commit `c517ce0`).

This localization is independent of Cloudflare Worker/Gemma and ElevenLabs voice delivery. No external AI call has been added.

## Delivered

- Default **en-US**, regardless of browser locale, and optional **pt-BR**.
- Accessible flag controls **🇺🇸 USA / 🇧🇷 BR** at the upper-right of the initial setup dialog, with a second control in the game toolbar.
- Explicit language selection persisted in the browser; changing language does not reload the game.
- Forty complete English square stories, three Act transitions, the Act 1 narration and three-paragraph cinematic prologue.
- Localized effects, inspector, player setup, dice, ARIA labels, dialogs, trophy/Endgame copy, speaker status, log and recap, and human-readable portions of the Markdown save.
- Language-independent game state: IDs, square types, consequences, geometry, RNG, player positions and save JSON schema stay unchanged.
- Portuguese stories remain canonical in `src/data/`; the English catalog lives in `src/i18n/content.ts`.
- README in English plus `README.pt-BR.md` preserving Portuguese documentation.

## Test evidence

- **59 existing unit tests + dedicated new i18n unit tests**: execute `npm test`; `npm run build`.
- **Playwright Chromium browser acceptance**: `qa/verify-i18n.mjs` verifies EN first load, both flags, PT switching, game start, midgame switch, Portuguese-to-English save import, stable JSON and piece position, saved preference after reload, mobile UI captures.
- **Gameplay and geometry regression:** `qa/verify-resize.mjs` tests dynamic resizing without reload, four human players and four real die rolls, same board image, and script accepts ARIA labels in either language. `qa/verify-solo-ui.mjs` explicitly opts into PT for existing regression expectations.
- CI runs in separate `.github/workflows/i18n-audit.yml`, plus normal build and gameplay pipelines. See the PR checks and archived screenshots.

## Limits and follow-up

- Original raster images are **not modified**. In particular, `public/assets/casa-40-endgame.webp` contains Portuguese artwork text (“PUBLICAÇÃO”), so that embedded pixel text still needs an approved non-destructive localized visual treatment. Its HTML alt label is English in EN mode. The protected full-board `board-reference-edited.webp` remains unchanged.
- The known responsive jump at 680 px remains tracked; coordinates have not been modified.
- The Gemma narration phase should accept `PedidoNarracao.idioma` and use locale-appropriate instructions while keeping gameplay local. ElevenLabs voice synthesis comes only after narration is verified.
- No PR merge is authorized at this stage: review the bilingual UI and artwork note before integrating into `master`.
