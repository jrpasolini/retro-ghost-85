export type ResultadoDado = {
  valor: number;
  faces: number;
  timestamp: string;
};

export type GeradorAleatorio = () => number;

/**
 * Gerador determinístico baseado em Mulberry32 para testes e saves com semente (seed).
 */
export type EstadoRng = { semente: number; estado: number };

function passoMulberry(estado: number): { valor: number; estado: number } {
  // O acumulador não é reduzido a 32 bits: os shifts é que aplicam ToUint32.
  // Gravar o acumulador inteiro permite retomar a mesma sequência depois do save.
  let t = estado + 0x6d2b79f5;
  const proximo = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { valor: ((t ^ (t >>> 14)) >>> 0) / 4294967296, estado: proximo };
}

export function criarRngSemente(semente: number): GeradorAleatorio {
  let s = semente >>> 0;
  return () => {
    const passo = passoMulberry(s);
    s = passo.estado;
    return passo.valor;
  };
}

/** RNG da partida: a semente nasce uma vez e `estado` é o cursor gravado no save. */
export function criarRngComEstado(inicial: EstadoRng): { aleatorio: GeradorAleatorio; snapshot: () => EstadoRng } {
  let s = inicial.estado;
  const semente = inicial.semente >>> 0;
  return {
    aleatorio: () => {
      const passo = passoMulberry(s);
      s = passo.estado;
      return passo.valor;
    },
    snapshot: () => ({ semente, estado: s }),
  };
}

export function novoEstadoRng(semente?: number): EstadoRng {
  if (semente !== undefined) {
    const valor = semente >>> 0;
    return { semente: valor, estado: valor };
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return { semente: array[0], estado: array[0] };
  }
  const valor = Math.floor(Math.random() * 0x100000000) >>> 0;
  return { semente: valor, estado: valor };
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

