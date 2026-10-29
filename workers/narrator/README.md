# Worker do Mestre — narração e voz

Os beats aprovados narram os fatos. O código seleciona e ordena os acontecimentos; a Gemma 7B acrescenta somente um comentário breve **depois** da história. Os parágrafos completos em português e inglês são preservados.

## Contrato e seleção

`prepareNarrationRequest(logSnapshot, jogadorId, act, lang)` usa o snapshot histórico do troféu, somente com os pousos daquele participante. Ignora casas atravessadas e turnos perdidos. Um deslocamento por efeito registra seu destino. Não passar acontecimentos posteriores ao troféu.

Cliente e Worker compartilham a seleção de até **dois beats por ato** ou **cinco no Endgame**. Priorizam fatalidades, marcos e magnitude dos efeitos, preservando a ordem temporal e o pouso mais recente. No encerramento, reservam também a abertura e a publicação; repetições usam a ocorrência mais recente.

```json
{
  "player": "Alex",
  "act": "2",
  "lang": "pt-BR",
  "endgame": false,
  "beats": [{ "id": 1 }, { "id": 10 }]
}
```

`POST /narrate` aceita atos `"2"`, `"3"`, `"4"`, `"endgame"`, idiomas `pt-BR`, `en`, `en-US` e até 256 IDs válidos. `squares` é alias de `beats`. O Worker refaz a seleção antes da inferência e resolve os textos pelo ID canônico; títulos, textos e pontuações arbitrários do cliente são ignorados. A casa 40 só é aceita no Endgame e deve ser a última entrada.

Resposta: `{ text, body, master, chars, lang, model, beats, ids, cached, fallback, key, inferenceMs, generation }`. `body` contém exclusivamente os beats originais. `text` é `body` seguido de `master`, separados por uma linha em branco. O cliente converte `text` para `{ ok, narration, model, fallback, cached }`.

## Chamada correta da Gemma 7B

Modelo padrão: `@cf/google/gemma-7b-it-lora`, substituível por `NARRATION_MODEL`. A versão `v9-gemma-brief-closing-comment` envia **uma única mensagem `user`**, com as instruções antes dos dados e uma indicação curta de resposta depois deles. Não usa um turno `system` separado. Ver [formatação oficial do Google](https://ai.google.dev/gemma/docs/core/prompt-structure) e [catálogo Cloudflare do modelo](https://developers.cloudflare.com/workers-ai/models/gemma-7b-it-lora/).

O pedido é uma frase curta, idealmente de 12 a 24 palavras, com tolerância de **até 40 palavras e 600 caracteres**. Há somente uma tentativa, `max_tokens: 96`, temperatura 0,3, sem cascata ou retry. O comentário usa o nome do participante, evita marcação de gênero, não reconta nem altera fatos e pode provocar com uma pergunta sobre o desafio vivido. No Endgame deve encerrar uma publicação que já aconteceu, sem anunciar outro desafio futuro.

A validação recusa saída vazia, acima dos limites, formatação indevida, termos de regras/números fora do nome e comentário sem pontuação final. Quantidade de frases é apenas diagnóstico, não motivo autônomo de rejeição. Nenhum filtro comprova toda a fidelidade semântica do texto gerado.

O prazo da inferência é **20 segundos**: o Worker limita a espera e envia um AbortSignal ao binding AI. O cliente espera até **25 segundos**, cobrindo transporte e tratamento da resposta. Cancelamento da chamada não garante ausência de processamento/cobrança remota. O jogo não depende da inferência.

`generation.status` distingue `accepted`, `rejected`, `timeout`, `model_error`, `unavailable`. Motivos, contagens e metadados de uso são sanitizados; não se expõem o texto recusado, mensagens internas do provedor ou segredos. `inferenceMs` mede o intervalo da chamada ao binding (incluindo atendimento pelo serviço), não apenas GPU; em hit de cache vale zero.

O cache de composição é consultado antes da inferência e inclui versão do prompt, modelo, idioma, nome, ato e beats. Armazena composições aceitas por 180 dias. Fallback retorna o corpo aprovado e não é cacheado, permitindo recuperação. KV tem consistência eventual: concorrência pode repetir trabalho.

## Áudio e operação

`POST /tts` recebe `{ "text": "...", "lang": "pt-BR" }`, retorna `audio/mpeg` e aceita até **2.800 caracteres**, mesmo limite da composição. Voz exclusivamente de `ELEVENLABS_VOICE_ID`, modelo `eleven_multilingual_v2`, estabilidade 0,75, similaridade 0,8, estilo 0,15 e speaker boost. A chave fica em `ELEVENLABS_API_KEY`, nunca no código. Falhas são sanitizadas; geração tem timeout de 15 segundos.

O cache de áudio inclui texto, idioma, voz, modelo e parâmetros, com versão separada da versão do prompt do narrador. Atualizar instruções da Gemma não invalida áudios existentes com o mesmo texto. A correção do prompt foi testada sem áudio. A integração posterior da interface validou uma geração real e o download do MP3, usando a voz e os parâmetros existentes.

- `GET /health`: modelo efetivo, versão do prompt e presença da configuração de voz, sem inferência.
- JSON limitado a 32 KiB; pedidos inválidos não chamam provedores.
- `/probe` e `/selftest` não são rotas públicas.
- CORS permite apenas origens enumeradas no código; CORS não autentica chamadas diretas.
- Os limites são por pedido. Não há quota autenticada por partida ou rate limit global. Cache não garante custo zero.
- A interface de troféus e Endgame chama o narrador com o snapshot do troféu. PLAY gera voz sob demanda e o cassete baixa o mesmo MP3; replay e download não solicitam nova síntese na sessão.

## Publicação e verificação

Bindings existentes `AI`, `CACHE`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_API_KEY` devem ser preservados. O Worker importa dados e seletor TypeScript do projeto, portanto precisa de bundle. Com Wrangler, executar `wrangler deploy` na pasta `workers/narrator`.

Na raiz, `npm test` inclui testes de contrato, limites, cache, prazo e fallback com provedores simulados; `npm run build` verifica TypeScript, Vite e assets relativos. A validação real dos quatro atos em ambos os idiomas é registrada separadamente, distinguindo inferência de cache e saída aceita de fallback.

## Diagnóstico que motivou a correção

A versão antiga enviava as instruções em `system`. Quatro chamadas retornaram 72–80 palavras e consumiram os 96 tokens de saída, com rejeição, sem timeout. No controle do Endgame, resumir os beats de 1.694 para 516 caracteres reduziu a entrada informada de 420 para 137 tokens, mas não resolveu a resposta longa. Preservar os beats completos e mover as instruções para `user` produziu uma frase com 27 tokens de saída em 2,966 segundos, embora suas 23 palavras ainda excedessem o antigo filtro de vinte. As medições históricas não representam a versão atual e não são uma garantia de latência.
