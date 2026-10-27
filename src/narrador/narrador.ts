import type { ChaveTrofeu, EntradaLog } from "../motor/log.ts";

export type PedidoNarracao = {
  tipo: "ato" | "endgame";
  chave: ChaveTrofeu;
  jogadorId: number;
  trajetoria: readonly EntradaLog[];
};

export type ResultadoNarrador = { status: "unavailable"; motivo: string };

/**
 * Momento 1 não fala com a rede. Momento 2 troca `narrar` pela Gemma 4
 * (Cloudflare Worker) e o Momento 3 troca `baixarTrofeu` pelo MP3 da ElevenLabs.
 * A interface permanece: o botão só habilita quando `disponivel` for verdadeiro.
 */
export type ServicoNarrador = {
  disponivel: boolean;
  motivoIndisponivel: string;
  narrar(pedido: PedidoNarracao): Promise<ResultadoNarrador>;
  baixarTrofeu(pedido: PedidoNarracao): Promise<ResultadoNarrador>;
};

export function criarNarradorLocal(): ServicoNarrador {
  const motivo = "narração em breve";
  const indisponivel = async (): Promise<ResultadoNarrador> => ({ status: "unavailable", motivo });
  return {
    disponivel: false,
    motivoIndisponivel: motivo,
    narrar: indisponivel,
    baixarTrofeu: indisponivel,
  };
}
