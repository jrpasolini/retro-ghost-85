import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULT_NARRATOR_URL, NARRATOR_MODEL, resolveNarratorUrl } from "../config.ts";
import { checkNarratorHealth, requestNarration, type NarratorCallOptions } from "./narrator.ts";

const worker = DEFAULT_NARRATOR_URL;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("a URL do narrador cai no Worker publicado quando o ambiente está vazio", () => {
  assert.equal(resolveNarratorUrl(undefined), worker);
  assert.equal(resolveNarratorUrl({}), worker);
  assert.equal(resolveNarratorUrl({ VITE_NARRATOR_URL: "  " }), worker);
  assert.equal(resolveNarratorUrl({ VITE_NARRATOR_URL: "não-é-url" }), worker);
  assert.equal(resolveNarratorUrl({ VITE_NARRATOR_URL: "https://exemplo.test/narrador/" }), "https://exemplo.test/narrador");
});

test("checkNarratorHealth lê GET /health", async () => {
  let called = "";
  const fetchImpl: typeof fetch = async (input, init) => {
    called = String(input);
    assert.equal(init?.method, "GET");
    return jsonResponse({ ok: true, model: NARRATOR_MODEL });
  };
  const result = await checkNarratorHealth({ fetchImpl });
  assert.equal(called, `${worker}/health`);
  assert.deepEqual(result, { ok: true, model: NARRATOR_MODEL });
});

test("checkNarratorHealth devolve erro de HTTP, de corpo e de rede sem lançar", async () => {
  const http = await checkNarratorHealth({
    fetchImpl: async () => jsonResponse({ error: "quota" }, 429),
  });
  assert.deepEqual(http, { ok: false, error: "quota" });

  const invalid = await checkNarratorHealth({
    fetchImpl: async () => new Response("não json", { status: 200 }),
  });
  assert.deepEqual(invalid, { ok: false, error: "Narrator returned an invalid response." });

  const down = await checkNarratorHealth({
    fetchImpl: async () => {
      throw new TypeError("Failed to fetch");
    },
  });
  assert.deepEqual(down, { ok: false, error: "Failed to fetch" });
});

test("checkNarratorHealth encerra a espera e não lança", async () => {
  const fetchImpl: typeof fetch = (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
      reject(new DOMException("The operation was aborted", "AbortError"));
    });
  });
  const result = await checkNarratorHealth({ fetchImpl, timeoutMs: 20 });
  assert.deepEqual(result, { ok: false, error: "Request timed out." });
});

test("requestNarration envia o contrato POST /narrate", async () => {
  let body = "";
  let url = "";
  const fetchImpl: typeof fetch = async (input, init) => {
    url = String(input);
    body = String(init?.body);
    assert.equal(init?.method, "POST");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("content-type"), "application/json");
    return jsonResponse({ narration: "A fita girou.", model: NARRATOR_MODEL });
  };
  const result = await requestNarration({
    player: " Ju ",
    act: "endgame",
    trajectory: "## Trajetória\n- casa 1",
  }, { fetchImpl, baseUrl: "https://exemplo.test/base/" });
  assert.equal(url, "https://exemplo.test/base/narrate");
  assert.deepEqual(JSON.parse(body), {
    player: "Ju",
    act: "endgame",
    trajectory: "## Trajetória\n- casa 1",
  });
  assert.deepEqual(result, { ok: true, narration: "A fita girou.", model: NARRATOR_MODEL });
});

test("requestNarration recusa pedido inválido sem chamar a rede", async () => {
  let calls = 0;
  const options: NarratorCallOptions = {
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse({ narration: "não", model: "x" });
    },
  };
  assert.deepEqual(await requestNarration({ player: "  ", act: "2", trajectory: "" }, options), {
    ok: false,
    error: "Player name is required.",
  });
  assert.deepEqual(await requestNarration({ player: "Ju", act: "1" as "2", trajectory: "" }, options), {
    ok: false,
    error: "Act must be 2, 3, 4, or endgame.",
  });
  assert.deepEqual(await requestNarration({ player: "Ju", act: "3", trajectory: "x".repeat(20_001) }, options), {
    ok: false,
    error: "Trajectory exceeds 20000 characters.",
  });
  assert.equal(calls, 0);
  const accepted = await requestNarration({ player: "Ju", act: "4", trajectory: "x".repeat(20_000) }, options);
  assert.equal(accepted.ok, true);
  assert.equal(calls, 1);
});

test("requestNarration traduz erro do Worker e tempo esgotado", async () => {
  const refused = await requestNarration({ player: "Ju", act: "2", trajectory: "casa 10" }, {
    fetchImpl: async () => jsonResponse({ error: "act desconhecido" }, 400),
  });
  assert.deepEqual(refused, { ok: false, error: "act desconhecido" });

  const timedOut = await requestNarration({ player: "Ju", act: "2", trajectory: "casa 10" }, {
    timeoutMs: 15,
    fetchImpl: (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new DOMException("aborted", "AbortError"));
      });
    }),
  });
  assert.deepEqual(timedOut, { ok: false, error: "Request timed out." });
});

test("a interface ainda não importa o cliente do Worker", () => {
  const fonte = readFileSync(new URL("../main.ts", import.meta.url), "utf8");
  assert.doesNotMatch(fonte, /services\/narrator|checkNarratorHealth|requestNarration/);
  const vite = readFileSync(new URL("../../vite.config.ts", import.meta.url), "utf8");
  assert.match(vite, /base:\s*"\.\/"/);
});
