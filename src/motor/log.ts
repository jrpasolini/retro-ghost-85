export const CHAVES_TROFEU = ["act1", "act10", "act20", "act30", "endgame"] as const;
export type ChaveTrofeu = (typeof CHAVES_TROFEU)[number];

export const PORTAO_DO_TROFEU = { act1: 1, act10: 10, act20: 20, act30: 30 } as const;

export const NOME_TROFEU: Record<ChaveTrofeu, string> = {
  act1: "Ato 1",
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
  return { act1: null, act10: null, act20: null, act30: null, endgame: null };
}

export function chaveDoPortao(portao: number): ChaveTrofeu | null {
  if (portao === 1) return "act1";
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

export function formatarLinhaLog(entrada: EntradaLog): string {
  const trofeus = entrada.trofeus.length ? ` · troféu ${entrada.trofeus.map((chave) => NOME_TROFEU[chave]).join(", ")}` : "";
  if (entrada.turno === 0) return `T0 · ${entrada.jogador} · início · casa 1 · ${entrada.efeito}${trofeus}`;
  const total = (entrada.dado1 ?? 0) + (entrada.dado2 ?? 0);
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
  return `T${entrada.turno} · ${entrada.jogador} · ${entrada.dado1}+${entrada.dado2}=${total} · ${destino}${passou}${atos} · ${entrada.efeito} · ${sinal} pts · ${entrada.projeto}/100${extra}${pulados}${trofeus}${vitoria}`;
}

export function textoMestre(trajetoria: readonly EntradaLog[], nome: string): string {
  if (trajetoria.length === 0) return `${nome} ainda não deixou rastro no tabuleiro.`;
  const passos = trajetoria.map((entrada) => {
    if (entrada.turno === 0) return `Começou na casa 1 (${entrada.efeito}).`;
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
    return `No turno ${entrada.turno} tirou ${entrada.dado1} e ${entrada.dado2}, ${paradeiro} (${entrada.efeito}); ${sinal} e ficou com ${entrada.projeto}/100.${complemento}`;
  });
  return `${nome} percorreu o tabuleiro desde a casa 1. ${passos.join(" ")}`;
}

export function formatarGameLogMarkdown(log: readonly EntradaLog[]): string {
  if (log.length === 0) return "_Nenhum lance registrado._";
  return log.map((entrada) => `- ${formatarLinhaLog(entrada)}`).join("\n");
}

export function formatarTrajetoriaMarkdown(nome: string, trajetoria: readonly EntradaLog[]): string {
  const corpo = trajetoria.length
    ? trajetoria.map((entrada) => `- ${formatarLinhaLog(entrada)}`).join("\n")
    : "_Sem lances._";
  return `## Trajetória · ${nome}\n\n${corpo}`;
}
