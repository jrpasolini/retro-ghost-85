import test from "node:test";
import assert from "node:assert/strict";
import { casas } from "../data/casas.ts";
import { criarRngSemente, rolar2D6 } from "./dado.ts";
import { formatarGamelog } from "./gamelog.ts";
import { criarJogadores } from "./jogadores.ts";
import { aplicarJogada } from "./tabuleiro.ts";
import { maiorAtoAlcancado, proximaTrilha, type TrilhaId } from "./trilha.ts";
import { avancarTurno } from "./turnos.ts";

test("Alex e CPU-1 alternam naturalmente até um deles finalizar o jogo", () => {
  const rng = criarRngSemente(1985);
  let jogadores = criarJogadores([
    { controle: "humano", nome: "Alex" },
    { controle: "cpu" },
  ]);
  let jogadorAtivo = 1;
  let vencedor = "";
  let jogadas = 0;
  const participantesQueJogaram = new Set<string>();
  const trilhas: TrilhaId[] = ["act-1"];

  while (!vencedor && jogadas < 120) {
    const jogador = jogadores[jogadorAtivo - 1];
    const { dados, total } = rolar2D6(rng);
    const resultado = aplicarJogada(jogador, total, casas);
    jogadores[jogadorAtivo - 1] = resultado.jogador;
    participantesQueJogaram.add(jogador.nome);
    jogadas += 1;

    const maiorAto = maiorAtoAlcancado(jogadores.map((item) => item.actsVisitados));
    const trilha = proximaTrilha(maiorAto, maiorAto, resultado.venceu);
    if (trilhas.at(-1) !== trilha) trilhas.push(trilha);

    const turno = !resultado.venceu && !resultado.jogadaExtra
      ? avancarTurno(jogadores, jogadorAtivo)
      : { jogadores, jogadorAtivo, ignorados: [] as string[] };
    jogadores = turno.jogadores;
    jogadorAtivo = turno.jogadorAtivo;

    const log = formatarGamelog({
      jogador: jogador.nome,
      dado1: dados[0].valor,
      dado2: dados[1].valor,
      casaDestino: resultado.casa.id,
      casaFinal: resultado.jogador.casa,
      projeto: resultado.jogador.projeto,
      venceu: resultado.venceu,
      jogadaExtra: resultado.jogadaExtra,
      proximoJogador: resultado.venceu || resultado.jogadaExtra ? undefined : jogadores[jogadorAtivo - 1].nome,
      ignorados: turno.ignorados,
    });
    assert.match(log.completo, new RegExp(jogador.nome));
    assert.ok(log.completo.includes(`${dados[0].valor} + ${dados[1].valor} = ${total}`));
    assert.ok(log.completo.includes(`Projeto: ${resultado.jogador.projeto}/100`));

    if (resultado.venceu) vencedor = jogador.nome;
  }

  assert.deepEqual([...participantesQueJogaram].sort(), ["Alex", "CPU-1"]);
  assert.ok(vencedor === "Alex" || vencedor === "CPU-1");
  assert.ok(jogadas < 120, `A partida não terminou: ${jogadas} jogadas`);
  assert.deepEqual(trilhas, ["act-1", "act-2", "act-3", "act-4", "endgame"]);
});
