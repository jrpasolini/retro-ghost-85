# Deployment and operations

## Frontend

The frontend is static. Build with `npm ci && npm run build`; publish **`dist/`**. Render can build the repository's selected branch automatically. The repository currently uses `master`; confirm the actual service settings before changing an existing deployment.

`vite.config.ts` uses `base: "./"` so static assets work at a domain root or under `/retro-ghost-85/`. A successful Git push is not evidence that the hosted site has finished rebuilding. After a release, wait for the host, reload the public page, check the rendered version and inspect console/network errors.

`VITE_NARRATOR_URL` is an optional **public** Worker URL read at build time. The default points to the project's configured narrator. Copy `.env.example` to an ignored `.env` for overrides, then rebuild. Never put provider API keys in a `VITE_` variable: those values are included in browser code.

## Narrator Worker

The Worker must be bundled because it imports TypeScript beat data and selection functions from the repository. See [the Worker guide](../workers/narrator/README.md).

| Binding | Type | Purpose |
| --- | --- | --- |
| `AI` | Workers AI | Gemma inference |
| `CACHE` | Workers KV | Narration and MP3 caches |
| `ELEVENLABS_VOICE_ID` | Plain variable | Explicitly chosen narration voice |
| `ELEVENLABS_API_KEY` | Secret | ElevenLabs authentication |
| `NARRATION_MODEL` | Optional plain variable | Override the default Gemma model |

For your own deployment, configure your own KV namespace, approved voice, provider secret and allowed origins. Existing IDs in `wrangler.toml` describe this project's deployment; they are not credentials and do not grant access. Preserve existing secrets and bindings when updating an existing Worker. A fork must not depend on the maintainer's public endpoint as its own production backend.

With Wrangler installed and authenticated, from `workers/narrator`:

```sh
wrangler secret put ELEVENLABS_API_KEY
wrangler deploy
```

Use the normal secure secret prompt. Do not write credentials to a document, commit or terminal transcript. Deployment is a separate action from editing this repository.

## Verification

`GET /health` returns the effective model, prompt version and whether a voice is configured; it does not run inference or prove the providers work. `POST /narrate` and `POST /tts` require bounded, valid input. A text fallback and successful AI commentary must be distinguished explicitly.

Unit tests and browser QA use mocks. Any live provider check must be deliberate, small, recorded and separated from mocked validation. Speech generation may consume account credits. Do not automatically generate live audio in CI or as a health check.

The public CORS allowlist is in `worker.js`; check it when changing domains or development ports. CORS is not authentication. Configure suitable account budgets and abuse protections before treating the endpoint as a broadly available public service. The current implementation does not enforce authenticated per-game quotas or a global request rate limit.

## Legal files in the build

Vite copies `public/licenses/` to `dist/licenses/`. The software MIT notice, Vite notices and both font OFL notices must accompany the distributed site. Media and external service terms are described in [third-party notices](../THIRD_PARTY_NOTICES.md). Keep source/provenance records for new media.
