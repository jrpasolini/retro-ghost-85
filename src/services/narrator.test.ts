import test from 'node:test';
import assert from 'node:assert/strict';
import { checkNarratorHealth, requestNarration } from './narrator.ts';
import { localizeNarrationBeats, prepareNarrationBeats, selectNarrationBeats } from '../narrador/beats.ts';
import type { EntradaLog } from '../motor/log.ts';

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const request = { player: ' Ju ', act: '2' as const, lang: 'en-US' as const, beats: localizeNarrationBeats([{ id: 1 }, { id: 5 }, { id: 10 }], 'en') };

test('health accepts the deployed contract and reports HTTP failures', async () => {
  assert.deepEqual(await checkNarratorHealth({ fetchImpl: async () => json({ ok: true, model: 'gemma' }) }), { ok: true, model: 'gemma' });
  assert.deepEqual(await checkNarratorHealth({ fetchImpl: async () => json({ error: 'quota' }, 429) }), { ok: false, error: 'quota' });
});
test('client selects before sending, uses localized IDs and reads text', async () => {
  const result = await requestNarration(request, { fetchImpl: async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    assert.equal(body.player, 'Ju'); assert.equal(body.lang, 'en'); assert.equal(body.beats.length, 2);
    assert.equal(body.beats.at(-1).id, 10);
    assert.deepEqual(Object.keys(body.beats[0]), ['id']);
    return json({ text: 'The cassette turned.', model: 'gemma', cached: true });
  } });
  assert.deepEqual(result, { ok: true, narration: 'The cassette turned.', model: 'gemma', fallback: false, cached: true });
});
test('invalid requests and premature publication never call the network', async () => {
  let calls = 0; const options = { fetchImpl: async () => { calls++; return json({}); } };
  assert.equal((await requestNarration({ ...request, player: '' }, options)).ok, false);
  assert.equal((await requestNarration({ ...request, beats: [] }, options)).ok, false);
  assert.equal((await requestNarration({ ...request, beats: localizeNarrationBeats([{ id: 40 }], 'en') }, options)).ok, false);
  assert.equal((await requestNarration({ ...request, act: 'endgame' }, options)).ok, false);
  assert.equal(calls, 0);
});
test('client rejects malformed and oversized responses', async () => {
  for (const value of [{ narration: 'old format', model: 'gemma' }, { text: 'x'.repeat(2801), model: 'gemma' }, null]) {
    assert.equal((await requestNarration(request, { fetchImpl: async () => json(value) })).ok, false);
  }
});
test('network timeout is reported without throwing', async () => {
  const result = await checkNarratorHealth({ timeoutMs: 10, fetchImpl: (_url, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
  }) });
  assert.deepEqual(result, { ok: false, error: 'Request timed out.' });
});
test('selection preserves chronology, salient events, start and ending', () => {
  const candidates = [{ id: 1 }, { id: 2 }, { id: 3, tipo: 'fatalidade', magnitude: 20 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 40 }];
  assert.deepEqual(selectNarrationBeats(candidates).map(b => b.id), [3, 40]);
  const end = selectNarrationBeats(candidates, true).map(b => b.id);
  assert.equal(end.length, 5); assert.equal(end[0], 1); assert.equal(end.at(-1), 40); assert.ok(end.includes(3));
});
test('all forty beats exist in both languages with publication only at the end', () => {
  for (const lang of ['pt-BR', 'en']) {
    const all = localizeNarrationBeats(Array.from({ length: 40 }, (_, i) => ({ id: i + 1 })), lang);
    assert.equal(all.length, 40); assert.ok(all.every(b => b.beat.length > 100 && b.titulo));
    const longest = all.map(b => b.beat.length).sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0);
    assert.ok(longest + 608 <= 2800, `${lang}: maximum composed body ${longest}`);
  }
  assert.match(localizeNarrationBeats([{ id: 40 }], 'en')[0].beat, /catalog arrived/);
});
test('trajectory ignores other players, passed squares and skipped turns', () => {
  const entry = (patch: Partial<EntradaLog>): EntradaLog => ({ turno: 1, jogadorId: 1, dado1: 4, casaDestino: 5, casaFinal: 5, casasPassadas: [2,3,4,5], ...patch } as EntradaLog);
  const log = [entry({}), entry({ jogadorId: 2, casaDestino: 27, casaFinal: 27 }), entry({ dado1: null, casaDestino: 38, casaFinal: 38 })];
  assert.deepEqual(prepareNarrationBeats(log, 1, 'en').map(b => b.id), [5]);
  assert.equal(prepareNarrationBeats(log, 1, 'en')[0].beat.startsWith('The recorder'), true);
});

test('a repeated final landing remains last after deduplication', () => {
  assert.deepEqual(selectNarrationBeats([{ id: 5 }, { id: 6 }, { id: 5 }]).map(b => b.id), [6, 5]);
});
