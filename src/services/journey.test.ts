import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyStore, requestJourneyAudio } from './journey.ts';
import { localizeNarrationBeats } from '../narrador/beats.ts';
import type { NarrationRequest } from './narrator.ts';
const request: NarrationRequest = { player: 'Alex', act: '2', lang: 'pt-BR', beats: localizeNarrationBeats([{ id: 5 }, { id: 10 }], 'pt-BR') };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const narration = 'O gravador guardou a aventura. Alex, até onde vai sua coragem?';

test('concurrent text, playback and download reuse one narration and one TTS request', async () => {
  let narrations = 0, sounds = 0;
  const store = new JourneyStore({ fetchImpl: async (url, init) => {
    if (String(url).endsWith('/narrate')) { narrations++; return json({ text: narration, model: 'gemma' }); }
    sounds++;
    assert.deepEqual(JSON.parse(String(init?.body)), { text: narration, lang: 'pt-BR' });
    assert.equal(new Headers(init?.headers).has('xi-api-key'), false);
    return new Response(new Uint8Array([1,2,3]), { headers: { 'content-type': 'audio/mpeg' } });
  } });
  await Promise.all([store.text(request), store.text(request)]);
  const [first, second] = await Promise.all([store.audio(request), store.audio(request)]);
  assert.equal(first, second); assert.equal(first.size, 3);
  assert.equal(await store.audio(request), first);
  assert.equal(narrations, 1); assert.equal(sounds, 1);
});
test('player, language and historical beats are distinct cache entries', async () => {
  let calls = 0;
  const store = new JourneyStore({ fetchImpl: async () => { calls++; return json({ text: narration, model: 'gemma' }); } });
  await store.text(request); await store.text({ ...request, player: 'Sam' });
  await store.text({ ...request, lang: 'en-US' });
  await store.text({ ...request, beats: localizeNarrationBeats([{ id: 1 }, { id: 10 }], 'pt-BR') });
  assert.equal(calls, 4);
});
test('failed text requests can retry and never synthesize missing narration', async () => {
  let requests = 0, tts = 0;
  const store = new JourneyStore({ fetchImpl: async url => {
    if (String(url).endsWith('/tts')) tts++;
    requests++; return json({ error: 'unavailable' }, 503);
  } });
  assert.equal((await store.text(request)).ok, false);
  await assert.rejects(store.audio(request), /narration_unavailable/);
  assert.equal(requests, 2); assert.equal(tts, 0);
});
test('TTS errors unlock a new attempt; successful audio is retained', async () => {
  let tts = 0;
  const store = new JourneyStore({ fetchImpl: async url => {
    if (String(url).endsWith('/narrate')) return json({ text: narration, model: 'gemma' });
    if (++tts === 1) return json({ error: 'quota' }, 429);
    return new Response(new Uint8Array([1]), { headers: { 'content-type': 'audio/mpeg' } });
  } });
  await assert.rejects(store.audio(request), /audio_unavailable/);
  assert.equal((await store.audio(request)).size, 1);
  await store.audio(request); assert.equal(tts, 2);
});
test('audio rejects non-audio data and oversized text, and honors its deadline', async () => {
  await assert.rejects(requestJourneyAudio('x'.repeat(2801), 'en'), /invalid_narration/);
  await assert.rejects(requestJourneyAudio(narration, 'en', { fetchImpl: async () => json({ error: 'bad' }) }), /audio_unavailable/);
  await assert.rejects(requestJourneyAudio(narration, 'en', { timeoutMs: 10, fetchImpl: (_url, init) => new Promise((_resolve,reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('deadline','AbortError')));
  }) }), { name: 'AbortError' });
});
