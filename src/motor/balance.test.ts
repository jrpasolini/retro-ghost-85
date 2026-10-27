import test from "node:test";
import assert from "node:assert/strict";
import { casas } from "../data/casas.ts";
import { criarRngSemente } from "./dado.ts";
import { aplicarJogada } from "./tabuleiro.ts";
import type { Jogador } from "../types";

test("partidas simuladas chegam à publicação sem ficar presas no trecho final", () => {
  const rng = criarRngSemente(1985);
  let vitoriasAte15 = 0;
  let vitoriasAte30 = 0;

  for (let partida = 0; partida < 10_000; partida++) {
    let jogador: Jogador = {
      id: 1, nome: "Teste", controle: "humano", cor: "", imagem: "", casa: 1, projeto: 0, turnosPerdidos: 0, actsVisitados: [1],
    };
    for (let turno = 1; turno <= 30; turno++) {
      const dado = 1 + Math.floor(rng() * 6);
      const resultado = aplicarJogada(jogador, dado, casas);
      jogador = resultado.jogador;
      if (resultado.venceu) {
        vitoriasAte30++;
        if (turno <= 15) vitoriasAte15++;
        break;
      }
    }
  }

  assert.ok(vitoriasAte15 >= 5_000, `Vitórias em até 15 lançamentos: ${vitoriasAte15}`);
  assert.ok(vitoriasAte30 >= 9_500, `Vitórias em até 30 lançamentos: ${vitoriasAte30}`);
});

