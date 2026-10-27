import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rolarDado, rolarD6, rolar2D6, criarRngSemente, GLIFOS_DADO } from "./dado.ts";

describe("Motor do Dado (RNG Local)", () => {
  it("deve rolar valores no intervalo 1..6 para D6 padrão", () => {
    for (let i = 0; i < 100; i++) {
      const resultado = rolarD6();
      assert.ok(resultado.valor >= 1 && resultado.valor <= 6, `Valor fora do intervalo: ${resultado.valor}`);
      assert.equal(resultado.faces, 6);
      assert.ok(typeof resultado.timestamp === "string");
    }
  });

  it("deve permitir injeção de gerador customizado para testes determinísticos", () => {
    // Gerador que retorna exatamente 0 -> deve dar valor 1
    const resultadoMin = rolarDado(6, () => 0);
    assert.equal(resultadoMin.valor, 1);

    // Gerador que retorna 0.999 -> deve dar valor 6
    const resultadoMax = rolarDado(6, () => 0.9999);
    assert.equal(resultadoMax.valor, 6);

    // Gerador que retorna 0.5 -> deve dar valor 4 (0.5 * 6 = 3 -> floor + 1 = 4)
    const resultadoMeio = rolarDado(6, () => 0.5);
    assert.equal(resultadoMeio.valor, 4);
  });

  it("rola dois dados independentes e soma as duas faces", () => {
    const sorteios = [0, 0.9999];
    const resultado = rolar2D6(() => sorteios.shift()!);
    assert.deepEqual(resultado.dados.map((dado) => dado.valor), [1, 6]);
    assert.equal(resultado.total, 7);
    assert.equal(sorteios.length, 0);
  });

  it("deve produzir resultados reproduzíveis com semente determinística (Mulberry32)", () => {
    const semente = 1985;
    const rng1 = criarRngSemente(semente);
    const rng2 = criarRngSemente(semente);

    const sequencia1 = Array.from({ length: 10 }, () => rolarD6(rng1).valor);
    const sequencia2 = Array.from({ length: 10 }, () => rolarD6(rng2).valor);

    assert.deepEqual(sequencia1, sequencia2);
  });

  it("deve validar número de faces inválido", () => {
    assert.throws(() => rolarDado(0), /faces inválido/);
    assert.throws(() => rolarDado(-3), /faces inválido/);
    assert.throws(() => rolarDado(2.5), /faces inválido/);
  });

  it("deve possuir glifos retrô para todas as 6 faces", () => {
    for (let i = 1; i <= 6; i++) {
      assert.ok(GLIFOS_DADO[i]);
    }
  });
});

