import { NARRATOR_TIMEOUT_MS, resolveNarratorUrl } from "../config.ts";
import { prepareNarrationBeats, selectNarrationBeats, type NarrationBeat } from "../narrador/beats.ts";
import type { EntradaLog } from "../motor/log.ts";

export const NARRATOR_ACTS = ["2", "3", "4", "endgame"] as const;
export type NarratorAct = typeof NARRATOR_ACTS[number];
export type NarrationRequest = { player: string; act: NarratorAct; lang: "pt-BR" | "en" | "en-US"; beats: NarrationBeat[] };
export type NarratorHealthResult = { ok: true; model: string } | { ok: false; error: string };
export type NarrationResult = { ok: true; narration: string; model: string; fallback: boolean; cached: boolean } | { ok: false; error: string };
export type NarratorCallOptions = { fetchImpl?: typeof fetch; timeoutMs?: number; baseUrl?: string };

/** Supply the trophy's historical log snapshot, not another participant's path. */
export function prepareNarrationRequest(log: readonly EntradaLog[], jogadorId: number, act: NarratorAct, lang: NarrationRequest["lang"]): NarrationRequest {
  const own = log.filter(e => e.jogadorId === jogadorId);
  return { player: own.at(-1)?.jogador ?? "", act, lang, beats: prepareNarrationBeats(own, jogadorId, lang, act === "endgame") };
}

async function callWorker(path: string, init: RequestInit, options: NarratorCallOptions = {}): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? NARRATOR_TIMEOUT_MS);
  try {
    const response = await (options.fetchImpl ?? fetch)(`${(options.baseUrl ?? resolveNarratorUrl()).replace(/\/+$/, "")}${path}`, { ...init, signal: controller.signal });
    let body: unknown;
    try { body = await response.json(); } catch (error) { if (controller.signal.aborted) throw error; body = null; }
    const record = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
    if (!response.ok || typeof record?.error === "string") return { ok: false, error: typeof record?.error === "string" ? record.error : `HTTP ${response.status}` };
    if (!record) return { ok: false, error: "Narrator returned an invalid response." };
    return { ok: true, body: record };
  } catch (error) {
    return { ok: false, error: controller.signal.aborted ? "Request timed out." : error instanceof Error ? error.message : "Network request failed." };
  } finally { clearTimeout(timer); }
}

export async function checkNarratorHealth(options?: NarratorCallOptions): Promise<NarratorHealthResult> {
  const result = await callWorker("/health", { method: "GET" }, options);
  if (!result.ok) return result;
  const model = result.body.model ?? (Array.isArray(result.body.models) ? result.body.models[0] : null);
  return result.body.ok === true && typeof model === "string" && model.trim() ? { ok: true, model } : { ok: false, error: "Narrator returned an invalid response." };
}

export async function requestNarration(request: NarrationRequest, options?: NarratorCallOptions): Promise<NarrationResult> {
  if (typeof request.player !== "string" || !request.player.trim()) return { ok: false, error: "Player name is required." };
  if (!NARRATOR_ACTS.includes(request.act)) return { ok: false, error: "Act must be 2, 3, 4, or endgame." };
  if (!["pt-BR", "en", "en-US"].includes(request.lang)) return { ok: false, error: "Language must be pt-BR or en." };
  if (!Array.isArray(request.beats) || !request.beats.length || request.beats.length > 256 || request.beats.some(b => !b || !Number.isInteger(b.id) || b.id < 1 || b.id > 40)) return { ok: false, error: "Narration requires valid landed squares." };
  const endgame = request.act === "endgame";
  if ((endgame && request.beats.at(-1)?.id !== 40) || (!endgame && request.beats.some(b => b.id === 40))) return { ok: false, error: "Publication belongs to endgame only." };
  const chosen = selectNarrationBeats(request.beats, endgame);
  const result = await callWorker("/narrate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ player: request.player.trim(), act: request.act, lang: request.lang === "en-US" ? "en" : request.lang, endgame, beats: chosen.map(({ id }) => ({ id })) }) }, options);
  if (!result.ok) return result;
  const { text, model, fallback, cached } = result.body;
  if (typeof text !== "string" || !text.trim() || text.length > 2800 || typeof model !== "string" || !model) return { ok: false, error: "Narrator returned an invalid response." };
  return { ok: true, narration: text, model, fallback: fallback === true, cached: cached === true };
}
