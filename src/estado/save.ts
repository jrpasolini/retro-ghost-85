import type { Jogador } from "../types";

export const SAVE_SCHEMA = 1;

export type JogadorSalvo = Pick<Jogador, "id" | "casa" | "projeto" | "turnosPerdidos" | "actsVisitados">;

export type EstadoSalvo = {
  schema: typeof SAVE_SCHEMA;
  jogadorAtivo: number;
  jogadorSelecionado: number;
  casaAtiva: number;
  atoMusical: number;
  partidaIniciada: boolean;
  partidaEncerrada: boolean;
  jogadores: JogadorSalvo[];
};

function inteiroEntre(valor: unknown, minimo: number, maximo: number): valor is number {
  return Number.isInteger(valor) && Number(valor) >= minimo && Number(valor) <= maximo;
}

export function validarEstadoSalvo(valor: unknown): EstadoSalvo {
  if (!valor || typeof valor !== "object") throw new Error("Save inválido");
  const estado = valor as Partial<EstadoSalvo>;
  if (estado.schema !== SAVE_SCHEMA) throw new Error("Versão de save incompatível");
  if (!Array.isArray(estado.jogadores) || estado.jogadores.length !== 4) throw new Error("O save precisa conter quatro jogadores");
  if (!inteiroEntre(estado.jogadorAtivo, 1, 4) || !inteiroEntre(estado.jogadorSelecionado, 1, 4)) throw new Error("Jogador inválido no save");
  if (!inteiroEntre(estado.casaAtiva, 1, 40) || !inteiroEntre(estado.atoMusical, 0, 4)) throw new Error("Posição inválida no save");
  if (estado.partidaIniciada === undefined) estado.partidaIniciada = true;
  if (typeof estado.partidaIniciada !== "boolean" || typeof estado.partidaEncerrada !== "boolean") throw new Error("Estado da partida inválido");

  const ids = new Set<number>();
  for (const jogador of estado.jogadores) {
    if (!jogador || !inteiroEntre(jogador.id, 1, 4) || ids.has(jogador.id)) throw new Error("ID de jogador inválido");
    ids.add(jogador.id);
    if (!inteiroEntre(jogador.casa, 1, 40) || !inteiroEntre(jogador.projeto, 0, 100) || !inteiroEntre(jogador.turnosPerdidos, 0, 99)) throw new Error("Progresso de jogador inválido");
    if (!Array.isArray(jogador.actsVisitados)) throw new Error("ACTS inválidos");
    jogador.actsVisitados = jogador.actsVisitados.map((casa) => casa === 40 ? 1 : casa);
    if (jogador.actsVisitados.some((casa) => ![1, 10, 20, 30].includes(casa))) throw new Error("ACTS inválidos");
  }
  return estado as EstadoSalvo;
}

export function serializarSave(estado: EstadoSalvo): string {
  const validado = validarEstadoSalvo(estado);
  const salvoEm = new Date().toISOString();
  return `---\nschema: ${SAVE_SCHEMA}\njogo: retro-ghost-85\nversao: 0.4.0\nsalvo_em: ${salvoEm}\n---\n\n# Retro Ghost 85 — save da partida\n\nEste arquivo pode ser carregado pelo botão PLAY do gravador no tabuleiro.\n\n\`\`\`json\n${JSON.stringify(validado, null, 2)}\n\`\`\`\n`;
}

export function desserializarSave(markdown: string): EstadoSalvo {
  if (markdown.length > 100_000) throw new Error("Arquivo de save muito grande");
  const bloco = markdown.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!bloco) throw new Error("Bloco JSON do save não encontrado");
  try {
    return validarEstadoSalvo(JSON.parse(bloco[1]));
  } catch (erro) {
    if (erro instanceof Error) throw erro;
    throw new Error("Não foi possível ler o save");
  }
}

