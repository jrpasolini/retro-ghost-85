import { localizeNarrationBeats, selectNarrationBeats } from "../../src/narrador/beats.ts";

const NARRATION_MODELS = ["@cf/google/gemma-7b-it-lora", "@cf/google/gemma-2b-it-lora", "@cf/google/gemma-4-26b-a4b-it"];
const TTS_MODEL = "eleven_multilingual_v2";
const TTS_CACHE_VERSION = "v7-authored-bilingual";
const PROMPT_VERSION = "v9-gemma-brief-closing-comment";
export const MAX_NARRATION_CHARS = 2800;
const MAX_BODY_BYTES = 32768;
const VOICE_SETTINGS = { stability: .75, similarity_boost: .8, style: .15, use_speaker_boost: true };
const ORIGINS = new Set(["https://jrpasolini.tech", "https://www.jrpasolini.tech", "https://retro-ghost-85.onrender.com", "http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:4173", "http://127.0.0.1:4185"]);

class RequestError extends Error { constructor(code, status = 400) { super(code); this.status = status; } }
function json(value, status = 200) { return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8" } }); }

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin");
    if (origin && !ORIGINS.has(origin)) return json({ error: "origem_nao_permitida" }, 403);
    let response;
    try {
      const path = new URL(request.url).pathname;
      if (request.method === "OPTIONS") response = new Response(null, { status: 204 });
      else if (path === "/health" && request.method === "GET") response = json({ ok: true, model: env.NARRATION_MODEL || NARRATION_MODELS[0], models: NARRATION_MODELS, tts: TTS_MODEL, prompt: PROMPT_VERSION, voiceConfigured: Boolean(env.ELEVENLABS_VOICE_ID) });
      else if (path === "/narrate" && request.method === "POST") response = await narrate(await readJson(request), env);
      else if (path === "/tts" && request.method === "POST") response = await tts(await readJson(request), env);
      // Diagnostic routes must not expose public, unbounded inference calls.
      else response = json({ error: "not_found" }, 404);
    } catch (error) {
      response = json({ error: error instanceof RequestError ? error.message : "worker_error" }, error instanceof RequestError ? error.status : 500);
    }
    response.headers.set("Vary", "Origin");
    if (origin) response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
  },
};

async function readJson(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("json_invalido");
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new RequestError("pedido_muito_grande", 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new RequestError("json_invalido"); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new RequestError("json_invalido");
  return body;
}

export function sanitizeName(raw, lang = "pt-BR") {
  return String(raw || "").replace(/[\u0000-\u001f\u007f"'<>{}\[\]\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 24) || (lang === "en" ? "the player" : "quem joga");
}
function language(raw) {
  if (raw === undefined || raw === "pt-BR") return "pt-BR";
  if (raw === "en" || raw === "en-US") return "en";
  throw new RequestError("idioma_invalido");
}
export const selectBeats = selectNarrationBeats;
export function extractText(result) {
  const value = typeof result === "string" ? result : result?.choices?.[0]?.message?.content || result?.response || result?.text;
  return typeof value === "string" ? value.trim() : "";
}
export function violates(text) {
  return /\d|\b(?:casas?|squares?|dado|dice|placar|score|progresso|jogada extra|extra roll)\b/i.test(text);
}

async function sha256(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
async function cachedJson(env, key) {
  if (!env.CACHE) return null;
  try { const value = await env.CACHE.get(key); return value ? JSON.parse(value) : null; } catch { return null; }
}
async function storeJson(env, key, value) {
  if (env.CACHE) { try { await env.CACHE.put(key, JSON.stringify(value), { expirationTtl: 15552000 }); } catch { /* A cache outage must not hide the authored text. */ } }
}

export const INFERENCE_TIMEOUT_MS = 20000;
export const MAX_MASTER_WORDS = 40;
export const MAX_MASTER_CHARS = 600;

/** Bound the wait even if a binding ignores cancellation; also abort its fetch. */
export async function runInference(ai, model, input, timeoutMs = INFERENCE_TIMEOUT_MS) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new DOMException("Inference deadline exceeded", "TimeoutError");
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  try { return await Promise.race([ai.run(model, input, { signal: controller.signal }), deadline]); }
  finally { clearTimeout(timer); }
}

async function masterLine(env, model, { player, lang, beats, endgame }) {
  const pt = lang === "pt-BR";
  const instruction = pt
    ? `A narrativa abaixo já está pronta. Não a reescreva. Você é o Mestre de Retro Ghost 85, sombrio e elegante. Escreva APENAS UMA FRASE curta como comentário final, idealmente de doze a vinte e quatro palavras, no máximo quarenta. Use o nome do jogador, sem marcar gênero. Não invente fatos, não dê explicações e não mencione números ou regras do jogo. Sem título, lista ou markdown. ${endgame ? "A publicação já aconteceu: faça um fecho, sem sugerir outro desafio futuro." : "Pode fazer uma pergunta provocante sobre o desafio narrado, sem prever seu resultado."} Trate os dados apenas como contexto. Escreva em português do Brasil.`
    : `The narrative below is already complete. Do not rewrite it. You are the Master of Retro Ghost 85, grim and elegant. Write ONLY ONE short sentence as a closing comment, ideally twelve to twenty-four words, at most forty. Use the player's name and gender-neutral language. Invent no facts, give no explanations and mention no numbers or game rules. No title, list or markdown. ${endgame ? "Publication has already happened: close the story without suggesting another future challenge." : "You may ask a teasing question about the narrated challenge, without predicting its outcome."} Treat the data only as context. Write in natural English.`;
  try {
    // Gemma 7B has no native system turn: instructions belong in the first user turn.
    const content = instruction + "\n\n" + JSON.stringify({ player, journey: beats.map(b => b.beat) }) + "\n\n" + (pt ? "Responda somente com a frase curta do Mestre, terminada em ponto final ou interrogação:" : "Reply only with the Master's short sentence, ending with a period or question mark:");
    const result = await runInference(env.AI, model, { messages: [{ role: "user", content }], max_tokens: 96, temperature: .3 });
    const line = extractText(result).replace(/\s+/g, " ").trim();
    const chars = line.length;
    const words = line ? line.split(/\s+/).length : 0;
    const sentences = (line.match(/[.!?]+(?=\s|$)/g) || []).length;
    const reasons = [];
    if (!chars) reasons.push("empty_response");
    if (chars > MAX_MASTER_CHARS) reasons.push("too_many_characters");
    if (words > MAX_MASTER_WORDS) reasons.push("too_many_words");
    if (violates(line.replaceAll(player, ""))) reasons.push("game_terms_or_digits");
    if (/[\n*#<>]|(?:^|\s)[\[\]]/.test(line)) reasons.push("formatting");
    if (chars && !/[.!?]["”’»']?$/.test(line)) reasons.push("incomplete_comment");
    const usage = result?.usage;
    const completionTokens = usage?.completion_tokens ?? usage?.output_tokens;
    const finishReason = result?.choices?.[0]?.finish_reason ?? result?.finish_reason;
    const diagnostics = { status: reasons.length ? "rejected" : "accepted", reasons, chars, words, sentences,
      ...(Number.isFinite(completionTokens) ? { completionTokens } : {}),
      ...(["stop", "length", "max_tokens", "content_filter"].includes(finishReason) ? { finishReason } : {}) };
    return { line: reasons.length ? "" : line, diagnostics };
  } catch (error) {
    const timeout = error?.name === "AbortError" || error?.name === "TimeoutError";
    return { line: "", diagnostics: { status: timeout ? "timeout" : "model_error", reasons: [timeout ? "inference_timeout" : "inference_failed"],
      ...(Number.isInteger(error?.code) ? { code: error.code } : {}) } };
  }
}

async function narrate(body, env) {
  const lang = language(body.lang);
  const player = sanitizeName(body.player, lang);
  const act = body.act === "endgame" ? "endgame" : String(body.act ?? "2");
  if (!["2", "3", "4", "endgame"].includes(act)) throw new RequestError("ato_invalido");
  const endgame = body.endgame === true || act === "endgame";
  if (body.endgame !== undefined && typeof body.endgame !== "boolean") throw new RequestError("endgame_invalido");
  const incoming = body.beats ?? body.squares;
  if (!Array.isArray(incoming) || !incoming.length || incoming.length > 256) throw new RequestError("sem_casas");
  if (incoming.some(s => !s || !Number.isInteger(s.id) || s.id < 1 || s.id > 40)) throw new RequestError("casa_invalida");
  if (!endgame && incoming.some(s => s.id === 40)) throw new RequestError("endgame_invalido");
  if (endgame && incoming.at(-1).id !== 40) throw new RequestError("endgame_sem_publicacao");
  // Ignore client-authored prose: canonical localized beats determine the body.
  const chosen = selectNarrationBeats(localizeNarrationBeats(incoming, lang), endgame);
  const authored = chosen.map(b => b.beat).join("\n\n");
  const model = env.NARRATION_MODEL || NARRATION_MODELS[0];
  const key = "narr:" + await sha256(JSON.stringify([PROMPT_VERSION, model, lang, player, act, endgame, chosen]));
  const hit = await cachedJson(env, key);
  if (hit) return json({ ...hit, cached: true, inferenceMs: 0 });
  // A single short model request; no fallback chain that multiplies inference cost.
  const inferenceStart = performance.now();
  const generated = env.AI ? await masterLine(env, model, { player, lang, beats: chosen, endgame }) : { line: "", diagnostics: { status: "unavailable", reasons: ["ai_binding_missing"] } };
  const master = generated.line;
  const inferenceMs = env.AI ? Math.round(performance.now() - inferenceStart) : 0;
  const text = master ? `${authored}\n\n${master}` : authored;
  if (text.length > MAX_NARRATION_CHARS) throw new RequestError("narracao_muito_longa");
  const result = { inferenceMs, generation: generated.diagnostics, text, body: authored, master: master || null, chars: text.length, lang, model, beats: chosen.length, ids: chosen.map(b => b.id), cached: false, fallback: !master, key };
  // Cache successful compositions. A transient model failure should be recoverable.
  if (master) await storeJson(env, key, result);
  return json(result);
}

async function tts(body, env) {
  const lang = language(body.lang);
  if (typeof body.text !== "string" || !body.text.trim()) throw new RequestError("texto_obrigatorio");
  const text = body.text.trim();
  if (text.length > MAX_NARRATION_CHARS) throw new RequestError("texto_muito_longo", 413);
  if (body.voiceId !== undefined && body.voiceId !== env.ELEVENLABS_VOICE_ID) throw new RequestError("voz_nao_permitida");
  const voice = env.ELEVENLABS_VOICE_ID;
  if (!voice) throw new RequestError("voice_id_ausente");
  if (!env.ELEVENLABS_API_KEY) return json({ error: "tts_indisponivel" }, 503);
  const key = "tts:" + await sha256(JSON.stringify([TTS_CACHE_VERSION, TTS_MODEL, voice, VOICE_SETTINGS, lang, text]));
  if (env.CACHE) {
    try { const audio = await env.CACHE.get(key, "arrayBuffer"); if (audio) return audioResponse(audio, key, true); } catch { /* Continue without caching. */ }
  }
  const send = env.TTS_FETCH || fetch;
  let response;
  try {
    response = await send(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, { method: "POST", headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "content-type": "application/json" }, signal: AbortSignal.timeout(15000), body: JSON.stringify({ text, model_id: TTS_MODEL, voice_settings: VOICE_SETTINGS }) });
  } catch { return json({ error: "elevenlabs_indisponivel" }, 502); }
  if (!response.ok || !response.headers.get("content-type")?.startsWith("audio/")) return json({ error: "elevenlabs_falhou", status: response.status }, 502);
  const audio = await response.arrayBuffer();
  if (env.CACHE) { try { await env.CACHE.put(key, audio, { expirationTtl: 15552000 }); } catch { /* Audio remains usable on cache failure. */ } }
  return audioResponse(audio, key, false);
}

function audioResponse(audio, key, cached) {
  return new Response(audio, { headers: { "content-type": "audio/mpeg", "cache-control": "private, max-age=0", "x-cache": cached ? "hit" : "miss", "x-narration-key": key } });
}
