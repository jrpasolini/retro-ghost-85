import type { Jogador } from "../types.ts";
import { criarJogadores, type ConfiguracaoJogador } from "./jogadores.ts";

export function clonarAssentos(assentos: ConfiguracaoJogador[]): ConfiguracaoJogador[] {
  return assentos.map((assento) => ({
    controle: assento.controle,
    nome: assento.controle === "humano" ? assento.nome : undefined,
  }));
}

/** A quantidade confirmada é o tamanho da lista. Acrescentar cria CPU; remover tira o último assento. */
export function ajustarQuantidade(assentos: ConfiguracaoJogador[], quantidade: number): ConfiguracaoJogador[] {
  const alvo = Math.max(1, Math.min(4, Math.trunc(quantidade)));
  const proximo = clonarAssentos(assentos).slice(0, alvo);
  while (proximo.length < alvo) proximo.push({ controle: "cpu" });
  return proximo;
}

export function resumoJogadores(jogadores: Pick<Jogador, "controle">[]): string {
  const total = jogadores.length;
  const humanos = jogadores.filter((jogador) => jogador.controle === "humano").length;
  const cpus = total - humanos;
  const textoHumano = `${humanos} HUMANO${humanos === 1 ? "" : "S"}`;
  const textoCpu = cpus > 0 ? ` · ${cpus} CPU` : "";
  return `A partida começa na casa 1 · ${total} participante${total === 1 ? "" : "s"} · ${textoHumano}${textoCpu} · 1D6`;
}

/** O rodapé do boot usa os assentos visíveis, não um contador separado. */
export function resumoAssentos(assentos: Pick<Jogador, "controle">[]): string {
  return resumoJogadores(assentos);
}

/** Resumo e elenco saem da mesma lista de assentos. */
export function confirmarAssentos(assentos: ConfiguracaoJogador[]): { assentos: ConfiguracaoJogador[]; jogadores: Jogador[]; resumo: string } {
  const confirmados = clonarAssentos(assentos);
  const jogadores = criarJogadores(confirmados);
  return { assentos: confirmados, jogadores, resumo: resumoJogadores(jogadores) };
}
