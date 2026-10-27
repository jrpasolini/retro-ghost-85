import type { Casa } from "../types";

const formacoes: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 0, y: 0 }],
  2: [{ x: -1, y: 0 }, { x: 1, y: 0 }],
  3: [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 0, y: 1 }],
  4: [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }],
};

/** Centraliza uma peça quando está sozinha e distribui apenas peças que dividem a mesma casa. */
export function posicaoDaPeca(casa: Casa, indiceNaCasa: number, totalNaCasa: number): { x: number; y: number } {
  const formacao = formacoes[totalNaCasa];
  if (!formacao || !formacao[indiceNaCasa]) throw new Error("Ocupação de casa inválida");
  const deslocamento = formacao[indiceNaCasa];
  return {
    x: casa.x + casa.width / 2 + deslocamento.x * Math.min(1, casa.width * .18),
    y: casa.y + casa.height / 2 + deslocamento.y * Math.min(1.35, casa.height * .18),
  };
}
