import type { Idioma } from "../i18n/content.ts";
import { efeitoDeEntrada, tituloTrofeu } from "../i18n/content.ts";

export const CHAVES_TROFEU = ["act10", "act20", "act30", "endgame"] as const;
export type ChaveTrofeu = (typeof CHAVES_TROFEU)[number];

export const PORTAO_DO_TROFEU = { act10: 10, act20: 20, act30: 30 } as const;

export const NOME_TROFEU: Record<ChaveTrofeu, string> = {
  act10: "Ato 2",
  act20: "Ato 3",
  act30: "Ato 4",
  endgame: "Endgame",
};

export type EntradaLog = {
  turno: number;
  jogadorId: number;
  jogador: string;
  controle: "humano" | "cpu";
  cor: string;
  dado1: number | null;
  dado2: number | null;
  casaOrigem: number;
  casaDestino: number;
  casaFinal: number;
  casasPassadas: number[];
  atosEntrados: number[];
  efeito: string;
  deltaProjeto: number;
  projeto: number;
  jogadaExtra: boolean;
  perdeTurno: boolean;
  perderamVez: string[];
  trofeus: ChaveTrofeu[];
  vitoria: boolean;
};

export type Trofeu = {
  jogadorId: number;
  turno: number;
  caminho: EntradaLog[];
};

export type Trofeus = Record<ChaveTrofeu, Trofeu | null>;

export function trofeusVazios(): Trofeus {
  return { act10: null, act20: null, act30: null, endgame: null };
}

/** A casa 1 abre a jornada no boot. Troféu só existe a partir das casas 10, 20 e 30. */
export function chaveDoPortao(portao: number): ChaveTrofeu | null {
  if (portao === 10) return "act10";
  if (portao === 20) return "act20";
  if (portao === 30) return "act30";
  return null;
}

export function casasNoTrajeto(origem: number, destino: number): number[] {
  if (origem === destino) return [];
  const sentido = destino > origem ? 1 : -1;
  const casas: number[] = [];
  for (let casa = origem + sentido; casa !== destino + sentido; casa += sentido) casas.push(casa);
  return casas;
}

/** Trajetória de um participante, da casa 1 até o lance mais recente, na ordem do log. */
export function getPlayerTrajectory(log: readonly EntradaLog[], jogadorId: number): EntradaLog[] {
  return log.filter((entrada) => entrada.jogadorId === jogadorId);
}

export function formatarLinhaLog(entrada: EntradaLog, idioma: Idioma = "pt-BR"): string {
  if (idioma === "en-US") {
    const trophies = entrada.trofeus.length ? ` · trophy ${entrada.trofeus.map(k => tituloTrofeu(k, idioma)).join(", ")}` : "";
    if (entrada.turno === 0) return `T0 · ${entrada.jogador} · start · square 1 · ${efeitoDeEntrada(entrada.efeito, 1, idioma)}${trophies}`;
    if (entrada.dado1 === null) return `T${entrada.turno} · ${entrada.jogador} · LOST TURN · no roll · square ${entrada.casaFinal} · ${entrada.projeto}/100`;
    const rolled = entrada.dado2 === null ? String(entrada.dado1) : `${entrada.dado1}+${entrada.dado2}=${(entrada.dado1 ?? 0) + entrada.dado2}`;
    const move = entrada.casaDestino === entrada.casaFinal
      ? `${entrada.casaOrigem}→${entrada.casaFinal}`
      : `${entrada.casaOrigem}→${entrada.casaDestino}→${entrada.casaFinal}`;
    const passed = entrada.casasPassadas.length ? ` · passed ${entrada.casasPassadas[0]}–${entrada.casasPassadas.at(-1)}` : "";
    const acts = entrada.atosEntrados.length ? ` · Acts ${entrada.atosEntrados.map(n => n === 10 ? 2 : n === 20 ? 3 : n === 30 ? 4 : 1).join(",")}` : "";
    const delta = entrada.deltaProjeto > 0 ? `+${entrada.deltaProjeto}` : String(entrada.deltaProjeto);
    const bonus = entrada.jogadaExtra ? " · roll again" : entrada.perdeTurno ? " · lose a turn" : "";
    const skipped = entrada.perderamVez.length ? ` · skipped ${entrada.perderamVez.join(", ")}` : "";
    const victory = entrada.vitoria ? " · VICTORY" : "";
    return `T${entrada.turno} · ${entrada.jogador} · DIE ${rolled} · ${move}${passed}${acts} · ${efeitoDeEntrada(entrada.efeito, entrada.casaDestino, idioma)} · ${delta} progress · ${entrada.projeto}/100${bonus}${skipped}${trophies}${victory}`;
  }
  const trofeus = entrada.trofeus.length ? ` · troféu ${entrada.trofeus.map((chave) => NOME_TROFEU[chave]).join(", ")}` : "";
  if (entrada.turno === 0) return `T0 · ${entrada.jogador} · início · casa 1 · ${entrada.efeito}${trofeus}`;
  if (entrada.dado1 === null) {
    return `T${entrada.turno} · ${entrada.jogador} · TURNO PERDIDO · sem rolagem · casa ${entrada.casaFinal} · ${entrada.projeto}/100`;
  }
  const dados = entrada.dado2 === null
    ? String(entrada.dado1)
    : `${entrada.dado1}+${entrada.dado2}=${(entrada.dado1 ?? 0) + entrada.dado2}`;
  const destino = entrada.casaDestino === entrada.casaFinal
    ? `${entrada.casaOrigem}→${entrada.casaFinal}`
    : `${entrada.casaOrigem}→${entrada.casaDestino}→${entrada.casaFinal}`;
  const passou = entrada.casasPassadas.length
    ? ` · passou ${entrada.casasPassadas[0]}–${entrada.casasPassadas[entrada.casasPassadas.length - 1]}`
    : "";
  const atos = entrada.atosEntrados.length ? ` · atos ${entrada.atosEntrados.join(",")}` : "";
  const sinal = entrada.deltaProjeto > 0 ? `+${entrada.deltaProjeto}` : String(entrada.deltaProjeto);
  const extra = entrada.jogadaExtra ? " · jogue outra" : entrada.perdeTurno ? " · perde turno" : "";
  const pulados = entrada.perderamVez.length ? ` · pulou ${entrada.perderamVez.join(", ")}` : "";
  const vitoria = entrada.vitoria ? " · VITÓRIA" : "";
  return `T${entrada.turno} · ${entrada.jogador} · DADO ${dados} · ${destino}${passou}${atos} · ${entrada.efeito} · ${sinal} pts · ${entrada.projeto}/100${extra}${pulados}${trofeus}${vitoria}`;
}

export function textoMestre(trajetoria: readonly EntradaLog[], nome: string, idioma: Idioma = "pt-BR"): string {
  if (idioma === "en-US") {
    if (trajetoria.length === 0) return `${nome} has left no trace on the board yet.`;
    const passos = trajetoria.map(entrada => {
      if (entrada.turno === 0) return `You begin on square 1 (${efeitoDeEntrada(entrada.efeito, 1, idioma)}).`;
      if (entrada.dado1 === null) return `On turn ${entrada.turno}, you serve a lost-turn penalty without rolling the die or leaving square ${entrada.casaFinal}.`;
      const roll = entrada.dado2 === null ? String(entrada.dado1) : `${entrada.dado1} and ${entrada.dado2}`;
      const destination = entrada.casaDestino === entrada.casaFinal
        ? `reach square ${entrada.casaFinal}`
        : `land on square ${entrada.casaDestino} and end on square ${entrada.casaFinal}`;
      const change = entrada.deltaProjeto > 0 ? `gain ${entrada.deltaProjeto} progress`
        : entrada.deltaProjeto < 0 ? `lose ${Math.abs(entrada.deltaProjeto)} progress`
        : "your progress remains unchanged";
      const notes = [
        entrada.jogadaExtra ? "earn another roll" : "",
        entrada.perdeTurno ? "lose your next turn" : "",
        entrada.trofeus.length ? `claim ${entrada.trofeus.map(k => tituloTrofeu(k, idioma)).join(" and ")}` : "",
        entrada.vitoria ? "publish your game" : "",
      ].filter(Boolean);
      return `On turn ${entrada.turno}, you roll ${roll} and ${destination}. ${efeitoDeEntrada(entrada.efeito, entrada.casaDestino, idioma)}: you ${change}, reaching ${entrada.projeto}/100.${notes.length ? " You " + notes.join("; ") + "." : ""}`;
    });
    return `${nome}'s story begins on square 1. ${passos.join(" ")}`;
  }
  if (trajetoria.length === 0) return `${nome} ainda não deixou rastro no tabuleiro.`;
  const passos = trajetoria.map((entrada) => {
    if (entrada.turno === 0) return `Começou na casa 1 (${entrada.efeito}).`;
    if (entrada.dado1 === null) return `No turno ${entrada.turno}, cumpriu a penalidade sem rolar o dado nem sair da casa ${entrada.casaFinal}.`;
    const paradeiro = entrada.casaDestino === entrada.casaFinal
      ? `caiu na casa ${entrada.casaFinal}`
      : `aplicou o efeito da casa ${entrada.casaDestino} e parou na casa ${entrada.casaFinal}`;
    const sinal = entrada.deltaProjeto > 0
      ? `ganhou ${entrada.deltaProjeto} de projeto`
      : entrada.deltaProjeto < 0
        ? `perdeu ${Math.abs(entrada.deltaProjeto)} de projeto`
        : `não alterou o projeto`;
    const notas = [
      entrada.jogadaExtra ? "ganhou outra jogada" : "",
      entrada.perdeTurno ? "perdeu um turno" : "",
      entrada.trofeus.length ? `conquistou ${entrada.trofeus.map((chave) => NOME_TROFEU[chave]).join(" e ")}` : "",
      entrada.vitoria ? "publicou o jogo" : "",
    ].filter(Boolean);
    const complemento = notas.length ? ` ${notas.join("; ")}.` : "";
    const rolagem = entrada.dado2 === null
      ? `${entrada.dado1}`
      : `${entrada.dado1} e ${entrada.dado2}`;
    return `No turno ${entrada.turno} tirou ${rolagem}, ${paradeiro} (${entrada.efeito}); ${sinal} e ficou com ${entrada.projeto}/100.${complemento}`;
  });
  return `${nome} percorreu o tabuleiro desde a casa 1. ${passos.join(" ")}`;
}
export function formatarGameLogMarkdown(log: readonly EntradaLog[], idioma: Idioma = "pt-BR"): string {
  if (log.length === 0) return idioma === "pt-BR" ? "_Nenhum lance registrado._" : "_No turns recorded._";
  return log.map((entrada) => `- ${formatarLinhaLog(entrada, idioma)}`).join("\n");
}

export function formatarTrajetoriaMarkdown(nome: string, trajetoria: readonly EntradaLog[], idioma: Idioma = "pt-BR"): string {
  const corpo = trajetoria.length
    ? trajetoria.map((entrada) => `- ${formatarLinhaLog(entrada, idioma)}`).join("\n")
    : idioma === "pt-BR" ? "_Sem lances._" : "_No turns._";
  return `## ${idioma === "pt-BR" ? "Trajetória" : "Journey"} · ${nome}\n\n${corpo}`;
}
