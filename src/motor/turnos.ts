import type { Jogador } from "../types";

export type ResultadoTurno = {
  jogadores: Jogador[];
  jogadorAtivo: number;
  ignorados: string[];
};

export function proximoJogadorId(jogadorAtivo: number, quantidade: number): number {
  if (!Number.isInteger(jogadorAtivo) || jogadorAtivo < 1 || jogadorAtivo > quantidade) {
    throw new Error("Jogador ativo inválido");
  }
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new Error("Quantidade de jogadores inválida");
  }
  return (jogadorAtivo % quantidade) + 1;
}

/** Avança a rotação e consome exatamente um turno perdido por jogador pulado. */
export function avancarTurno(jogadores: Jogador[], jogadorAtivo: number): ResultadoTurno {
  const atualizados = jogadores.map((jogador) => ({ ...jogador }));
  let proximo = proximoJogadorId(jogadorAtivo, atualizados.length);
  const ignorados: string[] = [];

  // Sem outro participante, a penalidade deve permanecer pendente até
  // a próxima ação explícita. Consumir aqui a tornaria invisível no solo.
  if (atualizados.length === 1) {
    return { jogadores: atualizados, jogadorAtivo, ignorados };
  }

  for (let i = 0; i < atualizados.length; i++) {
    const jogador = atualizados[proximo - 1];
    if (jogador.turnosPerdidos === 0) break;
    jogador.turnosPerdidos -= 1;
    ignorados.push(jogador.nome);
    proximo = proximoJogadorId(proximo, atualizados.length);
  }

  return { jogadores: atualizados, jogadorAtivo: proximo, ignorados };
}

export function podeIniciarJogada(rolandoDado: boolean, partidaEncerrada: boolean): boolean {
  return !rolandoDado && !partidaEncerrada;
}
