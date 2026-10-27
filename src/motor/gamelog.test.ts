import test from "node:test";
import assert from "node:assert/strict";
import { formatarGamelog } from "./gamelog.ts";

test("gamelog usa os mesmos dados da jogada no painel e no tabuleiro", () => {
  const log = formatarGamelog({
    jogador: "Alex",
    dado1: 3,
    dado2: 2,
    casaDestino: 6,
    casaFinal: 4,
    projeto: 0,
    venceu: false,
    jogadaExtra: false,
    proximoJogador: "CPU-1",
  });

  for (const trecho of ["Alex", "3 + 2 = 5", "casa 6", "casa 4", "0/100", "CPU-1"]) {
    assert.ok(log.completo.includes(trecho), `Trecho ausente no log completo: ${trecho}`);
  }
  for (const trecho of ["Alex", "3+2=5", "6→4", "0/100", "CPU-1"]) {
    assert.ok(log.compacto.includes(trecho), `Trecho ausente no log compacto: ${trecho}`);
  }
});
