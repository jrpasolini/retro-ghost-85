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

**final result: passed**
