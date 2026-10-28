import test from "node:test";
import assert from "node:assert/strict";
import { casas } from "../data/casas.ts";
import { novoEstadoRng } from "./dado.ts";
import { consumirTurnoPerdidoSolo, daEstadoSalvo, iniciarPartida, montarTelaEndgame, paraEstadoSalvo, registrarJogada } from "./partida.ts";
import { formatarLinhaLog, textoMestre } from "./log.ts";
import { desserializarSave, serializarSave } from "../estado/save.ts";

function partidaSolo() {
  return iniciarPartida([{ controle: "humano" as const, nome: "Alex" }], novoEstadoRng(1985));
}

test("solo: casa 17 cria penalidade pendente, não a apaga na própria rotação", () => {
  const inicial = partidaSolo();
  const preparada = {
    ...inicial,
    jogadores: inicial.jogadores.map((jogador) => ({ ...jogador, casa: 16, projeto: 50 })),
  };
  const resultado = registrarJogada(preparada, { dado: 1 }, casas);
  assert.equal(resultado.estado.jogadores[0].casa, 17);
  assert.equal(resultado.estado.jogadores[0].turnosPerdidos, 1);
  assert.deepEqual(resultado.ignorados, []);
  assert.equal(resultado.estado.jogadorAtivo, 1);
  assert.equal(resultado.entrada.perdeTurno, true);
  assert.throws(() => registrarJogada(resultado.estado, { dado: 2 }, casas), /passe o turno/);
});

test("solo: passar turno sem dado preserva projeto, posição, música, RNG e loga a perda", () => {
  const inicial = partidaSolo();
  const preparada = {
    ...inicial,
    jogadores: inicial.jogadores.map((jogador) => ({ ...jogador, casa: 16, projeto: 50 })),
  };
  const penalizada = registrarJogada(preparada, { dado: 1 }, casas).estado;
  const cumprida = consumirTurnoPerdidoSolo(penalizada);
  assert.equal(cumprida.jogadores[0].turnosPerdidos, 0);
  assert.equal(cumprida.jogadores[0].casa, 17);
  assert.equal(cumprida.jogadores[0].projeto, penalizada.jogadores[0].projeto);
  assert.equal(cumprida.atoMusical, penalizada.atoMusical);
  assert.deepEqual(cumprida.rng, penalizada.rng);
  assert.equal(cumprida.turno, penalizada.turno + 1);
  const registro = cumprida.log.at(-1)!;
  assert.equal(registro.dado1, null);
  assert.equal(registro.dado2, null);
  assert.deepEqual(registro.perderamVez, ["Alex"]);
  assert.match(formatarLinhaLog(registro), /TURNO PERDIDO · sem rolagem/);
  assert.doesNotMatch(formatarLinhaLog(registro), /DADO null/);
  assert.match(textoMestre(cumprida.log, "Alex"), /cumpriu a penalidade sem rolar o dado/);
  assert.throws(() => consumirTurnoPerdidoSolo(cumprida), /Não há jogada perdida/);
  const posterior = registrarJogada(cumprida, { dado: 1 }, casas);
  assert.equal(posterior.entrada.dado1, 1);
  assert.equal(posterior.entrada.casaOrigem, 17);
});

test("solo: penalidade ainda pendente sobrevive ao save/load Markdown schema 1", () => {
  const inicial = partidaSolo();
  const preparada = { ...inicial, jogadores: [{ ...inicial.jogadores[0], casa: 22, projeto: 30 }] };
  const penalizada = registrarJogada(preparada, { dado: 1 }, casas).estado; // casa 23
  assert.equal(penalizada.jogadores[0].turnosPerdidos, 1);
  const markdown = serializarSave(paraEstadoSalvo(penalizada));
  const retomada = daEstadoSalvo(desserializarSave(markdown));
  assert.equal(retomada.jogadores[0].turnosPerdidos, 1);
  assert.deepEqual(retomada.rng, penalizada.rng);
  assert.throws(() => registrarJogada(retomada, { dado: 2 }, casas), /passe o turno/);
  const cumprida = consumirTurnoPerdidoSolo(retomada);
  const segundaRetomada = daEstadoSalvo(desserializarSave(serializarSave(paraEstadoSalvo(cumprida))));
  assert.equal(segundaRetomada.jogadores[0].turnosPerdidos, 0);
  assert.equal(segundaRetomada.log.at(-1)?.dado1, null);
  assert.deepEqual(segundaRetomada.rng, penalizada.rng);
  registrarJogada(segundaRetomada, { dado: 1 }, casas);
});

test("solo: endgame conta rolagens e não conta o turno perdido como dado", () => {
  const inicial = partidaSolo();
  const preparada = { ...inicial, jogadores: [{ ...inicial.jogadores[0], casa: 16, projeto: 50 }] };
  const aposPenalidade = registrarJogada(preparada, { dado: 1 }, casas).estado;
  const aposPulo = consumirTurnoPerdidoSolo(aposPenalidade);
  const naUltima = { ...aposPulo, jogadores: [{ ...aposPulo.jogadores[0], casa: 39 }] };
  const venceu = registrarJogada(naUltima, { dado: 1 }, casas).estado;
  const tela = montarTelaEndgame(venceu);
  assert.ok(tela);
  assert.equal(tela.rolamentosMesa, 2);
  assert.equal(tela.rolamentosVencedor, 2);
  assert.equal(venceu.turno, 3);
  assert.match(tela.narracao, /cumpriu a penalidade sem rolar o dado/);
  assert.doesNotMatch(tela.narracao, /tirou null/);
});

test("duas pessoas: penalidade continua sendo consumida automaticamente pela rotação", () => {
  const partida = iniciarPartida([
    { controle: "humano", nome: "Alex" },
    { controle: "humano", nome: "Bia" },
  ], novoEstadoRng(1985));
  const preparada = {
    ...partida,
    jogadores: [{ ...partida.jogadores[0], casa: 16 }, partida.jogadores[1]],
  };
  const penalizada = registrarJogada(preparada, { dado: 1 }, casas).estado;
  assert.equal(penalizada.jogadorAtivo, 2);
  assert.equal(penalizada.jogadores[0].turnosPerdidos, 1);
  const rodou = registrarJogada(penalizada, { dado: 1 }, casas);
  assert.equal(rodou.estado.jogadorAtivo, 2);
  assert.equal(rodou.estado.jogadores[0].turnosPerdidos, 0);
  assert.deepEqual(rodou.ignorados, ["Alex"]);
  assert.throws(() => consumirTurnoPerdidoSolo(rodou.estado), /Só uma partida solo/);
});
