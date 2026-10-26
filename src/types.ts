export type TipoCasa = "marco" | "evento" | "fatalidade" | "escolha" | "final";

export type Casa = {
  id: number;
  titulo: string;
  tipo: TipoCasa;
  efeito: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Jogador = {
  id: number;
  nome: string;
  cor: string;
  imagem: string;
  casa: number;
};
