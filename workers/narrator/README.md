# Master narrator Worker

This Worker provides optional Gemma commentary and ElevenLabs speech for Retro-Ghost-85. The game rules and winner are determined locally. Authored English/Portuguese beats tell the story; the model adds a short comment at the end.

## API

### `GET /health`

Returns `{ ok, model, models, tts, prompt, voiceConfigured }` without inference. Presence of configuration is not an end-to-end provider check.

### `POST /narrate`

```json
{
  "player": "Alex",
  "act": "2",
  "lang": "en-US",
  "endgame": false,
  "beats": [{ "id": 5 }, { "id": 10 }]
}
```

Acts: `"2"`, `"3"`, `"4"`, `"endgame"`. Languages: `en`, `en-US`, `pt-BR`. `squares` remains an alias for `beats`. At most 256 valid IDs are accepted, then canonical selection limits the model's context to two beats per Act or five at Endgame. Square 40 belongs only to Endgame and must be the final input. Request JSON is limited to 32 KiB.

Client-authored prose, titles and scores are ignored. IDs resolve to approved localized text on the server. The browser supplies the trophy's historical snapshot; the server cannot independently authenticate the truth of a locally supplied match.

Response: `{ text, body, master, chars, lang, model, beats, ids, cached, fallback, key, inferenceMs, generation }`. `body` is the unchanged authored story. `text` appends `master` after a blank line. The browser service exposes it as `{ ok, narration, model, fallback, cached }`.

### `POST /tts`

```json
{ "text": "Your completed journey and closing comment.", "lang": "en" }
```

Returns `audio/mpeg`. Text is limited to 2,800 characters, as is the complete narration. Uses only the configured `ELEVENLABS_VOICE_ID`; arbitrary voice overrides are refused. No voice configuration returns an error; no API secret returns 503. Provider failures are sanitized. `x-cache` identifies an audio hit/miss and `x-narration-key` identifies its cache entry.

The voice model is `eleven_multilingual_v2`, with stability 0.75, similarity boost 0.8, style 0.15 and speaker boost. The synthesis request has a 15-second timeout. Voice permissions and provider account terms still apply.

## Gemma call and failure handling

Default model: `@cf/google/gemma-7b-it-lora`, overridable by `NARRATION_MODEL`. Prompt version: `v9-gemma-brief-closing-comment`. The request contains one `user` turn with instructions before the complete selected beats and a short response cue afterward. It does not rely on a separate `system` turn; see [Google's Gemma prompt format](https://ai.google.dev/gemma/docs/core/prompt-structure) and [Cloudflare's model reference](https://developers.cloudflare.com/workers-ai/models/gemma-7b-it-lora/).

One attempt per uncached request; `max_tokens: 96`, temperature 0.3. Target: 12–24 words; tolerated maximum: 40 words/600 characters. The model must not rewrite beats, decide outcomes or introduce game rules. Endgame closes an already-published game. Sentence count is diagnostic only. Format checks are not a complete semantic-fidelity guarantee.

The Worker bounds the inference wait to 20 seconds and sends an AbortSignal to the AI binding. The browser timeout is 25 seconds. Cancelling a request does not guarantee that remote processing or billing is undone.

`generation.status` is `accepted`, `rejected`, `timeout`, `model_error` or `unavailable`, with sanitized reasons, counts and optional usage/finish metadata. Rejected raw model text and provider error bodies are not exposed. `inferenceMs` includes service handling, not only GPU time; a cache hit reports zero.

Fallback delivers authored beats without a comment. There is no automatic retry or cascade to another model. Gameplay remains functional.

## Cache and operational boundaries

KV lookup precedes inference. Accepted compositions are stored for 180 days under a hash including prompt version, model, language, player, Act and beats. Fallback is not stored in Worker KV. The client may retain the displayed story during the current session.

Audio cache keys include text, language, voice, model and voice settings. Their version is separate from the narration prompt version, so a prompt update does not invalidate audio for unchanged text. Replay and download reuse a generated Blob in the browser session. KV is eventually consistent; concurrent misses can repeat work.

Only enumerated browser origins are allowed. CORS does not authenticate direct requests. There is no authenticated per-match quota or global rate limiter. `/probe` and `/selftest` are not public routes. Per-request bounds and caching do not guarantee zero cost.

## Configuration, deployment and tests

Required bindings: `AI`, `CACHE`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_API_KEY` (secret). Preserve existing bindings and secrets during updates; use your own resources for a fork. The Worker imports shared TypeScript, so deployment requires bundling. `wrangler deploy` from this directory uses `wrangler.toml`.

From the repository root, `npm test` covers the Worker with mocked AI/KV/TTS; `npm run build` checks the client. Browser QA also mocks narration and refuses real TTS. No test or health check should automatically spend provider credits. Deployment and live-provider verification are separate steps; see [deployment](../../docs/DEPLOYMENT.md) and [release review](../../docs/RELEASE_REVIEW.md).
