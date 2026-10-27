import type { Jogador } from "../types";
import { formatarGameLogMarkdown, formatarTrajetoriaMarkdown, getPlayerTrajectory, trofeusVazios, CHAVES_TROFEU, type ChaveTrofeu, type EntradaLog, type Trofeu, type Trofeus } from "../motor/log.ts";
import type { EstadoRng } from "../motor/dado.ts";

export const SAVE_SCHEMA = 1;

export type JogadorSalvo = Pick<Jogador, "id" | "casa" | "projeto" | "turnosPerdidos" | "actsVisitados">
  & Partial<Pick<Jogador, "nome" | "controle">>;

export type EstadoSalvo = {
  schema: typeof SAVE_SCHEMA;
  jogadorAtivo: number;
  jogadorSelecionado: number;
  casaAtiva: number;
  atoMusical: number;
  partidaIniciada: boolean;
  partidaEncerrada: boolean;
  turno: number;
  rng: EstadoRng | null;
  log: EntradaLog[];
  trofeus: Trofeus;
  jogadores: JogadorSalvo[];
};

function inteiroEntre(valor: unknown, minimo: number, maximo: number): valor is number {
  return Number.isInteger(valor) && Number(valor) >= minimo && Number(valor) <= maximo;
}

function validarEntrada(valor: unknown): EntradaLog {
  if (!valor || typeof valor !== "object") throw new Error("Lance do game log inválido");
  const entrada = valor as Partial<EntradaLog>;
  if (!inteiroEntre(entrada.turno, 0, 999) || !inteiroEntre(entrada.jogadorId, 1, 4)) throw new Error("Lance do game log inválido");
  if (typeof entrada.jogador !== "string" || !entrada.jogador.trim()) throw new Error("Lance do game log inválido");
  if (entrada.controle !== "humano" && entrada.controle !== "cpu") throw new Error("Lance do game log inválido");
  if (typeof entrada.cor !== "string") throw new Error("Lance do game log inválido");
  if (entrada.dado1 !== null && !inteiroEntre(entrada.dado1, 1, 6)) throw new Error("Lance do game log inválido");
  if (entrada.dado2 !== null && !inteiroEntre(entrada.dado2, 1, 6)) throw new Error("Lance do game log inválido");
  if (!inteiroEntre(entrada.casaOrigem, 1, 40) || !inteiroEntre(entrada.casaDestino, 1, 40) || !inteiroEntre(entrada.casaFinal, 1, 40)) throw new Error("Lance do game log inválido");
  if (!Array.isArray(entrada.casasPassadas) || !Array.isArray(entrada.atosEntrados) || !Array.isArray(entrada.perderamVez) || !Array.isArray(entrada.trofeus)) throw new Error("Lance do game log inválido");
  if (typeof entrada.efeito !== "string" || !inteiroEntre(entrada.deltaProjeto, -100, 100) || !inteiroEntre(entrada.projeto, 0, 100)) throw new Error("Lance do game log inválido");
  if (typeof entrada.jogadaExtra !== "boolean" || typeof entrada.perdeTurno !== "boolean" || typeof entrada.vitoria !== "boolean") throw new Error("Lance do game log inválido");
  const informados = (entrada.trofeus as readonly string[]).filter((chave) => chave !== "act1");
  const trofeus = informados.filter((chave): chave is ChaveTrofeu => (CHAVES_TROFEU as readonly string[]).includes(chave));
  if (trofeus.length !== informados.length) throw new Error("Troféu inválido no game log");
  return {
    turno: entrada.turno,
    jogadorId: entrada.jogadorId,
    jogador: entrada.jogador.trim().replace(/\s+/g, " ").slice(0, 24),
    controle: entrada.controle,
    cor: entrada.cor.slice(0, 32),
    dado1: entrada.dado1 ?? null,
    dado2: entrada.dado2 ?? null,
    casaOrigem: entrada.casaOrigem,
    casaDestino: entrada.casaDestino,
    casaFinal: entrada.casaFinal,
    casasPassadas: entrada.casasPassadas.filter((casa) => inteiroEntre(casa, 1, 40)),
    atosEntrados: entrada.atosEntrados.filter((casa) => [1, 10, 20, 30].includes(casa)),
    efeito: entrada.efeito.slice(0, 180),
    deltaProjeto: entrada.deltaProjeto,
    projeto: entrada.projeto,
    jogadaExtra: entrada.jogadaExtra,
    perdeTurno: entrada.perdeTurno,
    perderamVez: entrada.perderamVez.filter((nome): nome is string => typeof nome === "string").map((nome) => nome.slice(0, 24)),
    trofeus,
    vitoria: entrada.vitoria,
  };
}

function validarTrofeu(valor: unknown): Trofeu | null {
  if (valor === null || valor === undefined) return null;
  if (!valor || typeof valor !== "object") throw new Error("Troféu inválido");
  const trofeu = valor as Partial<Trofeu>;
  if (!inteiroEntre(trofeu.jogadorId, 1, 4) || !inteiroEntre(trofeu.turno, 0, 999) || !Array.isArray(trofeu.caminho)) throw new Error("Troféu inválido");
  return { jogadorId: trofeu.jogadorId, turno: trofeu.turno, caminho: trofeu.caminho.map(validarEntrada) };
}

export function validarEstadoSalvo(valor: unknown): EstadoSalvo {
  if (!valor || typeof valor !== "object") throw new Error("Save inválido");
  const estado = valor as Partial<EstadoSalvo>;
  if (estado.schema !== SAVE_SCHEMA) throw new Error("Versão de save incompatível");
  if (!Array.isArray(estado.jogadores) || estado.jogadores.length < 1 || estado.jogadores.length > 4) throw new Error("O save precisa conter de um a quatro jogadores");
  if (!inteiroEntre(estado.jogadorAtivo, 1, estado.jogadores.length) || !inteiroEntre(estado.jogadorSelecionado, 1, estado.jogadores.length)) throw new Error("Jogador inválido no save");
  if (!inteiroEntre(estado.casaAtiva, 1, 40) || !inteiroEntre(estado.atoMusical, 0, 4)) throw new Error("Posição inválida no save");
  if (estado.partidaIniciada === undefined) estado.partidaIniciada = true;
  if (typeof estado.partidaIniciada !== "boolean" || typeof estado.partidaEncerrada !== "boolean") throw new Error("Estado da partida inválido");
  if (estado.turno === undefined) estado.turno = 0;
  if (!inteiroEntre(estado.turno, 0, 999)) throw new Error("Turno inválido no save");

  const ids = new Set<number>();
  for (const jogador of estado.jogadores) {
    if (!jogador || !inteiroEntre(jogador.id, 1, 4) || ids.has(jogador.id)) throw new Error("ID de jogador inválido");
    ids.add(jogador.id);
    if (jogador.controle === undefined) jogador.controle = "humano";
    if (jogador.controle !== "humano" && jogador.controle !== "cpu") throw new Error("Controle de jogador inválido");
    if (jogador.nome === undefined) jogador.nome = jogador.controle === "cpu" ? `CPU-${jogador.id}` : `Jogador ${jogador.id}`;
    jogador.nome = jogador.nome.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!jogador.nome) throw new Error("Nome de jogador inválido");
    if (!inteiroEntre(jogador.casa, 1, 40) || !inteiroEntre(jogador.projeto, 0, 100) || !inteiroEntre(jogador.turnosPerdidos, 0, 99)) throw new Error("Progresso de jogador inválido");
    if (!Array.isArray(jogador.actsVisitados)) throw new Error("ACTS inválidos");
    jogador.actsVisitados = jogador.actsVisitados.map((casa) => casa === 40 ? 1 : casa);
    if (jogador.actsVisitados.some((casa) => ![1, 10, 20, 30].includes(casa))) throw new Error("ACTS inválidos");
  }

  const log = Array.isArray(estado.log) ? estado.log.map(validarEntrada) : [];
  const gravados = (estado.trofeus ?? {}) as Partial<Trofeus>;
  const trofeus = estado.trofeus ? {
    act10: validarTrofeu(gravados.act10),
    act20: validarTrofeu(gravados.act20),
    act30: validarTrofeu(gravados.act30),
    endgame: validarTrofeu(gravados.endgame),
  } : trofeusVazios();
  let rng: EstadoRng | null = null;
  if (estado.rng) {
    if (!inteiroEntre(estado.rng.semente, 0, 0xffffffff) || typeof estado.rng.estado !== "number" || !Number.isSafeInteger(estado.rng.estado) || estado.rng.estado < 0) {
      throw new Error("Estado do RNG inválido");
    }
    rng = { semente: estado.rng.semente, estado: estado.rng.estado };
  }

  return {
    schema: SAVE_SCHEMA,
    jogadorAtivo: estado.jogadorAtivo,
    jogadorSelecionado: estado.jogadorSelecionado,
    casaAtiva: estado.casaAtiva,
    atoMusical: estado.atoMusical,
    partidaIniciada: estado.partidaIniciada,
    partidaEncerrada: estado.partidaEncerrada,
    turno: estado.turno,
    rng,
    log,
    trofeus,
    jogadores: estado.jogadores,
  };
}

export function serializarSave(estado: EstadoSalvo): string {
  const validado = validarEstadoSalvo(estado);
  const salvoEm = new Date().toISOString();
  const trajetos = validado.jogadores.map((jogador) => formatarTrajetoriaMarkdown(
    jogador.nome ?? `Jogador ${jogador.id}`,
    getPlayerTrajectory(validado.log, jogador.id),
  )).join("\n\n");
  return `---\nschema: ${SAVE_SCHEMA}\njogo: retro-ghost-85\nversao: 0.6.0\nsalvo_em: ${salvoEm}\n---\n\n# Retro Ghost 85 — save da partida\n\nO bloco JSON é a fonte da verdade. O Game Log e as trajetórias abaixo são a leitura humana do mesmo histórico.\n\n## Game Log\n\n${formatarGameLogMarkdown(validado.log)}\n\n${trajetos}\n\n\`\`\`json\n${JSON.stringify(validado, null, 2)}\n\`\`\`\n`;
}

export function desserializarSave(markdown: string): EstadoSalvo {
  if (markdown.length > 500_000) throw new Error("Arquivo de save muito grande");
  const bloco = markdown.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!bloco) throw new Error("Bloco JSON do save não encontrado");
  try {
    return validarEstadoSalvo(JSON.parse(bloco[1]));
  } catch (erro) {
    if (erro instanceof Error) throw erro;
    throw new Error("Não foi possível ler o save");
  }
}
