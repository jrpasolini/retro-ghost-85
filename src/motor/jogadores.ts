import type { Jogador } from "../types";

export type ConfiguracaoJogador = {
  controle: Jogador["controle"];
  nome?: string;
};

const aparencias = [
  { cor: "#54f5c2", imagem: "./assets/player-1.webp" },
  { cor: "#ffd365", imagem: "./assets/player-2.webp" },
  { cor: "#48d8ff", imagem: "./assets/player-3.webp" },
  { cor: "#ff68bc", imagem: "./assets/player-4.webp" },
] as const;

export function normalizarNome(nome: string | undefined, fallback: string): string {
  const limpo = (nome ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
  return limpo || fallback;
}

export function criarJogadores(configuracoes: ConfiguracaoJogador[]): Jogador[] {
  if (configuracoes.length < 1 || configuracoes.length > 4) throw new Error("A partida precisa de 1 a 4 participantes");
  if (!configuracoes.some((item) => item.controle === "humano")) throw new Error("A partida precisa de pelo menos um jogador humano");
  if (configuracoes.length === 1 && configuracoes[0].controle === "cpu") throw new Error("O modo CPU exige pelo menos dois participantes");

  let numeroCpu = 0;
  return configuracoes.map((configuracao, index) => {
    if (configuracao.controle !== "humano" && configuracao.controle !== "cpu") throw new Error("Tipo de controle inválido");
    if (configuracao.controle === "cpu") numeroCpu += 1;
    const fallback = configuracao.controle === "cpu" ? `CPU-${numeroCpu}` : `Jogador ${index + 1}`;
    return {
      id: index + 1,
      nome: normalizarNome(configuracao.nome, fallback),
      controle: configuracao.controle,
      ...aparencias[index],
      casa: 1,
      projeto: 0,
      turnosPerdidos: 0,
      actsVisitados: [1],
    };
  });
}

export function turnoDaCpu(jogadores: Jogador[], jogadorAtivo: number, partidaIniciada: boolean, partidaEncerrada: boolean): boolean {
  return partidaIniciada && !partidaEncerrada && jogadores[jogadorAtivo - 1]?.controle === "cpu";
}

