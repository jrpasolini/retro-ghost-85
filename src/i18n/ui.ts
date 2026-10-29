import type { Idioma } from "./content.ts";

/** Canonical strings remain PT-BR; only presentation values are localized.
 * Keep HTML, placeholders and file identifiers out of translation data.
 */
export const uiEn: Readonly<Record<string, string>> = {
  "A sua jornada…": "Your journey…",
  "Ouvir sua jornada": "Listen to your journey",
  "Ver caminho percorrido": "View your journey log",
  "Download da jornada em voz": "Download your journey audio",
  "Apresentação de RETRO-GHOST-85": "RETRO-GHOST-85 opening presentation",
  "Apresentação do projeto RETRO-GHOST-85.": "Presentation of the RETRO-GHOST-85 project.",
  "Controle da trilha sonora": "Soundtrack controls",
  "Volume da trilha sonora": "Soundtrack volume",
  "Protótipo do tabuleiro": "Game board",
  "Tabuleiro com 40 casas": "Board with 40 squares",
  "Mesa retrô com computador, cassetes, disquetes, BBS e quarenta casas ao redor": "Retro desk with a computer, cassettes, floppy disks, BBS and forty squares",
  "ENDGAME · PUBLICAÇÃO": "ENDGAME · PUBLISHED",
  "Albert Einstein sorri na tela do computador": "Albert Einstein smiles on the computer screen",
  "Gravador de cassete para salvar e carregar a partida": "Cassette deck for saving and loading the match",
  "Gravador de dados em cassete com teclas REC e PLAY": "Data cassette recorder with REC and PLAY keys",
  "REC: salvar partida em arquivo Markdown": "REC: save match as a Markdown file",
  "PLAY: carregar partida de arquivo Markdown": "PLAY: load match from a Markdown file",
  "Game log completo da partida. Role o mouse ou use as setas para ver o histórico.": "Complete match log. Scroll or use the arrow keys to browse the history.",
  "Casas interativas": "Interactive squares",
  "Peças dos quatro jogadores": "Player tokens",
  "Seleção de jogadores": "Player selection",
  "PASS-AND-PLAY · MESMO DISPOSITIVO": "PASS-AND-PLAY · SHARED DEVICE",
  "PRÓLOGO": "PROLOGUE",
  "EFEITO DA CASA": "SQUARE EFFECT",
  "Controle de rolagem do dado": "Die rolling controls",
  "> DADO_LOCAL (1D6)": "> LOCAL_DIE (1D6)",
  "RNG PURO": "PURE RNG",
  "AGUARDANDO JOGADA": "AWAITING TURN",
  "ROLAR DADO": "ROLL DIE",
  "PASSAR TURNO": "SKIP TURN",
  "VER ENDGAME": "VIEW ENDGAME",
  "Inicie a jornada para liberar o dado.": "Start your journey to unlock the die.",
  "Clique em qualquer casa ou jogador para inspecionar detalhes.": "Select any square or player to inspect details.",
  "40 CASAS · 1–4 JOGADORES/CPU · 1D6 · SAVE/LOAD · TRILHA DINÂMICA": "40 SQUARES · 1–4 PLAYERS/CPU · 1D6 · SAVE/LOAD · DYNAMIC TRACK",
  "Quem vai programar?": "Who will write the code?",
  "Escolha de um a quatro participantes. Humanos dividem o mesmo dispositivo; a CPU apenas rola o dado automaticamente na própria vez.": "Choose one to four players. Humans share one device; the CPU automatically rolls the die on its turn.",
  "Quantidade de participantes": "Number of players",
  "Remover participante": "Remove player",
  "Adicionar participante": "Add player",
  "CARREGAR SAVE": "LOAD SAVE",
  "INICIAR JORNADA": "START JOURNEY",
  "CPU local · mesmas regras · mesma sorte · nenhuma chamada ao Gemma": "Local CPU · same rules · same luck · no Gemma calls",
  "PUBLICAÇÃO": "PUBLISHED",
  "O Mestre narra": "The Master narrates",
  "Ouvir o Mestre": "Hear the Master",
  "Baixar troféu (MP3)": "Download trophy (MP3)",
  "Trajetória": "Journey",
  "Placar": "Leaderboard",
  "VER TABULEIRO": "VIEW BOARD",
  "NOVA PARTIDA": "NEW MATCH",
  "O cassete REC/SAVE continua disponível no tabuleiro.": "REC/SAVE remains available on the board.",
  "RETRO-GHOST-85 // TROFÉU": "RETRO-GHOST-85 // TROPHY",
  "ATO": "ACT",
  "Chegou ao ato": "Act reached",
  "CONTINUAR": "CONTINUE",
  "HUMANO": "HUMAN",
  "CPU LOCAL": "LOCAL CPU",
  "Configuração inválida": "Invalid setup",
  "SISTEMA PRONTO · CONFIGURE A PARTIDA": "SYSTEM READY · SET UP YOUR MATCH",
  "REC · PARTIDA GRAVADA": "REC · MATCH SAVED",
  "PLAY · PARTIDA CARREGADA": "PLAY · MATCH LOADED",
  "SAVE INVÁLIDO": "INVALID SAVE",
  "sem troféu de ato": "no Act trophy",
  "Ponto de partida · sem efeito": "Starting square · no effect",
  "TURNO PERDIDO · SEM ROLAGEM": "TURN LOST · NO ROLL",
  "PASS-AND-PLAY": "PASS-AND-PLAY",
  "Retorno ao tabuleiro": "Back to board",
  "narração em breve": "narration coming soon",
  "A partida precisa de 1 a 4 participantes": "A match needs 1 to 4 players",
  "A partida precisa de pelo menos um jogador humano": "A match needs at least one human player",
  "O modo CPU exige pelo menos dois participantes": "CPU mode requires at least two players",
  "Tipo de controle inválido": "Invalid player control",
  "Versão de save incompatível": "Incompatible save version",
  "Arquivo de save muito grande": "Save file is too large",
  "Bloco JSON do save não encontrado": "Save JSON block not found",
  "Não foi possível ler o save": "The save could not be read",
  "Save inválido": "Invalid save",
  "O save precisa conter de um a quatro jogadores": "The save must contain one to four players",
  "Jogador inválido no save": "Invalid player in save",
  "Posição inválida no save": "Invalid position in save",
  "Estado da partida inválido": "Invalid match state",
  "Turno inválido no save": "Invalid turn in save",
  "ID de jogador inválido": "Invalid player ID",
  "Controle de jogador inválido": "Invalid player control",
  "Nome de jogador inválido": "Invalid player name",
  "Progresso de jogador inválido": "Invalid player progress",
  "ACTS inválidos": "Invalid Acts",
  "Lance do game log inválido": "Invalid match log entry",
  "Troféu inválido no game log": "Invalid match log trophy",
  "Troféu inválido": "Invalid trophy",
  "Estado do RNG inválido": "Invalid RNG state",
  "A partida não aceita jogadas": "The match cannot accept rolls",
  "Dado inválido": "Invalid die value",
  "Jogador ativo inválido": "Invalid active player",
  "Jogada perdida pendente: passe o turno antes de rolar": "Lost turn pending: skip this turn before rolling",
  "Só uma partida solo em andamento pode cumprir essa penalidade": "Only an active solo match can serve this penalty",
  "Não há jogada perdida pendente": "There is no lost turn to serve",
};

export function ui(texto: string, idioma: Idioma): string {
  return idioma === "pt-BR" ? texto : uiEn[texto] ?? texto;
}
export function erroLocalizado(erro: unknown, idioma: Idioma, fallback: string): string {
  if (!(erro instanceof Error)) return ui(fallback, idioma);
  return ui(erro.message, idioma);
}
export function nomePadrao(id: number, idioma: Idioma): string {
  return idioma === "pt-BR" ? `Jogador ${id}` : `Player ${id}`;
}
export function textoJogador(nome: string, chave: "turn"|"turnLost"|"turnServed"|"cpu", idioma: Idioma): string {
  if (idioma === "pt-BR") {
    if (chave === "turn") return `Vez de ${nome}. Clique para rolar o dado.`;
    if (chave === "turnLost") return `${nome} perdeu uma jogada. Clique em PASSAR TURNO para cumprir a penalidade sem rolar o dado.`;
    if (chave === "turnServed") return `${nome} cumpriu a penalidade sem rolar o dado nem avançar. Próxima jogada liberada.`;
    return `${nome} está preparando a jogada automática...`;
  }
  if (chave === "turn") return `${nome}'s turn. Click to roll the die.`;
  if (chave === "turnLost") return `${nome} must skip a turn. Click SKIP TURN to serve the penalty without rolling.`;
  if (chave === "turnServed") return `${nome} served the penalty without rolling or moving. Your next roll is ready.`;
  return `${nome} is preparing an automatic roll...`;
}
export function textoDado(valor: number, idioma: Idioma): string {
  return idioma === "pt-BR"
    ? `RESULTADO: ${valor} · AVANCE ${valor} CASA${valor === 1 ? "" : "S"}`
    : `RESULT: ${valor} · ADVANCE ${valor} ${valor === 1 ? "SQUARE" : "SQUARES"}`;
}
export function nomeScore(idioma: Idioma, nome: string, projeto: number, pessoal: number, mesa: number): string {
  return idioma === "pt-BR"
    ? `Projeto final: ${projeto}/100 · Rolagens de ${nome}: ${pessoal} · Rolagens da mesa: ${mesa}`
    : `Final progress: ${projeto}/100 · ${nome}'s rolls: ${pessoal} · Total rolls: ${mesa}`;
}
export function textoVitoria(nome: string, idioma: Idioma): string {
  return idioma === "pt-BR" ? `${nome}, seu nome entrou no catálogo!` : `${nome}, your name made it into the catalog!`;
}
