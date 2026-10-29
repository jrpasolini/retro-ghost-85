# Third-party notices and media scope

## MIT software scope

The [MIT License](LICENSE) covers this repository's original source code, documentation and authored narrative text, to the extent the copyright holders can license those contributions. It does not replace separate dependency licenses, provider terms, trademark rights or media permissions.

## Fonts distributed with the game

| Font | Copyright | License notice shipped with the site |
| --- | --- | --- |
| Chakra Petch | Copyright 2018 The Chakra Petch Project Authors | [Chakra Petch OFL](public/licenses/chakra-petch-OFL.txt) |
| Press Start 2P | Copyright 2012 The Press Start 2P Project Authors; Reserved Font Name “Press Start 2P” | [Press Start 2P OFL](public/licenses/press-start-2p-OFL.txt) |

Both font families use **SIL Open Font License 1.1**, not the project's MIT license. The complete upstream notices are copied unchanged from the installed Fontsource packages into `public/licenses/`, which Vite copies into the static distribution. Preserve these notices with redistributed font files.

## Dependencies

Direct dependencies are recorded in `package.json` and pinned in `package-lock.json`. Vite uses MIT; TypeScript uses Apache-2.0; Fontsource font packages identify OFL-1.1 for these families. Transitive dependencies retain their own notices and licenses, as recorded in their packages. This document does not relicense third-party packages. A copy of the upstream Vite license and bundled dependency notices accompanies the site in [public/licenses/vite-LICENSE.txt](public/licenses/vite-LICENSE.txt).

## Models and hosted services

- **Google Gemma 7B:** accessed through Cloudflare Workers AI. Weights are not bundled. Use is subject to the [Gemma Terms of Use](https://ai.google.dev/gemma/terms) and [Gemma prohibited-use policy](https://ai.google.dev/gemma/prohibited_use_policy). Making hosted model functionality available can carry obligations under those terms; the MIT software grant does not remove them.
- **Cloudflare:** Workers, Workers AI and KV remain external services with their own account, usage and billing conditions.
- **ElevenLabs voice:** uses the account's configured voice and `eleven_multilingual_v2`. No voice model or API credential is distributed. Voice usage, generated speech and permitted reuse remain subject to the applicable [ElevenLabs terms](https://elevenlabs.io/terms-of-use) and voice permissions.
- **Render, .Tech Domains, GitHub and GitHub Copilot Pro:** retain their own service terms and trademarks. Acknowledgement is not an endorsement or sponsorship claim.

## Music, artwork and portrait

The six bundled soundtrack files were generated for Retro-Ghost-85 using the **ElevenLabs Music web creation tool**, as confirmed by the maintainer. This establishes the stated tool provenance; it is not an independent audit of the generation-time account plan or all downstream reuse rights. The [ElevenLabs Music Terms](https://elevenlabs.io/music-terms) apply.

The artwork and portrait are project-supplied media. The image-generation tool, original source permissions and any likeness permissions were not independently established in this review. Existing files are preserved; see [the asset inventory](docs/ASSETS.md).

**Media files are not automatically offered under the MIT software license.** Obtain the maintainer's permission and verify applicable provider/source terms before republishing artwork, portrait, soundtrack or generated voice independently. This avoids asserting an unrestricted media sublicense without the necessary source records.

## Trademarks

Product names and historical references remain the property of their respective holders. The project is independent and distributes no proprietary ROMs, BIOS or disk images.
