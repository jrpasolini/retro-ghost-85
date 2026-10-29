# Architecture

## Runtime boundaries

Retro-Ghost-85 is a Vite/TypeScript DOM/CSS board game. No database, authentication or remote match state is required. A match contains one to four human/local CPU participants, a saved RNG cursor, a game log, trophies and local state. At least one participant is human.

The first player to reach square 40 wins regardless of project progress. A single D6 drives movement. Local deterministic rules apply project changes, extra rolls, lost turns and local CPU turns. Individual Act visits and trophy ownership are separate concepts.

| Area | Source |
| --- | --- |
| Board content and canonical mechanics | `src/data/casas.ts`, `src/motor/tabuleiro.ts` |
| Match, turn and trophy state | `src/motor/partida.ts`, `src/motor/turnos.ts`, `src/motor/log.ts` |
| Board/token projection | `src/motor/posicao.ts`, `src/style.css` |
| Save schema and validation | `src/estado/save.ts` |
| English default and Portuguese presentation | `src/i18n/` |
| Authored journey beats and selection | `src/data/beats.ts`, `src/data/beats-en.ts`, `src/narrador/beats.ts` |
| Narration and audio client | `src/services/narrator.ts`, `src/services/journey.ts` |
| Journey dialog state | `src/narrador/journey-panel.ts`, `src/main.ts` |
| Provider API and caches | `workers/narrator/worker.js` |

## Saves and localization

Save schema 1 is a Markdown document containing a structured JSON code block and human-readable history. JSON is the source of truth. The loader validates state; it does not execute narrative prose as instructions. English and Portuguese exports keep the same gameplay values. English is the fresh-visit default, and only an explicit user language selection is persisted locally.

## Narration

The first participant to enter each later Act receives its trophy. Each trophy stores the participant ID, turn and historical path at that achievement. UI narration uses that snapshot, preventing later events from leaking into an earlier trophy.

Selection includes actual landings and effect destinations, not merely passed squares or skipped turns. It deduplicates by most recent occurrence, prioritizes fatality/milestone/effect magnitude and preserves chronology. At most two beats are used for an Act and five for Endgame; the final landing is reserved, with the beginning and publication retained at the ending.

The Worker resolves IDs to canonical localized beats and ignores client-supplied narrative prose. It checks a versioned KV cache before making one bounded Gemma request. The beats remain unchanged. Gemma adds only a short closing comment; it never adjudicates gameplay. The Gemma 7B request uses one `user` message containing instructions and context, without a separate `system` turn.

Comment target: 12–24 words; tolerated maximum: 40 words/600 characters. Output budget: 96 tokens. Empty, oversized, unfinished or improperly formatted comments and rule/score intrusions are rejected. Sentence count is diagnostic only. Validation is not a guarantee of full semantic fidelity. On unavailable/error/rejected output, authored beats still form a usable story and `fallback` is explicit.

## Voice and interaction

The journey dialog shows the story and a themed PLAY/PAUSE key beside a download cassette. PLAY requests `/tts` only on explicit interaction. The configured ElevenLabs voice uses `eleven_multilingual_v2`. A successful MP3 is retained in memory for replay/download; concurrent requests are shared. Closing or switching the view stops playback and guards against stale asynchronous updates. New/load sessions clear local journey caches and revoke previous Blob URLs.

Background music pauses during speech and resumes from its previous position, respecting AUDIO OFF and an already-finished ending track. Browser autoplay restrictions may require a second PLAY after asynchronous generation; the ready audio remains available.

## Bounds and operational limits

- Request JSON: at most 32 KiB; up to 256 valid input IDs before canonical selection.
- One model attempt per uncached narration; no retry/model cascade.
- Inference wait: 20 seconds with AbortSignal; client timeout: 25 seconds.
- Complete narration and TTS input: at most 2,800 characters.
- Text and audio caches are separately versioned; replay/download reuse audio.
- KV is eventually consistent; simultaneous misses may repeat provider work.
- CORS limits browser origins but does not authenticate direct clients.
- Authenticated per-match quotas and global rate limiting are not implemented. Provider accounts, budgets and public endpoint abuse remain operational responsibilities.
- No service worker/PWA cache guarantees a fresh offline load. Local gameplay can continue without narration once the app is loaded.

## Documentation precedence

This document, the root READMEs and the Worker guide describe current behavior. [Historical planning and QA documents](archive/README.md) record older proposals and results; they are not current deployment evidence or implementation instructions.
