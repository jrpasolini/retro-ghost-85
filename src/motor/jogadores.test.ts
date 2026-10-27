import test from "node:test";
import assert from "node:assert/strict";
import { criarJogadores, normalizarNome, turnoDaCpu } from "./jogadores.ts";

test("configura de um a quatro participantes humanos ou CPU", () => {
  const jogadores = criarJogadores([
    { controle: "humano", nome: "  Junior  " },
    { controle: "cpu" },
    { controle: "humano", nome: "Renata" },
  ]);
  assert.equal(jogadores.length, 3);
  assert.deepEqual(jogadores.map(({ nome, controle }) => ({ nome, controle })), [
    { nome: "Junior", controle: "humano" },
    { nome: "CPU-1", controle: "cpu" },
    { nome: "Renata", controle: "humano" },
  ]);
  assert.ok(jogadores.every((jogador) => jogador.casa === 1));
});

test("partida sempre exige um humano e CPU não joga sozinha", () => {
  assert.throws(() => criarJogadores([{ controle: "cpu" }]), /humano|dois participantes/);
  assert.throws(() => criarJogadores([{ controle: "cpu" }, { controle: "cpu" }]), /humano/);
});

test("turno automático só é liberado para CPU durante partida ativa", () => {
  const jogadores = criarJogadores([{ controle: "humano" }, { controle: "cpu" }]);
  assert.equal(turnoDaCpu(jogadores, 2, true, false), true);
  assert.equal(turnoDaCpu(jogadores, 1, true, false), false);
  assert.equal(turnoDaCpu(jogadores, 2, false, false), false);
  assert.equal(turnoDaCpu(jogadores, 2, true, true), false);
});

test("nome é limitado e recebe fallback quando vazio", () => {
  assert.equal(normalizarNome("   ", "Jogador 1"), "Jogador 1");
  assert.equal(normalizarNome("A".repeat(40), "X").length, 24);
});

