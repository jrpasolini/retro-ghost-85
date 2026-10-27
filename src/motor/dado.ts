export type ResultadoDado = {
  valor: number;
  faces: number;
  timestamp: string;
};

export type GeradorAleatorio = () => number;

/**
 * Gerador determinístico baseado em Mulberry32 para testes e saves com semente (seed).
 */
export function criarRngSemente(semente: number): GeradorAleatorio {
  let s = semente >>> 0;
  return () => {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gerador de aleatoriedade padrão utilizando a Crypto API do navegador quando disponível,
 * garantindo aleatoriedade segura local sem chamadas externas ou IA.
 */
export const geradorPadrao: GeradorAleatorio = () => {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / 4294967296;
  }
  return Math.random();
};

/**
 * Executa o sorteio de um dado com o número de faces especificado (padrão 6 faces / 1d6).
 * Permite injeção de função geradora para testes unitários ou partidas determinísticas.
 */
export function rolarDado(faces = 6, rng: GeradorAleatorio = geradorPadrao): ResultadoDado {
  if (faces < 1 || !Number.isInteger(faces)) {
    throw new Error(`Número de faces inválido: ${faces}. Deve ser um número inteiro maior ou igual a 1.`);
  }

  const raw = rng();
  const clamped = Math.max(0, Math.min(0.9999999999, raw));
  const valor = Math.floor(clamped * faces) + 1;

  return {
    valor,
    faces,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Atalho semântico para rolagem do clássico 1d6 (1 a 6).
 */
export function rolarD6(rng?: GeradorAleatorio): ResultadoDado {
  return rolarDado(6, rng);
}

export function rolar2D6(rng: GeradorAleatorio = geradorPadrao): { dados: [ResultadoDado, ResultadoDado]; total: number } {
  const dados: [ResultadoDado, ResultadoDado] = [rolarD6(rng), rolarD6(rng)];
  return { dados, total: dados[0].valor + dados[1].valor };
}

/**
 * Ícones unicode clássicos para dados de 6 faces (1 a 6).
 */
export const GLIFOS_DADO: Record<number, string> = {
  1: "⚀",
  2: "⚁",
  3: "⚂",
  4: "⚃",
  5: "⚄",
  6: "⚅",
};

