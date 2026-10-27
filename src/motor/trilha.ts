export type TrilhaId = "intro" | "act-1" | "act-2" | "act-3" | "act-4" | "endgame";

export const casasDosAtos = [1, 10, 20, 30] as const;

export function atoDaCasa(casa: number): number | null {
  const indice = casasDosAtos.indexOf(casa as (typeof casasDosAtos)[number]);
  return indice === -1 ? null : indice + 1;
}

export function maiorAtoAlcancado(actsVisitados: number[][]): number {
  return actsVisitados.reduce((maior, visitas) => {
    const maiorDoJogador = visitas.reduce((ato, casa) => Math.max(ato, atoDaCasa(casa) ?? 0), 0);
    return Math.max(maior, maiorDoJogador);
  }, 0);
}

export function proximaTrilha(atoAtual: number, atoAlcancado: number, venceu = false): TrilhaId {
  if (venceu) return "endgame";
  const ato = Math.max(atoAtual, Math.min(4, atoAlcancado));
  return ato === 0 ? "intro" : `act-${ato}` as TrilhaId;
}

