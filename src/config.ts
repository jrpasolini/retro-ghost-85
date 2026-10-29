/** Cloudflare Worker that narrates authored beats with a short Gemma commentary. The UI does not call it yet. */
export const DEFAULT_NARRATOR_URL = "https://retro-ghost-85-narrator.antonio-pasolini.workers.dev";

/** Workers AI model id served by that Worker. */
export const NARRATOR_MODEL = "@cf/google/gemma-7b-it-lora";

export const NARRATOR_TIMEOUT_MS = 12_000;

type NarratorEnv = { VITE_NARRATOR_URL?: string } | undefined;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Reads `VITE_NARRATOR_URL` and falls back to the deployed Worker.
 * Blank or non-HTTP values also use the fallback. A trailing slash is removed.
 */
export function resolveNarratorUrl(env: NarratorEnv = import.meta.env): string {
  const raw = typeof env?.VITE_NARRATOR_URL === "string" ? env.VITE_NARRATOR_URL.trim() : "";
  const chosen = raw && isHttpUrl(raw) ? raw : DEFAULT_NARRATOR_URL;
  return chosen.replace(/\/+$/, "");
}
