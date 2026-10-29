# Worker do Mestre — narração e voz

O jogo determina os acontecimentos. Os beats aprovados, um para cada uma das 40 casas, determinam a narrativa em português e inglês. A Gemma acrescenta somente uma frase curta do Mestre.

## Fluxo e contrato

`prepareNarrationRequest()` recebe o snapshot do log do troféu, o jogador, o ato e o idioma. Só considera as casas em que aquele participante parou, incluindo o destino de um deslocamento por efeito; ignora casas apenas atravessadas e turnos perdidos. Não deve receber acontecimentos posteriores ao troféu.

O cliente seleciona até **dois beats por ato** ou **cinco no endgame**. A seleção prioriza fatalidades, marcos e magnitude do efeito, mantém a ordem temporal e o pouso mais recente; no encerramento também reserva o início e a publicação. Repetições usam a ocorrência mais recente.

```json
{
  "player": "Alex",
  "act": "2",
  "lang": "pt-BR",
  "endgame": false,
  "beats": [{ "id": 1 }, { "id": 10 }]
}
```

`POST /narrate` aceita `act` igual a `"2"`, `"3"`, `"4"` ou `"endgame"`; `lang` é `pt-BR`, `en` ou `en-US`. `squares` permanece como alias de entrada para `beats`. A casa 40 só entra no endgame, e deve ser a última entrada. O Worker aceita até 256 IDs válidos, mas refaz a seleção **antes de chamar o modelo**. Textos, títulos e pontuações enviados pelo cliente são ignorados: os IDs resolvem os beats canônicos no idioma solicitado.

Resposta: `{ text, body, master, chars, lang, model, beats, ids, cached, fallback, key, inferenceMs }`. `inferenceMs` mede o intervalo da chamada ao binding AI, incluindo o atendimento pelo serviço; em hit de cache vale zero. Não representa tempo isolado de GPU. O serviço do navegador converte `text` para o resultado `{ ok, narration, model, fallback, cached }`.

O corpo é montado sem inferência. Em falta de cache, há no máximo **uma chamada** à Gemma, com `max_tokens: 96`, solicitando uma frase de até 20 palavras e 220 caracteres. Respostas vazias, longas, com várias frases, números ou termos de regras são recusadas. Erros e respostas recusadas entregam o corpo aprovado com `fallback: true`, sem retry ou cascata de modelos. Esse filtro não comprova fidelidade semântica de toda frase gerada.

O modelo padrão é `@cf/google/gemma-7b-it-lora`, substituível pelo binding `NARRATION_MODEL`. O cache de composição inclui versão do prompt, modelo, idioma, nome, ato e beats. É consultado antes da inferência; composições com frase válida são armazenadas por 180 dias. Fallback não é armazenado, permitindo recuperação futura. KV tem consistência eventual: chamadas concorrentes ainda podem repetir trabalho.

## Áudio

`POST /tts` recebe `{ "text": "...", "lang": "pt-BR" }` e retorna `audio/mpeg`. Limite de **2.800 caracteres**, igual ao máximo da composição. Usa exclusivamente `ELEVENLABS_VOICE_ID`, modelo `eleven_multilingual_v2`, estabilidade 0,75, similaridade 0,8, estilo 0,15 e speaker boost. Não usa tags de emoção. Sem voz configurada retorna erro; sem chave retorna 503. Falhas do provedor retornam erro sanitizado, sem expor seu corpo.

O cache de áudio inclui texto, idioma, modelo, voz e parâmetros de voz. Um hit evita uma nova geração. A síntese tem timeout de 15 segundos. Trocar a voz ou o texto gera uma nova chave.

## Operação e limites

- `GET /health` retorna modelo efetivo, versão do prompt e presença da configuração da voz, sem inferência.
- `/probe` e `/selftest` não ficam disponíveis publicamente.
- JSON limitado a 32 KiB; pedidos inválidos não chamam provedores.
- CORS permite os domínios do projeto e as origens locais enumeradas em `worker.js`. CORS não autentica chamadas diretas.
- Os limites são por pedido. **Ainda não há quota autenticada por partida, rate limit global ou garantia de custo zero.** Não afirmar que existem só quatro chamadas por partida no servidor. Essa proteção deve ser definida antes da abertura dos botões de narração ao público.
- A interface continua usando o narrador local. Este commit integra o contrato e o Worker; a conexão dos botões é uma etapa posterior.

## Configuração e deploy

Bindings: `AI` (Workers AI), `CACHE` (KV), `ELEVENLABS_VOICE_ID` (variável), `ELEVENLABS_API_KEY` (secret). Preservar os bindings existentes ao publicar. Nunca colocar a chave no repositório.

O Worker importa o seletor e os dados TypeScript do projeto. O deploy precisa fazer bundle dessas dependências; Wrangler usa `wrangler.toml`:

```sh
cd workers/narrator
wrangler deploy
```

Na raiz, `npm test` inclui os testes do Worker com AI, KV e ElevenLabs simulados. Os testes não geram áudio pago. `npm run build` valida o cliente e os caminhos dos assets.

## Validação real de 28/10/2026

Quatro chamadas sem cache (Ato 2, Ato 3, Ato 4 e Endgame) levaram 8,657 s, 8,725 s, 8,231 s e 7,941 s no total. Os intervalos do binding AI foram 8,308 s, 7,971 s, 8,006 s e 7,692 s. Uma amostra por ato, sem teste de carga. Todas devolveram o corpo autoral por fallback; a frase da Gemma ainda precisa ser calibrada e validada. Uma chamada separada de diagnóstico respondeu com 73 palavras e quatro frases, excedendo o formato. Não considerar o prompt aprovado apenas por HTTP 200. Nenhum áudio foi gerado.
