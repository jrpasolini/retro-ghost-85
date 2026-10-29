# Retro-Ghost-85 — estado vigente e publicação

> Atualizado em **29/10/2026** para o commit-base `a4f7998` da branch `master`. Este é o resumo operacional vigente. Documentos de planos, PRs e auditorias antigas são registros históricos e não substituem o código.

## O que está implementado

- Jogo de tabuleiro digital ambientado em 1985: **40 casas, quatro atos, 1 a 4 participantes** no mesmo dispositivo. Slots humanos e CPU local; pelo menos um humano.
- Movimento por **1d6** (não 2d6). RNG e regras locais; efeitos, turnos e vitória calculados no navegador. Vitória ao alcançar a casa 40, sem exigir 100 pontos de projeto.
- Abertura/prologo, narrativas previamente escritas para as 40 casas, troféus dos atos 2/3/4 e Endgame; primeiro participante a chegar a cada marco conquista o respectivo troféu. A música muda de acordo com o ato alcançado e existem seis faixas de áudio: introdução, quatro atos e encerramento.
- Interface **en-US como idioma padrão**, alternância para pt-BR sem reiniciar partida; save/load em Markdown com bloco JSON estruturado e log narrativo.
- Interface de troféus/Endgame ligada ao Worker: seleção e composição de até dois episódios ("beats") nos atos, até cinco no Endgame; comentário final curto da IA após história previamente escrita; fallback para texto autoral quando o modelo falha.
- Botão PLAY de narração falada e download de MP3 nos diálogos; TTS sob demanda pelo Worker, com cache/reutilização em sessão. Trilha sonora original e narração TTS são recursos distintos.

## Modelo e contratos comprovados no código

- **Modelo padrão no código:** `@cf/google/gemma-7b-it-lora` (Gemma 7B via Cloudflare Workers AI).
- **Configuração substituível:** variável `NARRATION_MODEL` do Worker; outras versões citadas no código não significam que estejam ativas. A resposta real de `GET /health` deve ser consultada para confirmar o modelo efetivamente implantado. Uma demonstração do modelo implantado ainda precisa ser registrada para a submissão.
- `POST /narrate` recebe `player`, `act`, `lang`, `beats: [{id}]`; o Worker valida IDs e usa as histórias canônicas por idioma. A Gemma **não** decide dados, movimento, destino, pontos, personagens CPU ou vitória. Sua contribuição gerada é um comentário final de no máximo 40 palavras / 600 caracteres.
- `POST /tts` recebe o texto e o idioma e solicita voz pelo serviço ElevenLabs, se os bindings estiverem disponíveis; `GET /health` não realiza inferência.
- O fluxo do Worker tem fallback de história local; a geração de voz depende do serviço externo. O frontend continua jogável sem inferência.
- Worker: `https://retro-ghost-85-narrator.antonio-pasolini.workers.dev`. Sites descritos na documentação: `https://retro-ghost-85.onrender.com/` e `https://jrpasolini.tech/retro-ghost-85/`. **Verificar os links ao vivo no dia da submissão**; a presença aqui não é prova de disponibilidade.

## Decisões explícitas do autor

1. **Worker público sem autenticação/rate limit global customizado** nesta versão: risco operacional aceito pelo autor para o MVP no Free Tier da Cloudflare. Os limites do Free Tier não equivalem necessariamente a limites da API ElevenLabs; origem/CORS e obscuridade de URL não são autenticação. Reavaliar se houver exposição ou custo inesperado. Não introduzir mudanças operacionais sem decisão do autor.
2. **Repositório privado até o lançamento:** tornar público somente **no mesmo dia em que o artigo for publicado no DEV**, depois da revisão final. Não alterar visibilidade nesta fase.
3. **Código local como autoridade do gameplay; IA apenas narradora**, sem controles de jogo ou multiplayer remoto na v1.
4. **Licenciamento:** MIT proposta aplicada apenas ao software original em `LICENSE`; arquivos de arte, música, imagens, voz, marcas e outros recursos não recebem licença MIT automaticamente. Consultar `ASSETS_E_CREDITOS.md` e validar permissões antes da publicidade.

## Verificações e limitações

- No commit-base `a4f7998`, os workflows GitHub Actions de build/testes e gameplay/resize terminaram em **success**. Isso não substitui uma prova manual da experiência pública, do Worker em produção ou das permissões dos ativos.
- Relatórios antigos (PRs #5/#6, planejamento da Gemma 4, narração futura, efeitos propostos) permanecem consultáveis como contexto histórico, não como especificação atual.
- **Risco de avaliação:** o modelo tem uma contribuição deliberadamente curta e controlada. O artigo deve demonstrar o valor concreto do comentário dinâmico e das escolhas de modelo aberto, sem afirmar que a IA criou o enredo completo ou controla as regras.
- **Regras do desafio:** ver `SUBMISSAO_WEEK4_2026.md`.

## Fontes técnicas prioritárias

- `src/motor/partida.ts`, `src/motor/dado.ts`, `src/data/casas.ts` — regras do jogo.
- `src/main.ts`, `src/narrador/journey-panel.ts` — diálogos e controles.
- `src/services/narrator.ts`, `src/services/journey.ts` — chamadas e áudio.
- `workers/narrator/worker.js`, `workers/narrator/wrangler.toml` e `workers/narrator/README.md` — modelos, bindings, limites e contrato.
- `README.md` e `README.pt-BR.md` — apresentação aos avaliadores.
