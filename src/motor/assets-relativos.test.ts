import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { assetViolations, scanTree } from "../../scripts/check-relative-assets.mjs";

const repo = new URL("../..", import.meta.url);

test("nenhum arquivo-fonte aponta asset local com caminho absoluto na raiz", () => {
  const hits = [
    ...scanTree(new URL("./src", repo).pathname),
    ...scanTree(new URL("./index.html", repo).pathname),
  ];
  assert.deepEqual(hits, [], hits.map((hit) => `${hit.path}: ${hit.sample}`).join("\n"));
});

test("o bundle dist não contém asset local com caminho absoluto na raiz", () => {
  const dist = new URL("./dist", repo).pathname;
  if (!existsSync(dist)) return;
  const hits = scanTree(dist);
  assert.deepEqual(hits, [], hits.map((hit) => `${hit.path}: ${hit.sample}`).join("\n"));
});

test("a abertura usa os mesmos caminhos relativos dos outros assets", () => {
  const fonte = readFileSync(new URL("../main.ts", import.meta.url), "utf8");
  assert.match(fonte, /\.\/assets\/antonio-pasolini-portrait\.png/);
  assert.match(fonte, /\.\/assets\/retro-ghost-opening\.png/);
  assert.equal(assetViolations(fonte).length, 0);
  assert.equal(existsSync(new URL("../../public/assets/antonio-pasolini-portrait.png", import.meta.url)), true);
  assert.equal(existsSync(new URL("../../public/assets/retro-ghost-opening.png", import.meta.url)), true);
});
