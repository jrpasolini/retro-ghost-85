# Estratégia de partida — Retro-Ghost-85

> Documento vivo para registrar decisões de produto e evolução dos modos de jogo.

## 27/10/2026 — Participantes humanos e CPU local

### Decisão

O jogo permite configurar de **1 a 4 participantes** antes do prólogo do ACT 1.

- Uma partida pode ter apenas um humano, no modo solo.
- Com dois ou mais participantes, cada slot pode ser definido como `HUMANO` ou `CPU LOCAL`.
- Toda partida precisa ter pelo menos um humano.
- Participantes humanos recebem nomes personalizados de até 24 caracteres.
- Participantes automáticos recebem nomes sequenciais (`CPU-1`, `CPU-2`, `CPU-3`).

### Regra da CPU

A CPU não possui dificuldade, personalidade ou vantagem. O jogo é orientado pela sorte dos dados e todos obedecem às mesmas regras.

A CPU local somente:

1. aguarda sua vez;
2. executa o mesmo sorteio local de 2d6;
3. recebe movimento, bônus e penalidades pelo mesmo motor;
4. entrega o turno ao próximo participante.

Ela chama diretamente o motor do jogo, sem simular clique e sem fazer requisições externas.

### Papel da Gemma 4

Gemma 4 permanece exclusivamente como camada narrativa opcional. Ela não rola dados, não escolhe jogadas, não controla participantes e não altera o estado da partida. Essa separação mantém as partidas rápidas, reproduzíveis, econômicas e funcionais sem rede.

### Persistência e segurança

O save Markdown registra quantidade de participantes, nomes, tipo de controle e progresso. Saves anteriores continuam compatíveis e recebem `humano` como controle padrão. Nomes são normalizados, limitados e escapados antes da renderização.

