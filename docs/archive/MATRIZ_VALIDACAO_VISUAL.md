> **Historical archive.** This document records earlier planning or QA and may describe superseded behavior. Use the [current documentation](../README.md) and [project README](../../README.md) for the implemented version.

# MATRIZ DE VALIDAÇÃO VISUAL — TABULEIRO IMUTÁVEL

> Inspeção realizada em 27/10/2026 sobre os pixels de public/assets/board-reference-edited.webp (1668×939), com ampliação separada das quatro bordas, e de public/assets/casa-40-endgame.webp. Nenhuma imagem, coordenada, regra, título ou efeito foi alterado.

## Resultado consolidado

- **40/40 posições examinadas** na arte e confrontadas com src/data/casas.ts e src/data/atos.ts.
- **24 OK**, **15 AJUSTAR TEXTO**, **1 INDETERMINADO**.
- A casa 19 não possui número ou símbolo distinguível nos pixels: seu hotspot (84,6% / 76,1% / 10,3% / 9,9%) fica quase todo coberto pelo marco 20 (82,8% / 77% / 11,2% / 10%). A arte mostra apenas 20 / ACT 3 / DEBUG; por isso a casa 19 não foi certificada visualmente.
- A imagem-base da casa 40 mostra 40 / ACT 1 / BOOT, mas a UI realmente aplica sobre ela casa-40-endgame.webp, onde se lê 40 / ENDGAME / PUBLICAÇÃO. A validação da 40 considera essa sobreposição visível.
- Fora dos marcos 10, 20, 30 e da sobreposição 40, as casas exibem número e ícone, não um título textual rasterizado. Portanto, os títulos do código não foram tratados como texto “lido” na arte.

## Matriz casa a casa

| Nº | Posição e elemento visto nos pixels | Correspondente no código | Diagnóstico | Motivo e correção textual sugerida | Confiança |
|---:|---|---|---|---|---|
| 01 | Borda superior, após o 40: micro/teclado com tela | **A revista na banca** · marco · sem efeito | OK | O ícone enfatiza o micro onde a inspiração será executada; a narrativa já liga a revista à volta para casa. Não precisa mudar. | alta |
| 02 | Borda superior: dois disquetes, azul e claro | **Disquete de trabalho** · evento · +18, avance 1 | OK | O objeto é exatamente mídia de disquete; o empréstimo do drive de um colega resolve a chegada posterior do drive próprio na 11. | alta |
| 03 | Borda superior: joystick vermelho sobre base escura | **Erro na listagem** · fatalidade · −12, volte 1 | AJUSTAR TEXTO | O desenho não mostra papel/listagem. Ponte proposta: o erro de transcrição só aparece quando o joystick é testado — após RUN, um comando do controle falha por causa do caractere trocado. Preservar a perda e o recuo. | alta |
| 04 | Borda superior: grande triângulo verde de “play” | **RUN e a tela azul** · marco · +22, outra jogada | OK | Símbolo direto de executar/iniciar; combina com RUN e a primeira animação. | alta |
| 05 | Borda superior: pilha rosa/verde de mídias ou caixas | **Salvar no cassete** · evento · +16 | OK | A pilha é compatível com mídias/arquivos, embora não identifique um único cassete. A narrativa de etiquetar e guardar a fita continua plausível. | média |
| 06 | Borda superior: fita cassete vermelha e branca | **O cassete que não carrega** · fatalidade · −14, volte 2 | OK | Correspondência direta com fita, PLAY e CLOAD; o recuo está explicitamente narrado como perda das alterações recentes. | alta |
| 07 | Borda superior: chave inglesa cinza | **Fitas virgens** · evento · +14 | AJUSTAR TEXTO | O símbolo é manutenção/reparo, não fita. Ponte proposta: antes de fazer a cópia na fita virgem, limpar/ajustar cabeçote, cabos e gravador; a manutenção bem-sucedida justifica o ganho. | alta |
| 08 | Borda superior: caixa clara com ? | **Joystick emprestado** · evento · +18, avance 1 | AJUSTAR TEXTO | A arte comunica surpresa, não joystick. Ponte proposta: um colega chega com uma caixa-surpresa; dentro está o joystick emprestado usado no teste. | alta |
| 09 | Borda superior: xícara branca fumegante | **O cartucho do amigo** · evento · +18 | AJUSTAR TEXTO | O ícone evoca café/madrugada. Ponte proposta: durante uma longa noite com café na casa do amigo, vocês estudam o ritmo do jogo em cartucho; manter explícito que não há cópia de código. | alta |
| 10 | Canto superior direito: castelo/cidade, lua, 10 / ACT 2 / BBS | **Ato 2 · BBS** · marco · +20, outra jogada | OK | Rótulo rasterizado coincide com o título. A narrativa trata a BBS como promessa futura, compatível com a conexão efetiva nas casas 21–23. | alta |
| 11 | Lateral direita: aparelho cinza com duas bobinas/visores e luzes, semelhante a gravador de dados | **O drive de disquete** · marco · +20 | AJUSTAR TEXTO | O desenho não se parece claramente com drive. Evitar descrever bandeja, cabeça ou mecanismo de disquete; usar “um novo periférico de armazenamento chega à bancada” e documentar a leitura “drive” como licença poética do título. | alta |
| 12 | Lateral direita: fone de telefone cinza com cabo | **Formatar o disco** · evento · +14 | AJUSTAR TEXTO | O símbolo é telefônico, não disco. Ponte proposta: um colega orienta por telefone como preparar/formatar a mídia; depois o personagem testa gravação e leitura antes de confiar nela. | alta |
| 13 | Lateral direita: folha com C:\> e linhas | **Prompt do DOS** · marco · +18 | AJUSTAR TEXTO | A arte imprime C:\>, mas a narrativa afirma prompt A> do MSX-DOS 1. Manter MSX-DOS 1, drive e ≥64 KiB, DIR e ausência de subdiretórios, porém trocar “apresenta o discreto prompt A>” por “abre o prompt da unidade”; registrar C:\> como atalho gráfico de DOS, não como tela literal do MSX. | alta |
| 14 | Lateral direita: pilha de quatro livros/manuais | **O assembler** · evento · +22 | OK | A narrativa já usa o manual aberto para montar a pequena rotina de máquina; o ícone de livros funciona como fonte técnica. | alta |
| 15 | Lateral direita: inseto vermelho sorridente | **Sprite fora do lugar** · fatalidade · −16, volte 2 | OK | Metáfora visual inequívoca de “bug”; o texto mantém causa técnica em coordenadas e não cria sobrenatural real. | alta |
| 16 | Lateral direita: caixa de ferramentas laranja | **Mapa de memória e VRAM** · evento · +20, avance 1 | AJUSTAR TEXTO | O ícone sugere ferramentas. Ponte proposta: “Você abre sua caixa de ferramentas — manual, mapa de memória e tabela de endereços — e corrige a transferência para a VRAM”. Preservar a distinção VRAM/RAM. | alta |
| 17 | Lateral direita: circuito integrado/chip | **Colisão que não colide** · fatalidade · −14, perca 1 jogada | AJUSTAR TEXTO | A arte é hardware; a falha descrita é lógica. Acrescentar que o chip executa exatamente a rotina errada escrita no programa: o defeito está nos limites/posições, não no componente. | alta |
| 18 | Lateral direita: ampulheta colorida | **Música em PSG** · evento · +16 | AJUSTAR TEXTO | A ampulheta comunica tempo. Ponte proposta: ajustar duração, pausas e temporização das notas do PSG até formar a vinheta; manter os poucos canais e o ganho. | alta |
| 19 | Canto inferior direito, região imediatamente acima/sobre o 20: nenhum 19 ou ícone separável; só se vê o bloco 20 | **O bug de scroll** · fatalidade · −16, volte 2 | INDETERMINADO | Não há evidência gráfica certificável para a 19. Manter a narrativa de rolagem simulada por software apenas como texto historicamente plausível; aprovação editorial depende de aceitar que a arte não expõe esta casa. | alta |
| 20 | Canto inferior direito: figura/monitor, lua, 20 / ACT 3 / DEBUG | **Ato 3 · DEBUG** · marco · +20 | OK | Rótulo rasterizado coincide. A narrativa de depuração coletiva é compatível com o símbolo e com bugs anteriores. | alta |
| 21 | Borda inferior: troféu dourado | **Modem emprestado** · evento · +18 | AJUSTAR TEXTO | O ícone é prêmio, não modem. Ponte proposta: o bom desempenho no clube rende confiança/“troféu” simbólico e o empréstimo do modem para a próxima etapa. Não sugerir prêmio formal se o autor não aprovar. | alta |
| 22 | Borda inferior: lâmpada acesa | **Discar para a BBS** · evento · +20, outra jogada | OK | A luz representa a ideia obtida após a conexão; a narrativa já termina com uma dica de memória descoberta e testada. | alta |
| 23 | Borda inferior: duas engrenagens roxas | **Linha ocupada** · fatalidade · −12, perca 1 jogada | AJUSTAR TEXTO | Engrenagens sugerem mecanismo travado. Ponte proposta: modem e rotina estão preparados, mas “as engrenagens” do plano param no sinal de ocupado; preservar perda de oportunidade/turno, sem deslocamento. | alta |
| 24 | Borda inferior: terminal com >A_ | **O grupo de usuários** · marco · +18 | AJUSTAR TEXTO | O desenho mostra terminal, não pessoas. Acrescentar que o grupo se reúne diante do terminal e anota os caminhos inesperados vistos na tela durante o teste coletivo. | alta |
| 25 | Borda inferior: folha com linhas e pequeno selo | **Listagem truncada** · fatalidade · −14, volte 1 | OK | Documento/listagem corresponde diretamente ao trecho fotocopiado incompleto. | alta |
| 26 | Borda inferior: lupa azul | **Cópia autorizada** · evento · +16, avance 2 | OK | A lupa funciona como inspeção/auditoria do conteúdo antes da distribuição; o texto já separa arquivos próprios e de terceiros. | alta |
| 27 | Borda inferior: disquete azul com X vermelho | **Disquete com erro** · fatalidade · −18, volte 2 | OK | Correspondência direta e efeito coerente com recuperar backup e refazer mudanças. | alta |
| 28 | Borda inferior: estrela amarela | **Revista especializada** · evento · +16 | AJUSTAR TEXTO | A estrela não identifica revista. Ponte proposta: a técnica aparece como matéria “em destaque”/recomendação da edição; evitar afirmar que o ícone contém páginas ou texto. | alta |
| 29 | Borda inferior: alien/invasor pixelado rosa | **Concurso de programas** · evento · +20, outra jogada | OK | O símbolo representa o jogo/demonstração inscrito no concurso, não o veículo de inscrição; narrativa e efeito são compatíveis. | alta |
| 30 | Canto inferior esquerdo: castelo, lua, 30 / ACT 4 / FINAL | **Ato 4 · FINAL** · marco · +20 | OK | Rótulo rasterizado coincide; a narrativa preserva finalização editorial sem declarar lançamento antes da 40. | alta |
| 31 | Lateral esquerda: joystick vermelho | **Teste do controle** · evento · +16 | OK | Correspondência direta com o teste de usabilidade do joystick. | alta |
| 32 | Lateral esquerda: impressora cinza com papel | **Impressora emperrada** · fatalidade · −14, perca 1 jogada | OK | Correspondência direta; o turno perdido é justificado pela noite de realinhamento e reimpressão. | alta |
| 33 | Lateral esquerda: pilha de três unidades/mídias cinza | **Disquetes mestres** · evento · +18 | OK | O objeto é compatível com conjunto de mídia/unidades e com a preparação de mestre e cópia de segurança; não há rótulo legível que contradiga. | média |
| 34 | Lateral esquerda: livreto/capa rosa inclinada | **A capa** · evento · +18, avance 1 | OK | Correspondência direta com material gráfico impresso/embalagem. | alta |
| 35 | Lateral esquerda: chave amarela | **Duplicação em série** · evento · +18 | AJUSTAR TEXTO | A chave não representa cópias. Ponte proposta: o disquete mestre funciona como “chave” do lote; a partir dele cada cópia é gravada e conferida. Evitar inventário ou item coletável. | alta |
| 36 | Lateral esquerda: caixa clara com ? | **Caixas trocadas** · fatalidade · −14, volte 1 | OK | Caixa/surpresa combina com embalagens trocadas e identificação incerta. | alta |
| 37 | Lateral esquerda: página/artigo com linhas | **Crítica na revista** · evento · +18 | OK | Documento publicado corresponde à crítica da demonstração; a narrativa já evita lançamento comercial prematuro. | alta |
| 38 | Lateral esquerda: caveira verde com ossos | **A errata grave** · fatalidade · −18, perca 1 jogada | OK | Símbolo de perigo/fatalidade compatível com erro de manual capaz de bloquear o jogador; texto mantém o suspense tecnológico. | alta |
| 39 | Lateral esquerda: troféu dourado | **Prêmio dos leitores** · marco · +22 | OK | Correspondência direta; a narrativa deixa claro que o prêmio é da demonstração/concurso, antes da publicação comercial. | alta |
| 40 | Canto superior esquerdo; overlay: 40, miniaturas e ENDGAME / PUBLICAÇÃO | **Seu nome no catálogo** · final · +10, vitória | OK | A arte confirma publicação/endgame, embora não imprima “catálogo” nem o nome. A narrativa do catálogo é compatível e mantém a regra de vitória apenas no efeito. | alta |

## Verificação histórica aplicada

- MSX-DOS 1 ficou comercialmente disponível em 1985, exigia drive e pelo menos 64 KiB de RAM e não oferecia subdiretórios. DIR é coerente para listar arquivos. A redação da casa 13 está historicamente bem orientada, mas o C:\> desenhado não deve ser apresentado como se fosse o A> visto nos pixels.
- O MSX Technical Data Book documenta VRAM separada e operações como VPOKE, além do PSG acessível por SOUND/PLAY; isso sustenta os núcleos históricos das casas 16 e 18.
- A casa 19 descreve corretamente rolagem simulada por software/redesenho em VRAM, mas a arte não permite verificar um símbolo próprio dessa casa.

## Passagem textual e efeitos

- A frase “Você é um desenvolvedor em 1985” aparece uma vez, como título do prólogo. Os parágrafos seguintes não repetem literalmente a premissa, e a casa 1 em jogo é substituída visualmente/textualmente por Prólogo · Início.
- Textos modernos de interface (GAME LOG, SAVE/LOAD, CPU, Markdown, MP3, Gemma) permanecem separados da voz diegética de 1985.
- As fatalidades 3, 6, 15, 17, 19, 23, 25, 27, 32, 36 e 38 explicam perdas, recuos ou turno perdido sem ativar segunda casa, energia ou inventário. As narrativas apenas dramatizam o efeito literal.

## Legibilidade e hierarquia visual da UI

- Inspeção real em 1920×1080: prólogo e casas longas 3, 6, 10, 13, 15, 19, 20, 23, 27, 30, 32, 36, 38 e 40 ficaram legíveis; o inspetor usa overflow automático e nenhuma dessas narrativas excedeu sua área disponível.
- Inspeção real em 900×700: o layout empilhou o inspetor abaixo do tabuleiro, sem estouro horizontal (scrollWidth 885 para viewport 900) e sem corte; as narrativas ficaram visíveis e a página cresceu verticalmente.
- **Repetição de marca observada na captura e na UI:** o cabeçalho externo exibe RETRO-GHOST-85 em grande escala e a própria imagem de fundo do tabuleiro repete RETRO-GHOST-85 imediatamente abaixo. A proximidade produz dois títulos concorrentes e reduz a hierarquia visual.
- **Sugestão ao autor, sem alteração neste job:** escolher uma única assinatura dominante. Preferência editorial: manter o logotipo integrado à arte do tabuleiro e transformar o cabeçalho externo em uma barra funcional discreta (por exemplo, apenas RETRO COMPUTER SYSTEM • 1985, áudio e controles), ou ocultar o título externo somente na tela do jogo. Alternativa: manter o cabeçalho externo e preparar, numa etapa gráfica futura, uma versão aprovada da arte sem o logotipo interno. Não recortar ou sobrescrever a imagem atual sem aprovação.
- Limitação: a abertura cinematográfica foi verificada em 1920×1080; no viewport menor, a passagem automática da sequência para o diálogo não foi novamente capturada. O diálogo tem max-height e overflow automático no CSS, mas isso não substitui evidência visual do prólogo pequeno.

## Testes e build executados

- npm.cmd run build: **PASSOU** (tsc && vite build, 24 módulos transformados).
- npm.cmd test: **FALHOU 1/50**; 49 passaram. O teste “a arte da casa 40 e o gravador entram no bundle por caminho relativo” também exige as expressões literais Ato 2, Ato 3 e Ato 4 dentro de src/data/intro.ts. A nova redação usa “casas 10, 20 e 30”, então a asserção /Ato 2/ falha. Não corrigido neste job porque código está fora do escopo.

## Conclusão

**PR COM AJUSTES PENDENTES.** A arte foi efetivamente vista, mas há 15 pontes textuais recomendadas, uma casa visualmente indeterminada (19), repetição concorrente do título na UI e um teste quebrado. Esta conclusão não autoriza merge.


## Decisão posterior — auditoria gráfica encerrada, narrativas preservadas

A tabela 40/40 acima é um **retrato da inspeção inicial**, não uma lista de mudanças gráficas a executar.

- As **15 casas identificadas para ajuste textual** receberam pontes narrativas na branch: 3, 7, 8, 9, 11, 12, 13, 16, 17, 18, 21, 23, 24, 28 e 35. Os ícones originais continuam inalterados.
- O desenho v2 das nove casas **foi descartado**, e seu overlay foi removido do código e da branch. Nada no tabuleiro original foi substituído.
- A casa 13 mantém o símbolo `C:\\>`, interpretado como MS-DOS em um PC de 1985. Não exige mudança de desenho.
- A casa 19 continua indeterminada visualmente; registrar a limitação, **não** mexer em hotspots nem na arte.
- Referências explícitas a Ato 2, Ato 3 e Ato 4 foram restauradas no prólogo, sem a repetição literal da ambientação.
- **Novos critérios de aceite:** revisão histórica e editorial, coesão entre episódios, gramática e estilo, fidelidade de efeitos, `npm test` e `npm run build`. Sem testes de máscaras e pictogramas.
- Repetição do logotipo é uma observação antiga de UX e não será abordada nesta etapa.

**A partir desta decisão, novas propostas gráficas não integram o PR #5.** Veja [DIRECAO_EDITORIAL_1985.md](DIRECAO_EDITORIAL_1985.md).
