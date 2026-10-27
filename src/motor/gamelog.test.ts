import test from "node:test";
import assert from "node:assert/strict";
import { formatarGamelog } from "./gamelog.ts";

test("gamelog usa o mesmo dado da jogada no painel e no tabuleiro", () => {
  const log = formatarGamelog({
    jogador: "Alex",
    dado: 3,
    casaDestino: 4,
    casaFinal: 4,
    projeto: 0,
    venceu: false,
    jogadaExtra: false,
    proximoJogador: "CPU-1",
  });

  for (const trecho of ["Alex", "tirou 3", "casa 4", "0/100", "CPU-1"]) {
    assert.ok(log.completo.includes(trecho), `Trecho ausente no log completo: ${trecho}`);
  }
  for (const trecho of ["Alex", "DADO 3", "CASA 4", "0/100", "CPU-1"]) {
    assert.ok(log.compacto.includes(trecho), `Trecho ausente no log compacto: ${trecho}`);
  }
});
