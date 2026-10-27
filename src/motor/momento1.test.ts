import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { casas } from "../data/casas.ts";
import { desserializarSave, serializarSave } from "../estado/save.ts";
import { criarRngComEstado, novoEstadoRng, rolar2D6 } from "./dado.ts";
import { getPlayerTrajectory } from "./log.ts";
import { criarNarradorLocal } from "../narrador/narrador.ts";
import {
  daEstadoSalvo,
  iniciarPartida,
  montarTelaEndgame,
  paraEstadoSalvo,
  registrarJogada,
  type EstadoPartida,
} from "./partida.ts";
import { ajustarQuantidade, clonarAssentos, confirmarAssentos, resumoAssentos } from "./setup.ts";

const doisAssentos = [
  { controle: "humano" as const, nome: "Ju" },
  { controle: "cpu" as const },
];

function avancar(estado: EstadoPartida, dado1: number, dado2: number) {
  return registrarJogada(estado, { dado1, dado2 }, casas);
}

function comCasa(estado: EstadoPartida, jogadorId: number, casa: number, projeto = estado.jogadores[jogadorId - 1].projeto): EstadoPartida {
  return {
    ...estado,
    jogadorAtivo: jogadorId,
    jogadores: estado.jogadores.map((jogador) => jogador.id === jogadorId ? { ...jogador, casa, projeto } : jogador),
  };
}

test("resumo e elenco nascem dos assentos confirmados", () => {
  const confirmado = confirmarAssentos(doisAssentos);
  assert.equal(confirmado.jogadores.length, 2);
  assert.deepEqual(confirmado.jogadores.map((jogador) => jogador.controle), ["humano", "cpu"]);
  assert.equal(confirmado.resumo, resumoAssentos(confirmado.assentos));
  assert.match(confirmado.resumo, /2 participantes · 1 HUMANO · 1 CPU · 2D6/);
  assert.doesNotMatch(confirmado.resumo, /3 participantes/);

  const doisHumanos = confirmarAssentos([
    { controle: "humano", nome: "Ju" },
    { controle: "humano", nome: "Ana" },
  ]);
  assert.equal(doisHumanos.jogadores.length, 2);
  assert.equal(doisHumanos.jogadores.filter((jogador) => jogador.controle === "cpu").length, 0);
  assert.match(doisHumanos.resumo, /2 participantes · 2 HUMANOS · 2D6/);
  assert.doesNotMatch(doisHumanos.resumo, /CPU/);
});

test("ajustar jogadores devolve o mesmo resumo dos assentos confirmados", () => {
  const confirmado = confirmarAssentos([
    { controle: "humano", nome: "Ju" },
    { controle: "cpu" },
    { controle: "humano", nome: "Ana" },
  ]);
  const reduzido = ajustarQuantidade(confirmado.assentos, 2);
  const deVolta = clonarAssentos(confirmado.assentos);
  assert.deepEqual(reduzido.map((assento) => assento.controle), ["humano", "cpu"]);
  assert.equal(confirmarAssentos(deVolta).resumo, confirmado.resumo);
  assert.deepEqual(confirmarAssentos(deVolta).jogadores.map((jogador) => jogador.nome), confirmado.jogadores.map((jogador) => jogador.nome));
});

test("o primeiro a entrar no ato leva o troféu e quem passa depois não leva", () => {
  let estado = iniciarPartida(doisAssentos, novoEstadoRng(7));
  assert.equal(estado.trofeus.act1?.jogadorId, 1);
  assert.equal(estado.trofeus.act10, null);

  estado = comCasa(estado, 1, 8);
  const primeiro = avancar(estado, 2, 2);
  assert.equal(primeiro.estado.jogadores[0].casa, 12);
  assert.ok(primeiro.entrada.casasPassadas.includes(10));
  assert.deepEqual(primeiro.entrada.atosEntrados, [10]);
  assert.deepEqual(primeiro.novosTrofeus, ["act10"]);
  assert.equal(primeiro.estado.trofeus.act10?.jogadorId, 1);

  const segundo = avancar(comCasa(primeiro.estado, 2, 8), 2, 2);
  assert.ok(segundo.entrada.casasPassadas.includes(10));
  assert.deepEqual(segundo.entrada.atosEntrados, [10]);
  assert.deepEqual(segundo.novosTrofeus, []);
  assert.equal(segundo.estado.trofeus.act10?.jogadorId, 1);
  assert.equal(segundo.estado.trofeus.act10?.caminho.at(-1)?.turno, primeiro.entrada.turno);
});

test("pular a casa do ato ainda entrega o troféu a quem entra primeiro", () => {
  let estado = iniciarPartida(doisAssentos, novoEstadoRng(7));
  estado = comCasa(estado, 1, 8);
  const pulo = avancar(estado, 3, 3);
  assert.notEqual(pulo.estado.jogadores[0].casa, 10);
  assert.equal(pulo.estado.trofeus.act10?.jogadorId, 1);
  assert.ok(pulo.entrada.casasPassadas.includes(10));
});

test("o endgame vai para quem chega à casa 40 mesmo sem troféu de ato", () => {
  let estado = iniciarPartida(doisAssentos, novoEstadoRng(7));
  estado = avancar(comCasa(estado, 1, 9), 1, 1).estado;
  estado = avancar(comCasa(estado, 1, 19), 1, 1).estado;
  estado = avancar(comCasa(estado, 1, 29), 1, 1).estado;
  assert.equal(estado.trofeus.act10?.jogadorId, 1);
  assert.equal(estado.trofeus.act20?.jogadorId, 1);
  assert.equal(estado.trofeus.act30?.jogadorId, 1);

  const vitoria = avancar(comCasa(estado, 2, 39, 70), 1, 1);
  assert.equal(vitoria.estado.partidaEncerrada, true);
  assert.equal(vitoria.estado.jogadores[1].casa, 40);
  assert.equal(vitoria.estado.jogadores[1].projeto, 80);
  assert.equal(vitoria.estado.trofeus.endgame?.jogadorId, 2);
  for (const chave of ["act1", "act10", "act20", "act30"] as const) {
    assert.notEqual(vitoria.estado.trofeus[chave]?.jogadorId, 2);
  }

  const tela = montarTelaEndgame(vitoria.estado);
  assert.ok(tela);
  assert.equal(tela.ativo, true);
  assert.equal(tela.vencedorNome, "CPU-1");
  assert.equal(tela.projeto, 80);
  assert.equal(tela.trajetoria[0].casaFinal, 1);
  assert.equal(tela.trajetoria.at(-1)?.vitoria, true);
  assert.deepEqual(tela.trajetoria.map((entrada) => entrada.turno), [...tela.trajetoria].sort((a, b) => a.turno - b.turno).map((entrada) => entrada.turno));
  assert.match(tela.narracao, /CPU-1/);
  assert.match(tela.narracao, /casa 1/);
  assert.equal(tela.ranking[0].id, 2);
});

test("o game log guarda cada lance e a trajetória filtra por jogador", () => {
  let estado = iniciarPartida(doisAssentos, novoEstadoRng(7));
  estado = avancar(estado, 1, 1).estado;
  estado = avancar(estado, 2, 2).estado;
  estado = avancar(estado, 1, 2).estado;
  const lances = estado.log.filter((entrada) => entrada.turno > 0);
  assert.equal(lances.length, 3);
  assert.deepEqual(lances.map((entrada) => entrada.turno), [1, 2, 3]);
  assert.deepEqual(lances.map((entrada) => entrada.jogadorId), [1, 2, 1]);
  for (const lance of lances) {
    assert.ok(lance.dado1 && lance.dado2);
    assert.ok(lance.casaOrigem >= 1 && lance.casaFinal <= 40);
    assert.ok(lance.casasPassadas.length >= 1);
    assert.equal(typeof lance.efeito, "string");
    assert.equal(typeof lance.deltaProjeto, "number");
  }
  const trajetoria = getPlayerTrajectory(estado.log, 1);
  assert.ok(trajetoria.every((entrada) => entrada.jogadorId === 1));
  assert.equal(trajetoria[0].casaFinal, 1);
  assert.deepEqual(trajetoria.map((entrada) => entrada.turno), [0, 1, 3]);
  assert.equal(getPlayerTrajectory(estado.log, 2).map((entrada) => entrada.turno).join(","), "0,2");
});

test("save e load preservam o log, os troféus, o RNG e a continuação", () => {
  let estado = iniciarPartida(doisAssentos, novoEstadoRng(1985));
  estado = avancar(comCasa(estado, 1, 8), 2, 2).estado;
  estado = avancar(estado, 3, 1).estado;
  const markdown = serializarSave(paraEstadoSalvo(estado));
  assert.match(markdown, /## Game Log/);
  assert.match(markdown, /## Trajetória · Ju/);
  const carregado = daEstadoSalvo(desserializarSave(markdown));
  assert.deepEqual(carregado.log, estado.log);
  assert.deepEqual(carregado.trofeus, estado.trofeus);
  assert.deepEqual(carregado.rng, estado.rng);
  assert.deepEqual(carregado.jogadores.map(({ nome, controle, casa, projeto }) => ({ nome, controle, casa, projeto })), estado.jogadores.map(({ nome, controle, casa, projeto }) => ({ nome, controle, casa, projeto })));
  assert.equal(carregado.jogadorAtivo, estado.jogadorAtivo);
  assert.equal(carregado.turno, estado.turno);

  const seguir = (partida: EstadoPartida) => {
    const rng = criarRngComEstado(partida.rng);
    const rolagem = rolar2D6(rng.aleatorio);
    return registrarJogada(
      { ...partida, rng: rng.snapshot() },
      { dado1: rolagem.dados[0].valor, dado2: rolagem.dados[1].valor },
      casas,
    );
  };
  const depoisDoSave = seguir(carregado);
  const semInterromper = seguir(estado);
  assert.deepEqual(
    [depoisDoSave.entrada.dado1, depoisDoSave.entrada.dado2, depoisDoSave.entrada.casaFinal],
    [semInterromper.entrada.dado1, semInterromper.entrada.dado2, semInterromper.entrada.casaFinal],
  );
});

test("nova partida zera placar, histórico e troféus", () => {
  let estado = iniciarPartida(doisAssentos, novoEstadoRng(3));
  estado = avancar(comCasa(estado, 1, 39, 90), 1, 1).estado;
  assert.equal(estado.partidaEncerrada, true);
  const nova = iniciarPartida(estado.assentos, novoEstadoRng(9));
  assert.equal(nova.partidaEncerrada, false);
  assert.equal(nova.partidaIniciada, true);
  assert.equal(nova.turno, 0);
  assert.equal(nova.trofeus.endgame, null);
  assert.equal(nova.trofeus.act10, null);
  assert.ok(nova.jogadores.every((jogador) => jogador.casa === 1 && jogador.projeto === 0));
  assert.equal(nova.log.filter((entrada) => entrada.turno > 0).length, 0);
  assert.equal(getPlayerTrajectory(nova.log, 1).length, 1);
  assert.notEqual(nova.rng.semente, estado.rng.semente);
});

test("o narrador local responde indisponível e não é a narração do tabuleiro", async () => {
  const narrador = criarNarradorLocal();
  assert.equal(narrador.disponivel, false);
  const pedido = { tipo: "endgame" as const, chave: "endgame" as const, jogadorId: 1, trajetoria: [] };
  assert.deepEqual(await narrador.narrar(pedido), { status: "unavailable", motivo: "narração em breve" });
  assert.deepEqual(await narrador.baixarTrofeu(pedido), { status: "unavailable", motivo: "narração em breve" });
});

test("o cursor do RNG retomado produz a mesma sequência", () => {
  const original = criarRngComEstado(novoEstadoRng(1985));
  original.aleatorio();
  original.aleatorio();
  const cursor = original.snapshot();
  const retomado = criarRngComEstado(cursor);
  const seguinte = criarRngComEstado(cursor);
  assert.equal(retomado.aleatorio(), seguinte.aleatorio());
  assert.equal(retomado.aleatorio(), seguinte.aleatorio());
});

test("a arte da casa 40 e o gravador entram no bundle por caminho relativo", () => {
  const fonte = readFileSync(new URL("../main.ts", import.meta.url), "utf8");
  for (const arquivo of ["assets/casa-40-endgame.webp", "assets/cassette-save-load.png"]) {
    assert.match(fonte, new RegExp(`\\./${arquivo}`));
    assert.equal(existsSync(new URL(`../../public/${arquivo}`, import.meta.url)), true);
  }
  assert.doesNotMatch(fonte, /OUVIR INTRO|btn-ouvir-intro/);
});
