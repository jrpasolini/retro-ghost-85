import test from "node:test";
import assert from "node:assert/strict";
import { desserializarSave, serializarSave, type EstadoSalvo } from "../estado/save.ts";

const estado: EstadoSalvo = {
  schema: 1,
  jogadorAtivo: 3,
  jogadorSelecionado: 2,
  casaAtiva: 18,
  atoMusical: 2,
  partidaEncerrada: false,
  jogadores: [1, 2, 3, 4].map((id) => ({ id, casa: id + 10, projeto: id * 10, turnosPerdidos: 0, actsVisitados: [40, 10] })),
};

test("save Markdown preserva o estado estruturado da partida", () => {
  assert.deepEqual(desserializarSave(serializarSave(estado)), estado);
});

test("load rejeita arquivo sem bloco de estado", () => {
  assert.throws(() => desserializarSave("# texto qualquer"), /Bloco JSON/);
});

test("load rejeita valores fora dos limites do jogo", () => {
  const adulterado = serializarSave({ ...estado, casaAtiva: 18 }).replace('"projeto": 10', '"projeto": 999');
  assert.throws(() => desserializarSave(adulterado), /Progresso/);
});

