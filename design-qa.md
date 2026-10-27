# Design QA — Retro-Ghost-85 MVP visual

Data: 26/10/2026  
Referência: `public/assets/board-reference.webp`  
Viewport verificado: desktop 1365 × 935

## Comparação visual

- A composição 16:9, a mesa retrô, os equipamentos de 1985, o percurso de 40 casas e a paleta neon foram preservados diretamente da arte aprovada.
- A camada funcional respeita os limites das casas da referência e só se torna visível em hover, foco ou seleção.
- O painel lateral foi adicionado fora da arte para exibir nome, tipo e efeito sem encobrir o cenário.
- As quatro peças usam recortes originais dos fantasmas da própria referência e agora são atualizadas pelo motor local de movimento e turnos.

## Interação e acessibilidade

- As 40 casas são botões acessíveis por teclado e possuem rótulos descritivos.
- A casa ativa usa `aria-pressed` e atualiza uma região anunciada por leitores de tela.
- Os quatro jogadores podem ser selecionados tanto no tabuleiro quanto no console inferior.
- A seleção de um jogador não altera o jogador da vez; o painel identifica separadamente o jogador selecionado e o jogador ativo.
- O painel de dados permanece visível durante a leitura da narrativa, com rolagem interna para textos longos.
- Há link de salto, foco visível, texto alternativo e respeito a `prefers-reduced-motion`.

## Pendências não bloqueantes (P3)

- Ajustar coordenadas finas de algumas casas após a aprovação visual do Junior.
- Validar em dispositivos móveis físicos durante a etapa de integração da jogabilidade.
- A narrativa completa e o balanceamento definitivo dos efeitos pertencem às próximas etapas.

## Resultado

Build de produção concluído sem erro. Seleção da casa 24, rotação P1 → P2 e distinção entre jogador selecionado e jogador ativo foram verificadas no navegador.

## Etapa 3 — áudio e gravador de dados

- Referência visual: gravador portátil de cassete da década de 1980 fornecido pelo Junior.
- Foi criado um ativo original, sem marca ou modelo de terceiro, adaptado à barra inferior do tabuleiro.
- O gravador cobre os dois dados puramente decorativos da arte; os dados funcionais continuam no painel direito.
- As teclas físicas receberam controles HTML acessíveis: `REC / SAVE` e `PLAY / LOAD`.
- `REC` foi verificado no navegador e gerou o arquivo Markdown com confirmação visual.
- A primeira jogada alterou a indicação musical de `INTRO` para `ACT 1 · BOOT`, moveu a peça e avançou o turno normalmente.
- O controle de áudio, o volume e a faixa atual permanecem visíveis sem aumentar a altura do painel lateral.
- O parser de `PLAY / LOAD` foi coberto por testes de ida e volta e rejeição de arquivo inválido.
- O popup inicial identifica `ACT 1 · BOOT`, mantém os dados bloqueados até `INICIAR JORNADA` e posiciona os quatro jogadores na casa 1.
- A cobertura visual `ENDGAME · PUBLICAÇÃO` elimina a indicação antiga de ACT 1 na casa 40 sem criar um segundo cartão amarelo ao lado da casa 1.

Build de produção e 24 testes automatizados concluídos sem erro em 27/10/2026.

## Etapa 4 — participantes humanos e CPU local

- O popup inicial agora configura de 1 a 4 participantes antes da apresentação de `ACT 1 · BOOT`.
- Cada posição aceita controle `HUMANO` ou `CPU LOCAL`; partidas exclusivamente com CPU são bloqueadas e CPU exige ao menos dois participantes.
- Jogadores humanos podem receber nomes personalizados. Jogadores automáticos usam os nomes `CPU-1`, `CPU-2` e `CPU-3`.
- A CPU usa exatamente o mesmo motor de 2D6, turnos e efeitos dos humanos: não há dificuldade, personalidade ou vantagem oculta.
- No navegador, foi verificada uma partida com `Junior` e `CPU-1`: o humano jogou, a CPU executou sua vez automaticamente e o controle retornou ao humano.
- O botão de dados permanece indisponível durante a vez da CPU e volta a ser habilitado quando chega um turno humano.
- Saves novos preservam nome e tipo de controle; saves anteriores continuam carregando como jogadores humanos.

Build de produção e 28 testes automatizados concluídos sem erro em 27/10/2026.

**final result: passed**
