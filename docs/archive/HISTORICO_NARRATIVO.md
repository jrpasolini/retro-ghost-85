> **Historical archive.** This document records earlier planning or QA and may describe superseded behavior. Use the [current documentation](../README.md) and [project README](../../README.md) for the implemented version.

# Narrativa e regras das casas

As 40 histórias de `src/data/casas.ts` são **episódios fictícios** de um desenvolvedor em 1985. Os procedimentos e problemas técnicos foram ancorados em fontes da época; não representam a biografia de uma pessoa real.

## Referências históricas

- [Manual MSX BASIC, edição de janeiro de 1985](https://manualzz.com/doc/19735293/microsoft-msx-basic-i-o-listing-manual): comandos, estruturas de memória e limitações de entrada e saída.
- [MSX Technical Data Book](https://map.grauw.nl/resources/system/msxtech.pdf): sprites, PSG, disquetes e erros de leitura/gravação. A descrição de erros do DOS inclui tentativas repetidas de leitura e mensagens de I/O.
- [Practical Computing, dezembro de 1984, artigo sobre comunicações](https://www.worldradiohistory.com/UK/Practical-Computing/80s/Practical-Computing-1984-12-S-OCR.pdf): BBS, modem/acoplador acústico, telefone ocupado e troca de programas entre grupos de usuários na passagem para 1985.
- [Micro Sistemas: índice de programas publicados em 1985](https://zx81.eu5.org/msprog.htm): evidência de listagens e contribuições de leitores no Brasil naquele ano.

O antigo evento de “disquete com vírus” foi substituído por uma listagem truncada. A casa 27 agora é o disquete com erro de leitura, em acordo com o desenho do tabuleiro. A casa 2 é um disquete funcional.

## Regras desta versão

- Cada turno usa **1d6**: o resultado do dado move a peça. A casa onde ela para aplica projeto, recuo/avanço e perda ou ganho de turno **uma vez**. O movimento provocado pela carta não ativa outra carta.
- O projeto fica entre 0 e 100. Ganhos e perdas representam progresso de desenvolvimento, não pontos de uma simulação histórica literal.
- Todos os jogadores começam na casa 1, o **prólogo**, com essa visita já registrada para a trilha e para o easter egg. O movimento usa normalmente o resultado de 1d6. A casa 10 é o Ato 2, a 20 o Ato 3 e a 30 o Ato 4; a casa 40 é exclusivamente o desfecho **ENDGAME · PUBLICAÇÃO**. A casa 1 não concede troféu.
- O mesmo jogador precisa visitar as quatro casas ACT para revelar o retrato sorridente de Einstein no monitor. Visitas de jogadores diferentes não se somam; o deslocamento que termina sobre um ACT também conta, sem ativar novamente seu efeito.
- Cada marco tem um texto em `src/data/atos.ts`. O prólogo da casa 1 abre a partida; os Atos 2, 3 e 4 aparecem ao inspecionar ou alcançar as casas 10, 20 e 30. Na casa 40, o painel mostra o desfecho do catálogo.
- Ao alcançar a casa 40, a revisão final concede 10 projeto e a partida termina. Quem chega primeiro publica o jogo, com qualquer placar. O projeto (0 a 100) ordena o ranking e serve de desempate; não trava a casa 40 e não devolve o jogador à casa 30.
- Os quatro jogadores jogam no mesmo dispositivo; quem ganha uma jogada permanece na vez, e quem perde um turno é pulado na rotação seguinte.

Um teste de simulação com 10 mil sequências determinísticas verifica que pelo menos 50% concluem em até 15 lançamentos e 95% em até 30. Esse teste mede a progressão matemática das casas; ainda é preciso observar partidas humanas para refinar a duração e a sensação de justiça.

