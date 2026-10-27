import type { Casa } from "../types";
import { atos } from "./atos.ts";

type DetalheCasa = [string, Casa["tipo"], string, string, Casa["consequencia"]];

// Episódios ficcionais baseados em práticas e limitações documentadas da microinformática de 1985.
// O efeito é aplicado uma vez na casa em que o dado parou; deslocamentos não ativam outra casa.
const detalhes: DetalheCasa[] = [
  ["A revista na banca", "marco", "Primeira inspiração · sem efeito", "Na banca, uma revista traz um jogo inteiro em linhas de BASIC. Você leva o exemplar para casa e começa a estudar como outros autores organizaram seus programas.", {}],
  ["Disquete de trabalho", "evento", "+18 projeto · avance 1 casa", "Um amigo lhe empresta um disquete formatado e identificado à mão. Você grava uma cópia do código e descobre como é bom voltar ao trabalho sem redigitar tudo.", { projeto: 18, movimento: 1 }],
  ["Erro na listagem", "fatalidade", "−12 projeto · volte 1 casa", "Depois de horas copiando uma listagem impressa, um único caractere trocado faz o BASIC parar com erro. Você compara linha por linha com a revista até encontrar o engano.", { projeto: -12, movimento: -1 }],
  ["RUN e a tela azul", "marco", "+22 projeto · jogue outra vez", "Você digita RUN e vê a primeira tela do seu jogo surgir no monitor. O desenho ainda é tosco, mas o programa responde às teclas: já dá para testar a próxima ideia.", { projeto: 22, jogadaExtra: true }],
  ["Salvar no cassete", "evento", "+16 projeto", "Antes de desligar, você grava o programa em fita e anota o contador do gravador. A cópia poupa outra noite inteira de digitação.", { projeto: 16 }],
  ["O cassete que não carrega", "fatalidade", "−14 projeto · volte 2 casas", "A fita gira, o cabeçote chia, mas CLOAD não encontra o programa. Você ajusta o volume, rebobina e recupera uma versão anterior do código.", { projeto: -14, movimento: -2 }],
  ["Fitas virgens", "evento", "+14 projeto", "Você separa uma fita nova para cópia de segurança e escreve a versão na etiqueta. Quando a gravação principal falha, o trabalho continua.", { projeto: 14 }],
  ["Joystick emprestado", "evento", "+18 projeto · avance 1 casa", "No encontro de amigos, alguém empresta um joystick. Testar o controle de verdade revela movimentos que pareciam bons no teclado, e você ajusta o jogo.", { projeto: 18, movimento: 1 }],
  ["O cartucho do amigo", "evento", "+18 projeto", "Você estuda um jogo em cartucho na casa de um colega: a resposta dos comandos e o ritmo das fases dão ideias para melhorar seu protótipo, sem copiar o programa.", { projeto: 18 }],
  [atos[10].titulo, "marco", "+20 projeto · jogue outra vez", atos[10].narrativa, { projeto: 20, jogadaExtra: true }],
  ["O drive de disquete", "marco", "+20 projeto", "Um drive chega à bancada. Arquivos separados e gravações mais rápidas permitem guardar versões do jogo sem depender apenas do cassete.", { projeto: 20 }],
  ["Formatar o disco", "evento", "+14 projeto", "Você formata um disco novo e testa a leitura antes de confiar nele. Com a mídia preparada, monta uma cópia para continuar os experimentos.", { projeto: 14 }],
  ["Prompt do DOS", "marco", "+18 projeto", "Diante do prompt, você lista os arquivos e organiza código, dados e cópias de segurança. Saber exatamente qual versão está no disco evita uma confusão futura.", { projeto: 18 }],
  ["O assembler", "evento", "+22 projeto", "Uma rotina em linguagem de máquina substitui o trecho lento do BASIC. Depois de conferir endereços e testar com cuidado, a animação ganha fôlego.", { projeto: 22 }],
  ["Sprite fora do lugar", "fatalidade", "−16 projeto · volte 2 casas", "O personagem surge longe de onde deveria. Um valor de coordenada gravado errado faz você voltar ao mapa de sprites e revisar a rotina de desenho.", { projeto: -16, movimento: -2 }],
  ["Mapa de memória e VRAM", "evento", "+20 projeto · avance 1 casa", "Com o manual aberto ao lado do teclado, você separa a memória do programa da memória de vídeo. A imagem deixa de corromper os dados do jogo.", { projeto: 20, movimento: 1 }],
  ["Colisão que não colide", "fatalidade", "−14 projeto · perca 1 jogada", "O herói atravessa o inimigo como se nada existisse. Você interrompe os testes públicos para revisar posições, limites e a ordem das verificações.", { projeto: -14, perdeTurno: true }],
  ["Música em PSG", "evento", "+16 projeto", "Você experimenta comandos de som no gerador programável e compõe uma vinheta curta. O protótipo finalmente tem uma identidade que se ouve.", { projeto: 16 }],
  ["O bug de scroll", "fatalidade", "−16 projeto · volte 2 casas", "Ao mover o cenário, uma linha antiga fica presa na tela. A cópia de memória está fora de ordem; você volta ao teste anterior para corrigir o deslocamento.", { projeto: -16, movimento: -2 }],
  [atos[20].titulo, "marco", "+20 projeto", atos[20].narrativa, { projeto: 20 }],
  ["Modem emprestado", "evento", "+18 projeto", "No clube de usuários, você consegue experimentar um modem ligado à linha telefônica. A troca de mensagens abre uma nova rota para tirar dúvidas sobre o jogo.", { projeto: 18 }],
  ["Discar para a BBS", "evento", "+20 projeto · jogue outra vez", "Você espera a conexão, lê mensagens de outros programadores e recebe uma dica para reduzir o tamanho de uma rotina. Volta ao código com uma solução.", { projeto: 20, jogadaExtra: true }],
  ["Linha ocupada", "fatalidade", "−12 projeto · perca 1 jogada", "O telefone só devolve sinal de ocupado. Sem acesso à BBS naquela noite, a resposta que você precisava fica para a próxima sessão.", { projeto: -12, perdeTurno: true }],
  ["O grupo de usuários", "marco", "+18 projeto", "Você leva o jogo ao encontro do grupo. As pessoas testam fases, anotam falhas e sugerem uma instrução mais clara para quem está começando.", { projeto: 18 }],
  ["Listagem truncada", "fatalidade", "−14 projeto · volte 1 casa", "A página fotocopiada termina no meio de uma linha essencial. Sem o restante da rotina, você procura o exemplar original e recompõe o trecho perdido.", { projeto: -14, movimento: -1 }],
  ["Cópia autorizada", "evento", "+16 projeto · avance 2 casas", "Antes de distribuir o protótipo, você separa seus próprios arquivos dos programas de terceiros usados como referência. A versão de demonstração pode circular com autoria clara.", { projeto: 16, movimento: 2 }],
  ["Disquete com erro", "fatalidade", "−18 projeto · volte 2 casas", "Na hora de abrir a cópia de trabalho, o drive insiste e devolve erro de leitura. Você resgata o último backup e refaz as mudanças que não chegaram a ser salvas.", { projeto: -18, movimento: -2 }],
  ["Revista especializada", "evento", "+16 projeto", "Você encontra numa revista técnica um exemplo de organização de código e reescreve a rotina mais confusa. O programa fica menor e mais fácil de testar.", { projeto: 16 }],
  ["Concurso de programas", "evento", "+20 projeto · jogue outra vez", "Uma revista anuncia um concurso para programas de leitores. Você prepara uma versão demonstrável, revisa as instruções e envia o material dentro do prazo.", { projeto: 20, jogadaExtra: true }],
  [atos[30].titulo, "marco", "+20 projeto", atos[30].narrativa, { projeto: 20 }],
  ["Teste do controle", "evento", "+16 projeto", "Uma última partida com joystick revela um comando pouco intuitivo. Você troca a combinação de botões e evita que o jogador fique preso na primeira fase.", { projeto: 16 }],
  ["Impressora emperrada", "fatalidade", "−14 projeto · perca 1 jogada", "O papel prende na impressora matricial durante a tiragem das instruções. Você perde a noite ajustando a fita e reimprimindo as páginas manchadas.", { projeto: -14, perdeTurno: true }],
  ["Disquetes mestres", "evento", "+18 projeto", "Você grava o mestre, testa a leitura e guarda uma cópia separada antes de duplicar. Pela primeira vez, consegue entregar a mesma versão a todos.", { projeto: 18 }],
  ["A capa", "evento", "+18 projeto · avance 1 casa", "Com papel, letras de transferência e uma prova impressa, você monta a capa do jogo. O visual conta a aventura antes mesmo de o disquete entrar no drive.", { projeto: 18, movimento: 1 }],
  ["Duplicação em série", "evento", "+18 projeto", "Cada cópia é gravada e conferida em outro leitor. A rotina é lenta, mas evita mandar ao público um disco que só funciona na sua máquina.", { projeto: 18 }],
  ["Caixas trocadas", "fatalidade", "−14 projeto · volte 1 casa", "As etiquetas foram coladas nas caixas erradas. Você interrompe o envio, abre o lote e confere uma por uma antes que o engano chegue às lojas.", { projeto: -14, movimento: -1 }],
  ["Crítica na revista", "evento", "+18 projeto", "A revista publica uma análise favorável e destaca a clareza das instruções. Você recorta a página: ela ajuda outros leitores a descobrir o jogo.", { projeto: 18 }],
  ["A errata grave", "fatalidade", "−18 projeto · perca 1 jogada", "Um leitor encontra uma instrução impressa com a tecla errada. Você avisa a revista e prepara uma errata antes que mais cópias saiam com o defeito.", { projeto: -18, perdeTurno: true }],
  ["Prêmio dos leitores", "marco", "+22 projeto", "Numa votação da revista, leitores citam seu jogo entre os favoritos. O reconhecimento anima você a revisar os últimos detalhes da edição.", { projeto: 22 }],
  ["Seu nome no catálogo", "final", "+10 projeto · vitória", "O catálogo chega pelo correio com a prova do anúncio. Quem alcança a casa 40 primeiro publica o jogo. Os pontos de projeto ficam no placar e no desempate; não há retorno à casa 30.", { projeto: 10 }],
];

const caixas: Array<[number, number, number, number]> = [
  [17.6, 11.5, 6.6, 9.9], [24.2, 11.4, 6.0, 9.9], [30.4, 11.5, 6.0, 9.9],
  [36.5, 11.5, 6.0, 9.9], [42.6, 11.5, 6.0, 9.9], [48.7, 11.5, 6.0, 9.9],
  [54.8, 11.5, 6.0, 9.9], [60.9, 11.5, 6.0, 9.9], [67.0, 11.5, 8.0, 9.9],
  [75.0, 11.2, 10.2, 10.6], [78.5, 22.8, 9.5, 6.2], [80.4, 28.8, 9.5, 6.3],
  [82.0, 35.0, 9.5, 6.5], [83.8, 41.8, 9.5, 6.5], [85.4, 48.7, 9.5, 6.5],
  [86.9, 55.5, 9.5, 6.5], [87.8, 62.4, 9.0, 6.5], [86.8, 69.3, 9.2, 6.5],
  [84.6, 76.1, 10.3, 9.9], [82.8, 77.0, 11.2, 10.0], [75.7, 77.9, 6.3, 9.2],
  [67.9, 77.9, 7.9, 9.2], [60.1, 77.9, 7.9, 9.2], [52.4, 77.9, 7.9, 9.2],
  [45.9, 77.9, 6.6, 9.2], [39.3, 77.9, 6.4, 9.2], [32.9, 77.9, 6.3, 9.2],
  [26.7, 77.9, 6.1, 9.2], [19.3, 77.9, 7.1, 9.2], [8.7, 76.8, 10.0, 10.5],
  [9.2, 69.7, 9.3, 6.8], [9.2, 62.8, 9.3, 6.8], [9.2, 56.0, 9.3, 6.8],
  [9.2, 49.2, 9.3, 6.8], [9.2, 42.4, 9.3, 6.8], [9.2, 35.6, 9.3, 6.8],
  [9.2, 28.8, 9.3, 6.8], [9.2, 22.0, 9.3, 6.8], [9.2, 15.2, 9.3, 6.8],
  [7.3, 10.8, 10.4, 11.2],
];

export const casas: Casa[] = detalhes.map(([titulo, tipo, efeito, narrativa, consequencia], index) => {
  const [x, y, width, height] = caixas[index];
  return { id: index + 1, titulo, tipo, efeito, narrativa, consequencia, x, y, width, height };
});

