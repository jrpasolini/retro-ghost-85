import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { casas } from "../data/casas.ts";
import { posicaoDaPeca } from "./posicao.ts";

// Snapshot FNV-1a da geometria dos 40 hotspots na master antes da auditoria.
// Mudanças em moldura/posição/tamanho exigem autorização explícita do autor.
function assinaturaGeometria(): string {
  const descricao = casas.map(({ id, x, y, width, height }) =>
    [id, x, y, width, height].join(":")).join("|");
  let valor = 2166136261;
  for (const char of descricao) {
    valor = Math.imul(valor ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  return valor.toString(16).padStart(8, "0");
}

test("os 40 hotspots preservam EXATAMENTE a geometria original do tabuleiro", () => {
  assert.equal(casas.length, 40);
  assert.equal(assinaturaGeometria(), "ca843612");
});

test("quatro personagens continuam dentro de cada casa e com o mesmo centro", () => {
  for (const casa of casas) {
    const centroX = casa.x + casa.width / 2;
    const centroY = casa.y + casa.height / 2;
    assert.deepEqual(posicaoDaPeca(casa, 0, 1), { x: centroX, y: centroY });
    for (let total = 1; total <= 4; total++) {
      for (let indice = 0; indice < total; indice++) {
        const { x, y } = posicaoDaPeca(casa, indice, total);
        assert.ok(x >= casa.x && x <= casa.x + casa.width, `P${indice + 1} fora de X na casa ${casa.id}`);
        assert.ok(y >= casa.y && y <= casa.y + casa.height, `P${indice + 1} fora de Y na casa ${casa.id}`);
      }
    }
  }
});

test("arte do tabuleiro é o WebP original imutável, sem pictogramas sobrepostos", () => {
  const main = readFileSync(new URL("../main.ts", import.meta.url), "utf8");
  const webp = readFileSync(new URL("../../public/assets/board-reference-edited.webp", import.meta.url));
  assert.match(main, /board-reference-edited\.webp/);
  assert.doesNotMatch(main, /board-icon-overlay|board-reference-v3|overlay-v3/i);

  // SHA-1 de blob Git ("blob " + tamanho + NUL + bytes originais).
  // Se um único pixel do WebP original mudar, o teste deve falhar.
  const gitBlobSha = createHash("sha1")
    .update("blob " + webp.length + "\0")
    .update(webp)
    .digest("hex");
  assert.equal(gitBlobSha, "9207fc16a5bf28e2dbdba298090375986f7b3afe");
});


test("marcos dos atos e efeito das casas seguem íntegros", () => {
  assert.deepEqual([10, 20, 30, 40].map((id) => casas[id - 1].tipo), ["marco", "marco", "marco", "final"]);
  assert.deepEqual([10, 20, 30].map((id) => casas[id - 1].titulo), ["Ato 2 · BBS", "Ato 3 · DEBUG", "Ato 4 · FINAL"]);
  assert.equal(casas[12].titulo, "Prompt do DOS");
  assert.ok(casas[12].narrativa.includes("C:\\>"));
  assert.deepEqual(casas[39].consequencia, { projeto: 10 });
});
