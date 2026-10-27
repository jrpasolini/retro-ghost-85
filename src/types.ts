export type TipoCasa = "marco" | "evento" | "fatalidade" | "escolha" | "final";

export type Casa = {
  id: number;
  titulo: string;
  tipo: TipoCasa;
  efeito: string;
  narrativa: string;
  consequencia: {
    projeto?: number;
    movimento?: number;
    perdeTurno?: boolean;
    jogadaExtra?: boolean;
  };
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Jogador = {
  id: number;
  nome: string;
  controle: "humano" | "cpu";
  cor: string;
  imagem: string;
  casa: number;
  projeto: number;
  turnosPerdidos: number;
  actsVisitados: number[];
};

