import type { Casa, Jogador } from "../types.ts";
import type { EstadoSalvo, JogadorSalvo } from "../estado/save.ts";
import { criarJogadores, type ConfiguracaoJogador } from "./jogadores.ts";
import { clonarAssentos } from "./setup.ts";
import { aplicarJogada } from "./tabuleiro.ts";
import { avancarTurno } from "./turnos.ts";
import { maiorAtoAlcancado } from "./trilha.ts";
import type { EstadoRng } from "./dado.ts";
import {
  casasNoTrajeto,
  chaveDoPortao,
  getPlayerTrajectory,
  textoMestre,
  trofeusVazios,
  type ChaveTrofeu,
  type EntradaLog,
  type Trofeus,
} from "./log.ts";

export type EstadoPartida = {
  assentos: ConfiguracaoJogador[];
  jogadores: Jogador[];
  jogadorAtivo: number;
  jogadorSelecionado: number;
  casaAtiva: number;
  atoMusical: number;
  partidaIniciada: boolean;
  partidaEncerrada: boolean;
  turno: number;
  log: EntradaLog[];
  trofeus: Trofeus;
  rng: EstadoRng;
};

export type DadosJogada = { dado: number };

export type ResultadoRegistro = {
  estado: EstadoPartida;
  entrada: EntradaLog;
  novosTrofeus: ChaveTrofeu[];
  easterEggDesbloqueado: boolean;
  ignorados: string[];
};

function entradaInicial(jogador: Jogador): EntradaLog {
  return {
    turno: 0,
    jogadorId: jogador.id,
    jogador: jogador.nome,
    controle: jogador.controle,
    cor: jogador.cor,
    dado1: null,
    dado2: null,
    casaOrigem: 1,
    casaDestino: 1,
    casaFinal: 1,
    casasPassadas: [1],
    atosEntrados: [],
    efeito: "Ponto de partida · sem efeito",
    deltaProjeto: 0,
    projeto: 0,
    jogadaExtra: false,
    perdeTurno: false,
    perderamVez: [],
    trofeus: [],
    vitoria: false,
  };
}

export function iniciarPartida(assentos: ConfiguracaoJogador[], rng: EstadoRng): EstadoPartida {
  const jogadores = criarJogadores(assentos);
  const log = jogadores.map(entradaInicial);
  return {
    assentos: clonarAssentos(assentos),
    jogadores,
    jogadorAtivo: 1,
    jogadorSelecionado: 1,
    casaAtiva: 1,
    atoMusical: 1,
    partidaIniciada: true,
    partidaEncerrada: false,
    turno: 0,
    log,
    trofeus: trofeusVazios(),
    rng: { ...rng },
  };
}

export function registrarJogada(estado: EstadoPartida, dados: DadosJogada, casas: Casa[]): ResultadoRegistro {
  if (!estado.partidaIniciada || estado.partidaEncerrada) throw new Error("A partida não aceita jogadas");
  if (!Number.isInteger(dados.dado) || dados.dado < 1 || dados.dado > 6) {
    throw new Error("Dado inválido");
  }
  const atual = estado.jogadores[estado.jogadorAtivo - 1];
  if (!atual) throw new Error("Jogador ativo inválido");
  if (estado.jogadores.length === 1 && atual.turnosPerdidos > 0) {
    throw new Error("Jogada perdida pendente: passe o turno antes de rolar");
  }
  const resultado = aplicarJogada(atual, dados.dado, casas);
  const destino = resultado.casa.id;
  const casaFinal = resultado.jogador.casa;
  const percursoDado = casasNoTrajeto(atual.casa, destino);
  const percursoEfeito = destino === casaFinal ? [] : casasNoTrajeto(destino, casaFinal).filter((casa) => !percursoDado.includes(casa));
  const casasPassadas = [...percursoDado, ...percursoEfeito];
  const atosEntrados = resultado.jogador.actsVisitados.filter((portao) => !atual.actsVisitados.includes(portao));
  const turno = estado.turno + 1;
  const entrada: EntradaLog = {
    turno,
    jogadorId: atual.id,
    jogador: atual.nome,
    controle: atual.controle,
    cor: atual.cor,
    dado1: dados.dado,
    dado2: null,
    casaOrigem: atual.casa,
    casaDestino: destino,
    casaFinal,
    casasPassadas,
    atosEntrados,
    efeito: resultado.casa.efeito,
    deltaProjeto: resultado.jogador.projeto - atual.projeto,
    projeto: resultado.jogador.projeto,
    jogadaExtra: resultado.jogadaExtra,
    perdeTurno: Boolean(resultado.casa.consequencia.perdeTurno),
    perderamVez: [],
    trofeus: [],
    vitoria: resultado.venceu,
  };

  let jogadores = estado.jogadores.map((jogador) => jogador.id === atual.id ? resultado.jogador : jogador);
  let jogadorAtivo = estado.jogadorAtivo;
  let ignorados: string[] = [];
  if (!resultado.venceu && !resultado.jogadaExtra) {
    const rotacao = avancarTurno(jogadores, jogadorAtivo);
    jogadores = rotacao.jogadores;
    jogadorAtivo = rotacao.jogadorAtivo;
    ignorados = rotacao.ignorados;
    entrada.perderamVez = ignorados;
  }

  const log = [...estado.log, entrada];
  const trofeus: Trofeus = { ...estado.trofeus };
  const novosTrofeus: ChaveTrofeu[] = [];
  for (const portao of atosEntrados) {
    const chave = chaveDoPortao(portao);
    if (!chave || trofeus[chave]) continue;
    novosTrofeus.push(chave);
  }
  if (resultado.venceu && !trofeus.endgame) novosTrofeus.push("endgame");
  entrada.trofeus = [...novosTrofeus];
  const caminho = getPlayerTrajectory(log, atual.id).slice();
  for (const chave of novosTrofeus) {
    trofeus[chave] = { jogadorId: atual.id, turno, caminho: caminho.slice() };
  }

  const maiorAto = maiorAtoAlcancado(jogadores.map((jogador) => jogador.actsVisitados));
  return {
    estado: {
      ...estado,
      jogadores,
      jogadorAtivo,
      jogadorSelecionado: atual.id,
      casaAtiva: destino,
      atoMusical: Math.max(estado.atoMusical, maiorAto),
      partidaEncerrada: resultado.venceu,
      turno,
      log,
      trofeus,
    },
    entrada,
    novosTrofeus,
    easterEggDesbloqueado: resultado.easterEggDesbloqueado,
    ignorados,
  };
}

/** Cumpre uma penalidade de partida solo sem rolar dado, mover peça ou consumir RNG.
 * O evento integra o game log e a trajetória, preservando o schema de save 1.
 */
export function consumirTurnoPerdidoSolo(estado: EstadoPartida): EstadoPartida {
  if (!estado.partidaIniciada || estado.partidaEncerrada || estado.jogadores.length !== 1) {
    throw new Error("Só uma partida solo em andamento pode cumprir essa penalidade");
  }
  const atual = estado.jogadores[0];
  if (atual.turnosPerdidos < 1) throw new Error("Não há jogada perdida pendente");

  const entrada: EntradaLog = {
    turno: estado.turno + 1,
    jogadorId: atual.id,
    jogador: atual.nome,
    controle: atual.controle,
    cor: atual.cor,
    dado1: null,
    dado2: null,
    casaOrigem: atual.casa,
    casaDestino: atual.casa,
    casaFinal: atual.casa,
    casasPassadas: [],
    atosEntrados: [],
    efeito: "Penalidade cumprida · sem rolar o dado",
    deltaProjeto: 0,
    projeto: atual.projeto,
    jogadaExtra: false,
    perdeTurno: false,
    perderamVez: [atual.nome],
    trofeus: [],
    vitoria: false,
  };

  return {
    ...estado,
    jogadores: [{ ...atual, turnosPerdidos: atual.turnosPerdidos - 1 }],
    turno: estado.turno + 1,
    log: [...estado.log, entrada],
    jogadorSelecionado: atual.id,
    casaAtiva: atual.casa,
  };
}

export type LinhaRanking = { id: number; nome: string; controle: Jogador["controle"]; casa: number; projeto: number; trofeus: ChaveTrofeu[] };

export type TelaEndgame = {
  ativo: true;
  vencedorId: number;
  vencedorNome: string;
  projeto: number;
  rolamentosVencedor: number;
  rolamentosMesa: number;
  trajetoria: EntradaLog[];
  narracao: string;
  ranking: LinhaRanking[];
};

function trofeusDoJogador(trofeus: Trofeus, jogadorId: number): ChaveTrofeu[] {
  return (Object.keys(trofeus) as ChaveTrofeu[]).filter((chave) => trofeus[chave]?.jogadorId === jogadorId);
}

export function montarTelaEndgame(estado: EstadoPartida): TelaEndgame | null {
  const trofeu = estado.trofeus.endgame;
  if (!estado.partidaEncerrada || !trofeu) return null;
  const vencedor = estado.jogadores.find((jogador) => jogador.id === trofeu.jogadorId);
  if (!vencedor) return null;
  const trajetoria = getPlayerTrajectory(estado.log, vencedor.id);
  const ranking = [...estado.jogadores]
    .sort((a, b) => b.casa - a.casa || b.projeto - a.projeto || a.id - b.id)
    .map((jogador) => ({
      id: jogador.id,
      nome: jogador.nome,
      controle: jogador.controle,
      casa: jogador.casa,
      projeto: jogador.projeto,
      trofeus: trofeusDoJogador(estado.trofeus, jogador.id),
    }));
  return {
    ativo: true,
    vencedorId: vencedor.id,
    vencedorNome: vencedor.nome,
    projeto: vencedor.projeto,
    rolamentosVencedor: trajetoria.filter((entrada) => entrada.turno > 0 && entrada.dado1 !== null).length,
    rolamentosMesa: estado.log.filter((entrada) => entrada.turno > 0 && entrada.dado1 !== null).length,
    trajetoria,
    narracao: textoMestre(trajetoria, vencedor.nome),
    ranking,
  };
}

export function paraEstadoSalvo(estado: EstadoPartida): EstadoSalvo {
  return {
    schema: 1,
    jogadorAtivo: estado.jogadorAtivo,
    jogadorSelecionado: estado.jogadorSelecionado,
    casaAtiva: estado.casaAtiva,
    atoMusical: estado.atoMusical,
    partidaIniciada: estado.partidaIniciada,
    partidaEncerrada: estado.partidaEncerrada,
    turno: estado.turno,
    rng: { ...estado.rng },
    log: estado.log.map((entrada) => ({ ...entrada, casasPassadas: [...entrada.casasPassadas], atosEntrados: [...entrada.atosEntrados], perderamVez: [...entrada.perderamVez], trofeus: [...entrada.trofeus] })),
    trofeus: {
      act10: clonarTrofeu(estado.trofeus.act10),
      act20: clonarTrofeu(estado.trofeus.act20),
      act30: clonarTrofeu(estado.trofeus.act30),
      endgame: clonarTrofeu(estado.trofeus.endgame),
    },
    jogadores: estado.jogadores.map(({ id, nome, controle, casa, projeto, turnosPerdidos, actsVisitados }) => ({
      id, nome, controle, casa, projeto, turnosPerdidos, actsVisitados: [...actsVisitados],
    })),
  };
}

function clonarTrofeu(trofeu: EstadoPartida["trofeus"]["act10"]) {
  if (!trofeu) return null;
  return {
    jogadorId: trofeu.jogadorId,
    turno: trofeu.turno,
    caminho: trofeu.caminho.map((entrada) => ({
      ...entrada,
      casasPassadas: [...entrada.casasPassadas],
      atosEntrados: [...entrada.atosEntrados],
      perderamVez: [...entrada.perderamVez],
      trofeus: [...entrada.trofeus],
    })),
  };
}

export function daEstadoSalvo(salvo: EstadoSalvo): EstadoPartida {
  const assentos = salvo.jogadores.map((jogador) => ({
    controle: jogador.controle ?? "humano",
    nome: jogador.nome,
  }));
  const base = criarJogadores(assentos);
  const jogadores = base.map((jogador) => {
    const gravado = salvo.jogadores.find((item) => item.id === jogador.id) as JogadorSalvo;
    return {
      ...jogador,
      nome: gravado.nome ?? jogador.nome,
      controle: gravado.controle ?? jogador.controle,
      casa: gravado.casa,
      projeto: gravado.projeto,
      turnosPerdidos: gravado.turnosPerdidos,
      actsVisitados: [...gravado.actsVisitados],
    };
  });
  return {
    assentos,
    jogadores,
    jogadorAtivo: salvo.jogadorAtivo,
    jogadorSelecionado: salvo.jogadorSelecionado,
    casaAtiva: salvo.casaAtiva,
    atoMusical: salvo.atoMusical,
    partidaIniciada: salvo.partidaIniciada,
    partidaEncerrada: salvo.partidaEncerrada,
    turno: salvo.turno ?? 0,
    log: (salvo.log ?? []).map((entrada) => ({ ...entrada })),
    trofeus: {
      act10: salvo.trofeus?.act10 ?? null,
      act20: salvo.trofeus?.act20 ?? null,
      act30: salvo.trofeus?.act30 ?? null,
      endgame: salvo.trofeus?.endgame ?? null,
    },
    rng: salvo.rng ? { ...salvo.rng } : { semente: 1, estado: 1 },
  };
}
