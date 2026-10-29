import { localizeNarrationBeats, selectNarrationBeats } from '../src/narrador/beats.ts';

/** Deterministic UI fixture, not evidence of live AI or voice generation. */
export function makeNarrationFixture(input) {
  const lang = input.lang === 'pt-BR' ? 'pt-BR' : 'en';
  const selected = selectNarrationBeats(localizeNarrationBeats(input.beats ?? [], lang), input.act === 'endgame');
  const body = selected.map(beat => beat.beat).join('\n\n');
  const player = String(input.player ?? 'QA');
  const master = lang === 'pt-BR' ? `${player}, sua jornada merece ser lembrada.` : `${player}, your journey is worth remembering.`;
  return { body, master, text: `${body}\n\n${master}`, model: 'qa-fixture-gemma', lang, cached: true, fallback: false };
}

/** Prevent CI from consuming real model quota or synthesizing paid audio. */
export async function installOfflineNarrator(page) {
  await page.route(/\/(narrate|tts|health)(\?.*)?$/, async route => {
    const path = new URL(route.request().url()).pathname;
    const headers = { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' };
    if (route.request().method?.() === 'OPTIONS') return route.fulfill({ status: 204, headers, body: '' });
    if (path.endsWith('/tts')) return route.fulfill({ status: 503, headers, body: JSON.stringify({ error: 'qa_live_tts_disabled' }) });
    if (path.endsWith('/health')) return route.fulfill({ status: 200, headers, body: JSON.stringify({ ok: true, model: 'qa-fixture-gemma', voiceConfigured: false }) });
    return route.fulfill({ status: 200, headers, body: JSON.stringify(makeNarrationFixture(route.request().postDataJSON())) });
  });
}
