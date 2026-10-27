# Narrativa e regras das casas

As 40 histórias de `src/data/casas.ts` são **episódios fictícios** de um desenvolvedor em 1985. Os procedimentos e problemas técnicos foram ancorados em fontes da época; não representam a biografia de uma pessoa real.

## Referências históricas

- [Manual MSX BASIC, edição de janeiro de 1985](https://manualzz.com/doc/19735293/microsoft-msx-basic-i-o-listing-manual): comandos, estruturas de memória e limitações de entrada e saída.
- [MSX Technical Data Book](https://map.grauw.nl/resources/system/msxtech.pdf): sprites, PSG, disquetes e erros de leitura/gravação. A descrição de erros do DOS inclui tentativas repetidas de leitura e mensagens de I/O.
- [Practical Computing, dezembro de 1984, artigo sobre comunicações](https://www.worldradiohistory.com/UK/Practical-Computing/80s/Practical-Computing-1984-12-S-OCR.pdf): BBS, modem/acoplador acústico, telefone ocupado e troca de programas entre grupos de usuários na passagem para 1985.
- [Micro Sistemas: índice de programas publicados em 1985](https://zx81.eu5.org/msprog.htm): evidência de listagens e contribuições de leitores no Brasil naquele ano.

O antigo evento de “disquete com vírus” foi substituído por uma listagem truncada. A casa 27 agora é o disquete com erro de leitura, em acordo com o desenho do tabuleiro. A casa 2 é um disquete funcional.

## Regras desta versão

- Cada turno usa **2d6**: os dois dados rolam separadamente e a soma move a peça. A casa onde ela para aplica projeto, recuo/avanço e perda ou ganho de turno **uma vez**. O movimento provocado pela carta não ativa outra carta.
- O projeto fica entre 0 e 100. Ganhos e perdas representam progresso de desenvolvimento, não pontos de uma simulação histórica literal.
- Todos os jogadores começam na casa 1, apresentada pelo popup **ACT 1 · BOOT**, com esse ato já visitado. O movimento usa normalmente a soma de 2d6. As casas 10, 20 e 30 são os ACTs 2, 3 e 4; a casa 40 é exclusivamente o desfecho **ENDGAME · PUBLICAÇÃO**.
- O mesmo jogador precisa visitar as quatro casas ACT para revelar o retrato sorridente de Einstein no monitor. Visitas de jogadores diferentes não se somam; o deslocamento que termina sobre um ACT também conta, sem ativar novamente seu efeito.
- Cada ACT tem um prólogo próprio em `src/data/atos.ts`. O ACT 1 aparece no início da partida; os ACTs 2, 3 e 4 são mostrados ao inspecionar ou alcançar as casas 10, 20 e 30. No retorno à casa 40, o painel mostra o desfecho do catálogo.
- Ao alcançar a casa 40, a revisão final concede 10 projeto. Com 100, o jogador vence; caso contrário, retorna à casa 30 para repetir a etapa de publicação.
- Os quatro jogadores jogam no mesmo dispositivo; quem ganha uma jogada permanece na vez, e quem perde um turno é pulado na rotação seguinte.

Um teste de simulação com 10 mil sequências determinísticas verifica que pelo menos 50% concluem em até 15 lançamentos e 95% em até 30. Esse teste mede a progressão matemática das casas; ainda é preciso observar partidas humanas para refinar a duração e a sensação de justiça.

