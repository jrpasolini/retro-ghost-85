# Worker do Mestre — narração e voz

Implementa o **momento 2** (texto) e prepara o **momento 3** (voz) do Retro Ghost 85.

## Princípio

**O dado decide, a IA narra.** O Worker não conhece regra de jogo. Ele recebe as casas
em que o jogador **parou** — com a descrição original de cada uma — e devolve uma
narração curta. Nada mais.

## Contrato

```http
POST /narrate
{
  "player": "Melissa",
  "lang": "pt-BR",            // ou "en"
  "act": 2,
  "endgame": false,
  "squares": [
    { "id": 1,  "titulo": "A revista na banca", "tipo": "marco",   "descricao": "..." },
    { "id": 5,  "titulo": "Salvar no cassete",  "tipo": "evento",  "descricao": "..." }
  ]
}
```

Resposta: `{ "text": "...", "cached": false, "key": "narr:...", "lang": "pt-BR" }`
ou, em falha do modelo, `{ "text": "<fallback determinístico>", "fallback": true }`.

```http
POST /tts
{ "text": "...", "lang": "pt-BR" }
```
Resposta: `audio/mpeg` (cache por hash). Sem `ELEVENLABS_VOICE_ID` configurado,
responde `voice_id_ausente` — **nunca** cai numa voz padrão por acidente.

## Regras embutidas

- **Só o que está nas descrições.** O modelo não pode inventar acontecimento, personagem ou consequência.
- **Nenhum número.** Casa, dado, progresso, placar. Há um detector (`violates`) que rejeita a resposta e tenta de novo; se falhar duas vezes, cai no fallback determinístico.
- **Instigar pode, prever não.** O Mestre pode duvidar do jogador em voz alta, jamais antecipar o final.
- **Casas de passagem não entram.** Só pousa quem para — o cliente manda apenas as casas com efeito.
- **Sem tags de emoção.** A interpretação vem do texto; `eleven_multilingual_v2` + `voice_settings` (estabilidade alta, estilo baixo). Um cache só, sem risco de servir áudio de outra variante.

## Custo

Quatro narrações por partida, no máximo dez casas por narração, cada descrição truncada em
700 caracteres. Saída limitada a 320 tokens. O áudio é pago **uma vez** por texto (cache por hash).

## Deploy

```bash
cd workers/narrator
wrangler secret put ELEVENLABS_API_KEY   # uma vez
wrangler deploy
```

Bindings esperados: `AI` (Workers AI) e `CACHE` (KV `retro-ghost-85-narrator-cache`).

## Pendências

- Voz do Mestre (momento 3) — id fica em `ELEVENLABS_VOICE_ID`.
- Integração no cliente: botão "Ouvir o Mestre" e estado de fallback.
- ID3 nos MP3 do troféu.
