export type TrilhaId = "intro" | "act-1" | "act-2" | "act-3" | "act-4" | "endgame";

export const casasDosAtos = [1, 10, 20, 30] as const;

export function atoDaCasa(casa: number): number | null {
  const indice = casasDosAtos.indexOf(casa as (typeof casasDosAtos)[number]);
  return indice === -1 ? null : indice + 1;
}

/** Retorna o ato correspondente à faixa atualmente alcançada no tabuleiro. */
export function atoDaPosicao(casa: number): number {
  if (!Number.isInteger(casa) || casa < 1 || casa > 40) throw new Error("Casa inválida");
  if (casa >= 30) return 4;
  if (casa >= 20) return 3;
  if (casa >= 10) return 2;
  return 1;
}

export function trilhaDeveRepetir(trilha: TrilhaId): boolean {
  return trilha !== "endgame";
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

