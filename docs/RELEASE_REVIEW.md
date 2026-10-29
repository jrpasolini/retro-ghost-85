# Release review — 2026-10-29

Scope: current repository code, English-first documentation, residual-file cleanup, attribution and license notices. This is a source/dependency review, not a legal clearance opinion, a forensic Git-history scan or proof of a new production deployment.

## Findings corrected

| Finding | Resolution |
| --- | --- |
| Root README still described future AI integration; Portuguese README still named Gemma 4 and the old request contract | Rewritten current English README and synchronized Portuguese alternative; current architecture/deployment/Worker guides are in English |
| License was “to be determined”; no software copyright notice | Standard MIT license, Copyright (c) 2026 Antonio Pasolini and contributors; package metadata and distributed software notice added |
| Technology credits and media provenance were incomplete | Added CREDITS, third-party notices and a hashed media inventory; music origin confirmed by the maintainer as ElevenLabs Music's web tool |
| Font binaries shipped without accompanying upstream license notices in the build | Added unchanged Chakra Petch and Press Start 2P SIL OFL notices under public/licenses |
| Twelve planning/QA documents mixed current guidance with superseded proposals | Preserved under docs/archive with an explicit historical-status notice and adjusted Markdown links |
| Unused original board reference and alternate cassette WebP were copied into every static build | Preserved byte-identically under docs/reference; runtime artwork and geometry unchanged |
| Retired local narrator stub, its obsolete test and old button CSS remained after the real integration | Removed dead code/styles; current narration/audio contract tests retained |
| CI retained a one-off job with write permission to delete a specific old audit branch | Removed the job and obsolete branch trigger; build/test jobs require read-only repository permission |
| Language acceptance did not run on ordinary master pushes | Added current master/path triggers |
| Browser QA could call the real narration endpoint when opening trophies/Endgame | Added deterministic narrator route fixtures and explicit refusal of real TTS |
| A late audio.play resolution/rejection could update a closed journey or resume a different view's soundtrack | Guarded the asynchronous completion with the view revision; regression covers both late success and failure |
| Package version differed from the existing BUILD 0.6.0 interface label | Aligned package and lockfile metadata to 0.6.0 without changing dependency resolutions |

## Verification

- `npm test`: 99 tests passed, with no failures, including offline QA fixtures and the stale-playback regression.
- TypeScript/Vite production build and relative-asset checks pass.
- Current dependency audit reports zero known vulnerabilities at review time. This is not a guarantee against undiscovered vulnerabilities.
- `npm run check:docs` passed: 91 current local Markdown links and 20 unchanged media hashes, plus required legal files, MIT package metadata, English default and matching package versions.
- Upstream font notices, the software MIT notice and Vite bundled dependency notices are present in `dist/licenses/` after the build.
- Browser QA scripts pass syntax checks; their mocked routes are unit-tested. The full Playwright jobs were not rerun locally in this documentation review and must be checked in GitHub Actions after publication.
- No new live AI inference, speech generation, provider deployment or account configuration change is required by this review.
- The credential-pattern scan checked 94 current text files with zero findings. No tracked .env, private-key files, generated QA output, dist or node_modules directories were found. The review's credential-pattern scan reports filenames/line numbers only, not matching values, and covers the current worktree rather than all Git history.

## Remaining boundaries

### Public provider endpoints

The Worker has per-request validation, output/deadline bounds and caches, but no authentication, authenticated per-match quotas or global rate limit. CORS limits browsers, not direct HTTP callers. A public billable endpoint still needs an operational decision about abuse protection and budget enforcement. This review does not silently create new infrastructure or claim cost/stability guarantees.

### Media rights

MIT applies to original software, documentation and authored narrative text. Fonts retain OFL. The maintainer confirmed the music creation tool, but this review did not establish the generation-time ElevenLabs account plan or every independent reuse right. Artwork/portrait tool provenance and individual source/likeness permissions remain unverified. Those media are not automatically sublicensed under MIT; see THIRD_PARTY_NOTICES and ASSETS.

### Model behavior and hosting

Format acceptance does not certify every generated comment's factual or editorial quality. Cached/health/mock responses must be distinguished from live inference. A passing local build or Git push does not prove that Render finished deploying; verify the actual hosted site after a release. English remains the fresh-visit default, while an explicitly saved Portuguese preference remains valid.
