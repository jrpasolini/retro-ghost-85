import { NARRATOR_TIMEOUT_MS, resolveNarratorUrl } from "../config.ts";

/** Acts the Worker accepts. Square 1 has no narration. */
export const NARRATOR_ACTS = ["2", "3", "4", "endgame"] as const;

export type NarratorAct = (typeof NARRATOR_ACTS)[number];

/** Markdown from `getPlayerTrajectory`, capped by the Worker contract. */
export const MAX_TRAJECTORY_CHARS = 20_000;

export type NarrationRequest = {
  player: string;
  act: NarratorAct;
  trajectory: string;
};

export type NarratorHealthResult =
  | { ok: true; model: string }
  | { ok: false; error: string };

export type NarrationResult =
  | { ok: true; narration: string; model: string }
  | { ok: false; error: string };

export type NarratorCallOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
};

function isAct(value: string): value is NarratorAct {
  return (NARRATOR_ACTS as readonly string[]).includes(value);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return "Request timed out.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Network request failed.";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : null;
}

async function callWorker(
  path: "/health" | "/narrate",
  init: RequestInit,
  options: NarratorCallOptions = {},
): Promise<{ response: Response } | { error: string }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const base = (options.baseUrl ?? resolveNarratorUrl()).replace(/\/+$/, "");
  const timeoutMs = options.timeoutMs ?? NARRATOR_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${base}${path}`, { ...init, signal: controller.signal });
    return { response };
  } catch (error) {
    return { error: errorMessage(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function httpError(response: Response, body: unknown): string {
  const record = asRecord(body);
  if (record && typeof record.error === "string" && record.error.trim()) return record.error;
  return `HTTP ${response.status}`;
}

/** GET /health. Returns a result; it does not throw. */
export async function checkNarratorHealth(options?: NarratorCallOptions): Promise<NarratorHealthResult> {
  const result = await callWorker("/health", { method: "GET" }, options);
  if ("error" in result) return { ok: false, error: result.error };
  const body = await readBody(result.response);
  if (!result.response.ok) return { ok: false, error: httpError(result.response, body) };
  const record = asRecord(body);
  if (!record || record.ok !== true || typeof record.model !== "string" || !record.model) {
    return { ok: false, error: "Narrator returned an invalid response." };
  }
  return { ok: true, model: record.model };
}

/**
 * POST /narrate. `trajectory` is Markdown, at most 20_000 characters.
 * Returns a result; it does not throw.
 */
export async function requestNarration(
  request: NarrationRequest,
  options?: NarratorCallOptions,
): Promise<NarrationResult> {
  const player = typeof request.player === "string" ? request.player.trim() : "";
  if (!player) return { ok: false, error: "Player name is required." };
  if (typeof request.act !== "string" || !isAct(request.act)) {
    return { ok: false, error: "Act must be 2, 3, 4, or endgame." };
  }
  if (typeof request.trajectory !== "string") return { ok: false, error: "Trajectory must be Markdown text." };
  if (request.trajectory.length > MAX_TRAJECTORY_CHARS) {
    return { ok: false, error: "Trajectory exceeds 20000 characters." };
  }

  const result = await callWorker("/narrate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ player, act: request.act, trajectory: request.trajectory }),
  }, options);
  if ("error" in result) return { ok: false, error: result.error };
  const body = await readBody(result.response);
  if (!result.response.ok) return { ok: false, error: httpError(result.response, body) };
  const record = asRecord(body);
  if (record && typeof record.error === "string" && record.error.trim()) {
    return { ok: false, error: record.error };
  }
  if (!record || typeof record.narration !== "string" || typeof record.model !== "string") {
    return { ok: false, error: "Narrator returned an invalid response." };
  }
  return { ok: true, narration: record.narration, model: record.model };
}
