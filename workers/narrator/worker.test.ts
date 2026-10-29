import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

function cache() {
  const entries = new Map<string, string | ArrayBuffer>();
  return { get: async (key: string) => entries.get(key) ?? null, put: async (key: string, value: string | ArrayBuffer) => { entries.set(key, value); } };
}
const body = { player: 'Ju', lang: 'en', act: '2', beats: [{ id: 1 }, { id: 5 }, { id: 10 }] };
const call = (data: unknown, env: object = {}, path = '/narrate', origin?: string) => worker.fetch(new Request(`https://worker.test${path}`, { method: 'POST', headers: { ...(origin ? { origin } : {}) }, body: JSON.stringify(data) }), env);
test('canonical English body ignores caller prose and limits before inference', async () => {
  let calls = 0;
  const response = await call({ ...body, beats: Array.from({ length: 39 }, (_, i) => ({ id: i + 1, beat: 'INJECTED' })) }, { AI: { run: async (_model: string, input: any) => {
    calls++; assert.equal(input.max_tokens, 96); assert.equal(JSON.parse(input.messages[1].content).journey.length, 2);
    return { response: 'Ju, the shadows still remember your persistence.' };
  } } });
  const value = await response.json();
  assert.equal(response.status, 200); assert.equal(calls, 1); assert.equal(value.beats, 2);
  assert.equal(value.lang, 'en'); assert.doesNotMatch(value.text, /INJECTED|Você/); assert.equal(value.fallback, false);
});
test('endgame reserves publication and selects five beats', async () => {
  const response = await call({ ...body, act: 'endgame', beats: Array.from({ length: 40 }, (_, i) => ({ id: i + 1 })) });
  const value = await response.json();
  assert.equal(value.beats, 5); assert.equal(value.ids[0], 1); assert.equal(value.ids.at(-1), 40);
  assert.match(value.text, /catalog arrived/); assert.equal(value.fallback, true);
});
test('cache lookup prevents repeated AI calls; language changes key', async () => {
  let calls = 0; const env = { CACHE: cache(), AI: { run: async () => { calls++; return { response: 'Ju, the shadows still remember your persistence.' }; } } };
  assert.equal((await (await call(body, env)).json()).cached, false);
  assert.equal((await (await call(body, env)).json()).cached, true); assert.equal(calls, 1);
  await call({ ...body, lang: 'pt-BR' }, env); assert.equal(calls, 2);
});
test('model errors and rule-heavy answers fall back without retrying', async () => {
  for (const run of [async () => { throw new Error('quota'); }, async () => ({ response: 'You earned 20 points on square 5.' })]) {
    let calls = 0; const r = await call(body, { AI: { run: async () => { calls++; return run(); } } });
    const value = await r.json(); assert.equal(r.status, 200); assert.equal(value.fallback, true); assert.equal(calls, 1);
    assert.match(value.body, /You spent|The recorder|Questions/);
  }
});
test('bad IDs, missing endgame publication and unsupported language rejected before AI', async () => {
  let calls = 0; const env = { AI: { run: async () => { calls++; } } };
  for (const data of [{ ...body, beats: [{ id: 41 }] }, { ...body, beats: [{ id: 40 }] }, { ...body, act: 'endgame' }, { ...body, lang: 'xx' }, { ...body, beats: [] }]) assert.equal((await call(data, env)).status, 400);
  assert.equal(calls, 0);
});
test('malformed or oversized JSON rejected', async () => {
  for (const [data, status] of [['{', 400], ['null', 400], [JSON.stringify({ text: 'x'.repeat(33000) }), 413]] as const) {
    const r = await worker.fetch(new Request('https://worker.test/narrate', { method: 'POST', body: data }), {});
    assert.equal(r.status, status);
  }
});
test('CORS permits the game, refuses foreign origins and diagnostics do not infer', async () => {
  assert.equal((await call(body, {}, '/narrate', 'https://evil.test')).status, 403);
  const r = await call(body, {}, '/narrate', 'https://retro-ghost-85.onrender.com');
  assert.equal(r.headers.get('access-control-allow-origin'), 'https://retro-ghost-85.onrender.com');
  for (const path of ['/probe', '/selftest']) assert.equal((await call(body, {}, path)).status, 404);
});
test('TTS enforces length and configured voice before contacting provider', async () => {
  let calls = 0; const env = { ELEVENLABS_VOICE_ID: 'voice', ELEVENLABS_API_KEY: 'test-only', TTS_FETCH: async () => { calls++; } };
  assert.equal((await call({ text: 'x'.repeat(2801) }, env, '/tts')).status, 413);
  assert.equal((await call({ text: 'Hello', voiceId: 'other' }, env, '/tts')).status, 400);
  assert.equal(calls, 0);
});
test('TTS caches audio and never requests generation on a cache hit', async () => {
  let calls = 0; const env = { CACHE: cache(), ELEVENLABS_VOICE_ID: 'voice', ELEVENLABS_API_KEY: 'test-only', TTS_FETCH: async (_url: string, init: RequestInit) => {
    calls++; assert.equal(JSON.parse(String(init.body)).model_id, 'eleven_multilingual_v2');
    return new Response(new Uint8Array([1,2,3]), { headers: { 'content-type': 'audio/mpeg' } });
  } };
  const first = await call({ text: 'Hello', lang: 'en' }, env, '/tts'); assert.equal(first.headers.get('x-cache'), 'miss');
  const second = await call({ text: 'Hello', lang: 'en' }, env, '/tts'); assert.equal(second.headers.get('x-cache'), 'hit');
  assert.equal(calls, 1); assert.deepEqual(new Uint8Array(await second.arrayBuffer()), new Uint8Array([1,2,3]));
});
test('TTS provider failures return sanitized errors', async () => {
  const r = await call({ text: 'Hello' }, { ELEVENLABS_VOICE_ID: 'voice', ELEVENLABS_API_KEY: 'test-only', TTS_FETCH: async () => new Response('private provider detail', { status: 429 }) }, '/tts');
  assert.equal(r.status, 502); assert.doesNotMatch(await r.text(), /private provider/);
});

test('diagnostics distinguish rejected output, provider errors and timeouts without leaking details', async () => {
  const long = await (await call(body, { AI: { run: async () => ({ response: 'A long narrative. '.repeat(25), usage: { completion_tokens: 96 } }) } })).json();
  assert.equal(long.generation.status, 'rejected');
  assert.ok(long.generation.reasons.includes('too_many_words'));
  assert.ok(long.generation.reasons.includes('too_many_characters'));
  assert.ok(long.generation.reasons.includes('multiple_sentences'));
  assert.equal(long.generation.completionTokens, 96);
  for (const [name, status] of [['TimeoutError', 'timeout'], ['Error', 'model_error']]) {
    const value = await (await call(body, { AI: { run: async () => {
      const error = new Error('private provider details'); error.name = name; throw error;
    } } })).json();
    assert.equal(value.generation.status, status);
    assert.equal(value.fallback, true);
    assert.doesNotMatch(JSON.stringify(value), /private provider details/);
  }
  const missing = await (await call(body)).json();
  assert.equal(missing.generation.status, 'unavailable');
});
