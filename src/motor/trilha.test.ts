import test from "node:test";
import assert from "node:assert/strict";
import { atoDaCasa, atoDaPosicao, maiorAtoAlcancado, proximaTrilha, trilhaDeveRepetir } from "./trilha.ts";

test("casas de marco ativam os quatro atos", () => {
  assert.deepEqual([1, 10, 20, 30].map(atoDaCasa), [1, 2, 3, 4]);
  assert.equal(atoDaCasa(15), null);
});

test("primeiro jogador a alcançar um ato avança a trilha global", () => {
  assert.equal(maiorAtoAlcancado([[1], [1, 10, 20], [1], [1, 10]]), 3);
  assert.equal(proximaTrilha(2, 3), "act-3");
  assert.equal(proximaTrilha(3, 2), "act-3");
});

test("entrar na faixa do ato ativa a trilha mesmo sem parar no marco", () => {
  assert.equal(atoDaPosicao(9), 1);
  assert.equal(atoDaPosicao(11), 2);
  assert.equal(atoDaPosicao(24), 3);
  assert.equal(atoDaPosicao(39), 4);
});

test("faixas dos atos repetem e congratulations toca uma única vez", () => {
  assert.equal(trilhaDeveRepetir("intro"), true);
  assert.equal(trilhaDeveRepetir("act-1"), true);
  assert.equal(trilhaDeveRepetir("act-4"), true);
  assert.equal(trilhaDeveRepetir("endgame"), false);
});

test("vitória sempre seleciona a faixa de encerramento", () => {
  assert.equal(proximaTrilha(4, 4, true), "endgame");
});

