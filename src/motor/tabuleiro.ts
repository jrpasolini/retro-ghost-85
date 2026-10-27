import type { Casa, Jogador } from "../types";
import { atoDaPosicao } from "./trilha.ts";

export const META_PROJETO = 100;
export const ULTIMA_CASA = 40;
export const CASAS_ACT = [1, 10, 20, 30] as const;

export type ResultadoJogada = {
  jogador: Jogador;
  casa: Casa;
  venceu: boolean;
  jogadaExtra: boolean;
  recusouFinal: boolean;
  easterEggDesbloqueado: boolean;
};

export function aplicarJogada(jogador: Jogador, passos: number, casas: Casa[]): ResultadoJogada {
  if (!Number.isInteger(passos) || passos < 1) throw new Error("Passos inválidos");
  const destino = Math.min(ULTIMA_CASA, jogador.casa + passos);
  const casa = casas[destino - 1];
  if (!casa || casa.id !== destino) throw new Error("Tabuleiro inválido");

  const projeto = Math.max(0, Math.min(META_PROJETO, jogador.projeto + (casa.consequencia.projeto ?? 0)));
  const venceu = destino === ULTIMA_CASA && projeto >= META_PROJETO;
  const recusouFinal = destino === ULTIMA_CASA && !venceu;
  const novaCasa = recusouFinal
    ? 30
    : Math.max(1, Math.min(ULTIMA_CASA, destino + (casa.consequencia.movimento ?? 0)));
  const visitas = new Set(jogador.actsVisitados);
  const maiorAtoAtingido = atoDaPosicao(Math.max(destino, novaCasa));
  CASAS_ACT.slice(0, maiorAtoAtingido).forEach((act) => visitas.add(act));
  const actsVisitados = CASAS_ACT.filter((act) => visitas.has(act));

  return {
    jogador: {
      ...jogador,
      casa: novaCasa,
      projeto,
      turnosPerdidos: jogador.turnosPerdidos + (casa.consequencia.perdeTurno ? 1 : 0),
      actsVisitados,
    },
    casa,
    venceu,
    jogadaExtra: Boolean(casa.consequencia.jogadaExtra),
    recusouFinal,
    easterEggDesbloqueado: jogador.actsVisitados.length < CASAS_ACT.length && actsVisitados.length === CASAS_ACT.length,
  };
}

