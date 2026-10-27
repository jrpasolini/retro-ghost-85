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
  easterEggDesbloqueado: boolean;
};

export function aplicarJogada(jogador: Jogador, passos: number, casas: Casa[]): ResultadoJogada {
  if (!Number.isInteger(passos) || passos < 1) throw new Error("Passos inválidos");
  const destino = Math.min(ULTIMA_CASA, jogador.casa + passos);
  const casa = casas[destino - 1];
  if (!casa || casa.id !== destino) throw new Error("Tabuleiro inválido");

  const projetoAntes = jogador.projeto;
  const projeto = Math.max(0, Math.min(META_PROJETO, projetoAntes + (casa.consequencia.projeto ?? 0)));
  // Quem alcança ou ultrapassa a casa 40 publica o jogo. O projeto é só placar.
  const movimento = destino === ULTIMA_CASA ? 0 : (casa.consequencia.movimento ?? 0);
  const deslocada = Math.max(1, Math.min(ULTIMA_CASA, destino + movimento));
  const venceu = destino === ULTIMA_CASA || deslocada === ULTIMA_CASA;
  const novaCasa = venceu ? ULTIMA_CASA : deslocada;
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
    jogadaExtra: Boolean(casa.consequencia.jogadaExtra) && !venceu,
    easterEggDesbloqueado: jogador.actsVisitados.length < CASAS_ACT.length && actsVisitados.length === CASAS_ACT.length,
  };
}

