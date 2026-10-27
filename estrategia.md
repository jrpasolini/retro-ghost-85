# Estratégia de partida — Retro-Ghost-85

> Documento vivo para registrar decisões de produto e evolução dos modos de jogo.

## 27/10/2026 — Participantes humanos e CPU local

### Decisão

O jogo permite configurar de **1 a 4 participantes** na mesma tela em que a introdução da jornada já está escrita.

- Uma partida pode ter apenas um humano, no modo solo.
- Com dois ou mais participantes, cada slot pode ser definido como `HUMANO` ou `CPU LOCAL`.
- Toda partida precisa ter pelo menos um humano.
- Participantes humanos recebem nomes personalizados de até 24 caracteres.
- Participantes automáticos recebem nomes sequenciais (`CPU-1`, `CPU-2`, `CPU-3`).

### Regra da CPU

A CPU não possui dificuldade, personalidade ou vantagem. O jogo é orientado pela sorte do dado e todos obedecem às mesmas regras.

A CPU local somente:

1. aguarda sua vez;
2. executa o mesmo sorteio local de 1d6;
3. recebe movimento, bônus e penalidades pelo mesmo motor;
4. entrega o turno ao próximo participante.

Ela chama diretamente o motor do jogo, sem simular clique e sem fazer requisições externas.

### Papel da Gemma 4

Gemma 4 permanece exclusivamente como camada narrativa opcional. Ela não rola dados, não escolhe jogadas, não controla participantes e não altera o estado da partida. Essa separação mantém as partidas rápidas, reproduzíveis, econômicas e funcionais sem rede.

### Persistência e segurança

O save Markdown registra quantidade de participantes, nomes, tipo de controle e progresso. Saves anteriores continuam compatíveis e recebem `humano` como controle padrão. Nomes são normalizados, limitados e escapados antes da renderização.


## 27/10/2026 — Etapa 2: o Mestre narrador com voz (Gemma 4 + ElevenLabs)

### Decisão

A narração falada entra na **segunda etapa**, depois do MVP fechado. Ela não altera o motor: continua valendo
**"o dado decide, a IA narra"**. O Mestre não decide nada, não move peças, não aplica efeito — ele conta o que já aconteceu.

O Mestre fala em momentos rituais, não a cada casa. A narração é **premiação por conquista**: quem chega primeiro
naquele ato ganha; quem chega depois não escuta nada.

1. **Entrada em ato novo** (casa 10 = Ato 2, casa 20 = Ato 3, casa 30 = Ato 4): o **primeiro participante** a entrar na região daquele ato — pousando na primeira casa ou passando além dela — recebe a
narração do **seu próprio caminho, desde o início da partida até ali**. Os concorrentes que chegarem depois naquele
mesmo ato **não escutam narração nenhuma** — ela já foi conquistada. A casa 1 é o prólogo: a história fica na tela de configuração, sem troféu e sem narração. Iniciar a partida coloca todos na casa 1 com o dado liberado.
2. **Endgame (casa 40)**: o primeiro a chegar — pousando ou passando, com a peça limitada à casa 40 — vence e recebe a narrativa histórica de fechamento, montada pelo Worker com
**todo o histórico dele**, casa a casa. O projeto (0 a 100) é placar e desempate, não portão: uma volta à casa 30 abaixo de 100 foi considerada e rejeitada porque esticava o final.

Consequências diretas:

- atos diferentes podem ser conquistados por **participantes diferentes** — um ganha o ato 2, outro o ato 4;
- a narração cobre **sempre o caminho completo** do vencedor daquele ato, não só o trecho desde o ato anterior;
- o total é **fixo: 4 narrações por partida** (atos das casas 10, 20 e 30, mais o endgame), independentemente de haver um ou quatro
  jogadores. É por isso que há folga para usar o modelo com prompt rico e tom de narração trabalhado, sem medo de
  estourar crédito.

### Insumos da narração

- **game log** da partida, fonte de verdade dos eventos;
- **histórico das casas percorridas** pelo participante que conquistou aquele ato, do início da partida até ali;
- ato alcançado e efeitos determinísticos já aplicados;
- no endgame, o histórico **completo** daquele participante, do início ao fim do tabuleiro.

O texto é produzido pelo **Gemma 4 através do Cloudflare Worker** (mesmo padrão de proxy já existente). O modelo recebe
o resultado **já decidido** e devolve apenas a narração da cena.

### Áudio falado (ElevenLabs TTS)

Cada narração exibe o botão **"Ouvir o Mestre"**:

- a chamada de TTS passa pelo **Cloudflare Worker**; a chave da ElevenLabs nunca é exposta ao cliente;
- **cache por hash do texto** (KV/R2): a mesma fala é paga **uma única vez** — vale ao reabrir um save e ao repetir
  a mesma narração, mesmo que o texto se repita entre participantes;
- modelo barato por padrão (flash/turbo) para manter a latência baixa, porque narração que demora mais de um segundo perde o jogador;
- **voz única e canônica** para o Mestre, no clima de Halloween do projeto (referências: Conde Drácula, Frankenstein). O voice ID é decisão do **momento 3** e **não bloqueia nada agora** — trocar a voz depois é trocar apenas o ID, sem mexer na arquitetura;
- **fallback obrigatório**: sem API disponível, o botão fica desabilitado e o texto permanece. O jogo nunca quebra por causa do áudio.

### Troféus de áudio — o MP3 como lembrança

O arquivo gerado pela ElevenLabs é entregue ao jogador como **troféu**: ele pode guardar e reouvir o que enfrentou.

- **Troféu de endgame:** quem chega **primeiro na casa 40** recebe a narrativa completa do jogo — mesmo que não tenha
  conquistado nenhum ato anterior. É a virada: quem vence no fim leva a história inteira, com os contratempos e os
  bônus de cada casa por onde passou.
- **Troféu de ato:** cada ato conquistado pode gerar o seu próprio arquivo, além do troféu final.
- **O arquivo é do jogador:** download com nome legível (`retro-ghost-85_<participante>_ato-<n>_<data>.mp3`) e
  metadados ID3 com participante, ato e data — para o troféu sobreviver fora do site.
- **O hash da narração fica gravado no save `.md`:** reabrir o save não paga de novo para reouvir nem para rebaixar
  o troféu; o áudio vem do cache.
- **Download passa pelo Worker:** cada troféu carrega apenas o conteúdo daquela partida, sem expor dados de outros
  participantes.

### O que não se faz

- **Não** criar script que regenere as trilhas a cada execução: consome crédito e não produz nada novo. As seis faixas
  existentes serão documentadas por um `audio-manifest.json` **estático** (modelo, prompt de cada ato, data, duração),
  sem nenhuma chamada de API.
- **Não** narrar a cada casa: o custo e o ritmo destruiriam a partida.

### Por que a categoria fica reivindicável

A categoria do challenge é *Best Use of ElevenLabs API*. Uso **em runtime**, com cache, controle de custo e fallback
explícito é uso de API — não uso de ferramenta. O fluxo precisa estar descrito no README como parte da submissão.

### Sequência de implantação — três momentos

1. **Momento 1 — funcional.** MVP completo: motor, tabuleiro, save, partida de 1 a 4 participantes. Sem IA, sem voz.
2. **Momento 2 — narração.** Gemma 4 via Cloudflare Worker narrando os históricos dos atos e o endgame. Texto
   funcionando, revisado e com fallback.
3. **Momento 3 — voz.** A ElevenLabs entra **depois** do Gemma 4 estar estável. É aqui que se escolhe o voice ID,
   o personagem, o sotaque e o quanto se quer gastar. Nenhuma customização de voz entra antes do momento 2 fechado:
   voz bonita sobre texto quebrado não salva o projeto.

### Pendências desta etapa

- Definir limites: caracteres por narração e rate limit por sessão.
- Orçar créditos por campanha (com cache ligado) antes de habilitar em produção.
- **Momento 3:** escolher e registrar o voice ID do Mestre.
