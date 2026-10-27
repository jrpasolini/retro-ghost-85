import test from "node:test";
import assert from "node:assert/strict";
import { atoDaCasa, maiorAtoAlcancado, proximaTrilha } from "./trilha.ts";

test("casas de marco ativam os quatro atos", () => {
  assert.deepEqual([40, 10, 20, 30].map(atoDaCasa), [1, 2, 3, 4]);
  assert.equal(atoDaCasa(15), null);
});

test("primeiro jogador a alcançar um ato avança a trilha global", () => {
  assert.equal(maiorAtoAlcancado([[40], [40, 10, 20], [40], [40, 10]]), 3);
  assert.equal(proximaTrilha(2, 3), "act-3");
  assert.equal(proximaTrilha(3, 2), "act-3");
});

test("vitória sempre seleciona a faixa de encerramento", () => {
  assert.equal(proximaTrilha(4, 4, true), "endgame");
});

