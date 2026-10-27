import test from "node:test";
import assert from "node:assert/strict";
import { casas } from "../data/casas.ts";
import type { Jogador } from "../types";
import { aplicarJogada } from "./tabuleiro.ts";
import { avancarTurno, podeIniciarJogada, proximoJogadorId } from "./turnos.ts";

const jogador = (casa: number, projeto = 0): Jogador => ({
  id: 1, nome: "Teste", cor: "#fff", imagem: "", casa, projeto, turnosPerdidos: 0, actsVisitados: [40],
});

test("dois dados no ACT 1 podem alcançar as casas 1 e 2", () => {
  const r = aplicarJogada(jogador(40), 2, casas);
  assert.equal(r.casa.id, 1);
  assert.equal(r.jogador.casa, 1);
  assert.deepEqual(r.jogador.actsVisitados, [40]);
  assert.equal(r.easterEggDesbloqueado, false);
  assert.equal(aplicarJogada(jogador(40), 3, casas).casa.id, 2);
});

test("Einstein aparece só quando um mesmo jogador completa os quatro ACTs", () => {
  const primeiro = aplicarJogada(jogador(9), 1, casas);
  assert.deepEqual(primeiro.jogador.actsVisitados, [40, 10]);
  const segundo = aplicarJogada({ ...primeiro.jogador, casa: 19 }, 1, casas);
  assert.deepEqual(segundo.jogador.actsVisitados, [40, 10, 20]);
  assert.equal(segundo.easterEggDesbloqueado, false);

  const outroJogador = aplicarJogada({ ...jogador(29), id: 2 }, 1, casas);
  assert.deepEqual(outroJogador.jogador.actsVisitados, [40, 30]);
  assert.equal(outroJogador.easterEggDesbloqueado, false);

  const terceiro = aplicarJogada({ ...segundo.jogador, casa: 29 }, 1, casas);
  assert.deepEqual(terceiro.jogador.actsVisitados, [40, 10, 20, 30]);
  assert.equal(terceiro.easterEggDesbloqueado, true);
  assert.equal(aplicarJogada({ ...terceiro.jogador, casa: 29 }, 1, casas).easterEggDesbloqueado, false);
});

test("disquete bom da casa 2 avança e pontua; efeito não encadeia", () => {
  const r = aplicarJogada(jogador(1), 1, casas);
  assert.equal(r.casa.id, 2);
  assert.equal(r.jogador.casa, 3);
  assert.equal(r.jogador.projeto, 18);
});

test("disquete defeituoso da casa 27 recua e projeto nunca fica negativo", () => {
  const r = aplicarJogada(jogador(26), 1, casas);
  assert.equal(r.casa.id, 27);
  assert.equal(r.jogador.casa, 25);
  assert.equal(r.jogador.projeto, 0);
});

test("bug da casa 15 impõe penalidade", () => {
  const r = aplicarJogada(jogador(14, 40), 1, casas);
  assert.equal(r.jogador.casa, 13);
  assert.equal(r.jogador.projeto, 24);
});

test("casa 4 concede nova jogada e casa 17 marca um turno perdido", () => {
  const bonus = aplicarJogada(jogador(3), 1, casas);
  assert.equal(bonus.jogadaExtra, true);
  assert.equal(bonus.jogador.projeto, 22);

  const penalidade = aplicarJogada(jogador(16, 30), 1, casas);
  assert.equal(penalidade.jogador.projeto, 16);
  assert.equal(penalidade.jogador.turnosPerdidos, 1);
});

test("casa 40 exige 100 projeto e devolve à 30 em caso contrário", () => {
  assert.equal(aplicarJogada(jogador(39, 80), 2, casas).jogador.casa, 30);
  const vencedor = aplicarJogada(jogador(39, 90), 2, casas);
  assert.equal(vencedor.venceu, true);
  assert.equal(vencedor.jogador.casa, 40);
});

test("rotação local percorre os quatro jogadores e retorna ao primeiro", () => {
  const jogadores = [1, 2, 3, 4].map((id) => ({ ...jogador(40), id, nome: `P${id}` }));
  assert.equal(proximoJogadorId(1, 4), 2);
  assert.equal(proximoJogadorId(4, 4), 1);
  const resultado = avancarTurno(jogadores, 4);
  assert.equal(resultado.jogadorAtivo, 1);
  assert.deepEqual(resultado.ignorados, []);
});

test("rotação pula jogadores com turno perdido e consome uma penalidade", () => {
  const jogadores = [1, 2, 3, 4].map((id) => ({ ...jogador(40), id, nome: `P${id}` }));
  jogadores[1].turnosPerdidos = 1;
  jogadores[2].turnosPerdidos = 2;
  const resultado = avancarTurno(jogadores, 1);
  assert.equal(resultado.jogadorAtivo, 4);
  assert.deepEqual(resultado.ignorados, ["P2", "P3"]);
  assert.equal(resultado.jogadores[1].turnosPerdidos, 0);
  assert.equal(resultado.jogadores[2].turnosPerdidos, 1);
});

test("jogada extra mantém o mesmo jogador e vitória encerra novas jogadas", () => {
  const extra = aplicarJogada(jogador(3), 1, casas);
  assert.equal(extra.jogadaExtra, true);
  assert.equal(proximoJogadorId(1, 4), 2);
  assert.equal(podeIniciarJogada(false, false), true);
  assert.equal(podeIniciarJogada(false, true), false);
  assert.equal(podeIniciarJogada(true, false), false);
});

