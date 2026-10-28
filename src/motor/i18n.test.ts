import test from "node:test";
import assert from "node:assert/strict";
import { casas } from "../data/casas.ts";
import { atos } from "../data/atos.ts";
import { prologo } from "../data/intro.ts";
import { casasEn, atosEn, localizarCasa, localizarAto, prologoEn, textoTipo, tituloTrofeu, efeitoDeEntrada } from "../i18n/content.ts";
import { idiomaGuardado, type Idioma } from "../i18n/content.ts";
import { ui, textoDado, textoJogador, nomeScore } from "../i18n/ui.ts";
import { novoEstadoRng } from "./dado.ts";
import { iniciarPartida, registrarJogada, paraEstadoSalvo, montarTelaEndgame } from "./partida.ts";
import { formatarLinhaLog, formatarGameLogMarkdown, textoMestre } from "./log.ts";
import { desserializarSave, serializarSave } from "../estado/save.ts";

test("all 40 localized squares keep canonical mechanics and coordinates", () => {
  assert.equal(casasEn.length, 40);
  assert.equal(casas.length, 40);
  for (const casa of casas) {
    const translated = localizarCasa(casa, "en-US");
    assert.equal(localizarCasa(casa, "pt-BR"), casa);
    assert.notEqual(translated, casa);
    assert.notEqual(translated.titulo, casa.titulo);
    assert.notEqual(translated.narrativa, casa.narrativa);
    assert.ok(translated.narrativa.length > 65);
    assert.deepEqual(
      [translated.id, translated.tipo, translated.consequencia, translated.x, translated.y, translated.width, translated.height],
      [casa.id, casa.tipo, casa.consequencia, casa.x, casa.y, casa.width, casa.height],
    );
    assert.match(translated.efeito, /progress|First inspiration/);
    assert.doesNotMatch(translated.efeito, /projeto|casa|jogada/);
  }
});

test("prologue and four acts are distinct in both languages", () => {
  assert.equal(prologo.paragrafos.length, 3);
  assert.equal(prologoEn.paragrafos.length, 3);
  assert.equal(prologoEn.titulo, "You are a developer in 1985");
  for (const id of [1, 10, 20, 30] as const) {
    assert.equal(localizarAto(id, "pt-BR"), atos[id]);
    assert.equal(localizarAto(id, "en-US"), atosEn[id]);
    assert.notEqual(atos[id].narrativa, atosEn[id].narrativa);
  }
  assert.equal(tituloTrofeu("act10", "en-US"), "Act 2");
  assert.equal(tituloTrofeu("act10", "pt-BR"), "Ato 2");
  assert.equal(textoTipo("fatalidade", "en-US"), "SETBACK");
});

test("English UI follows glossary without changing Portuguese defaults in helpers", () => {
  assert.equal(ui("ROLAR DADO", "en-US"), "ROLL DIE");
  assert.equal(ui("PASSAR TURNO", "en-US"), "SKIP TURN");
  assert.equal(ui("ROLAR DADO", "pt-BR"), "ROLAR DADO");
  assert.equal(textoDado(2, "en-US"), "RESULT: 2 · ADVANCE 2 SQUARES");
  assert.match(textoJogador("Alex", "turn", "en-US"), /roll the die/);
  assert.match(nomeScore("en-US", "Alex", 20, 3, 5), /Final progress: 20\/100/);
  // The language is global presentation state, never part of saved mechanics.
  const locales: Idioma[] = ["en-US", "pt-BR"];
  assert.deepEqual(locales, ["en-US", "pt-BR"]);
  assert.ok(typeof idiomaGuardado === "function");
});

test("English logs and save export render historical Portuguese events without changing JSON", () => {
  const starting = iniciarPartida([{ controle: "humano", nome: "Alex" }], novoEstadoRng(1985));
  const result = registrarJogada(starting, { dado: 1 }, casas);
  assert.equal(result.entrada.casaDestino, 2);
  assert.equal(result.entrada.casaFinal, 3);
  const ptLine = formatarLinhaLog(result.entrada, "pt-BR");
  const enLine = formatarLinhaLog(result.entrada, "en-US");
  assert.match(ptLine, /DADO 1/);
  assert.match(enLine, /DIE 1/);
  assert.match(enLine, /move forward 1 square/);
  assert.match(enLine, /progress/);
  assert.equal(efeitoDeEntrada("Ponto de partida · sem efeito", 1, "en-US"), "Starting square · no effect");
  assert.match(formatarGameLogMarkdown(result.estado.log, "en-US"), /square 1/);
  assert.match(textoMestre(result.estado.log, "Alex", "en-US"), /you roll 1/);
  const structured = paraEstadoSalvo(result.estado);
  const english = serializarSave(structured, "en-US");
  const portuguese = serializarSave(structured, "pt-BR");
  assert.match(english, /match save/);
  assert.match(portuguese, /save da partida/);
  assert.deepEqual(desserializarSave(english), desserializarSave(portuguese));
});

test("Endgame keeps mechanical ranking and scoring regardless of UI language", () => {
  const initial = iniciarPartida([{controle:"humano",nome:"Alex"}],novoEstadoRng(1985));
  const prepared = {...initial,jogadores:[{...initial.jogadores[0],casa:39}]};
  const winner = registrarJogada(prepared,{dado:1},casas).estado;
  const en = montarTelaEndgame(winner,"en-US");
  const pt = montarTelaEndgame(winner,"pt-BR");
  assert.ok(en && pt);
  assert.deepEqual(en.ranking,pt.ranking);
  assert.equal(en.rolamentosVencedor,pt.rolamentosVencedor);
  assert.match(en.narracao,/you roll 1/);
  assert.match(pt.narracao,/tirou 1/);
});
