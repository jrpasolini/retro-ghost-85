import test from "node:test";
import assert from "node:assert/strict";
import { casas } from "../data/casas.ts";
import { posicaoDaPeca } from "./posicao.ts";

test("sprites ficam centralizadas ou distribuídas dentro das 40 casas", () => {
  for (const casa of casas) {
    for (let total = 1; total <= 4; total++) {
      for (let indice = 0; indice < total; indice++) {
        const posicao = posicaoDaPeca(casa, indice, total);
        assert.ok(posicao.x > casa.x && posicao.x < casa.x + casa.width, `X fora da casa ${casa.id}`);
        assert.ok(posicao.y > casa.y && posicao.y < casa.y + casa.height, `Y fora da casa ${casa.id}`);
      }
    }
  }
});

test("uma peça fica no centro visual das casas da faixa inferior", () => {
  const centrosEsperados = new Map([
    [21, 78.85], [22, 71.85], [23, 64.05], [24, 56.35], [25, 49.2],
    [26, 42.5], [27, 36.05], [28, 29.75], [29, 22.85],
  ]);

  for (const [casaId, centroX] of centrosEsperados) {
    const posicao = posicaoDaPeca(casas[casaId - 1], 0, 1);
    assert.ok(Math.abs(posicao.x - centroX) < 0.06, `Centro X incorreto na casa ${casaId}`);
    assert.ok(Math.abs(posicao.y - 82.5) < 0.01, `Centro Y incorreto na casa ${casaId}`);
  }
});
