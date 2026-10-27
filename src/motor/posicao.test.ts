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
