import test from 'node:test';
import assert from 'node:assert/strict';
import { makeNarrationFixture, installOfflineNarrator } from '../../qa/offline-narrator.mjs';

test('browser fixture returns canonical localized beats, clearly labelled as a mock', () => {
  const value = makeNarrationFixture({ player: 'QA', lang: 'en-US', act: 'endgame', beats: Array.from({length:40},(_,i)=>({id:i+1,beat:'untrusted'})) });
  assert.equal(value.model, 'qa-fixture-gemma');
  assert.equal(value.text.split('\n\n').length, 6);
  assert.match(value.text, /catalog arrived/);
  assert.doesNotMatch(value.text, /untrusted|Você/);
  const pt = makeNarrationFixture({ player: 'QA', lang:'pt-BR', act:'2', beats:[{id:1},{id:5}] });
  assert.match(pt.body, /Você/); assert.match(pt.master, /sua jornada/);
});

test('browser fixture intercepts provider routes and refuses TTS without external calls', async () => {
  let handler;
  await installOfflineNarrator({ route: async (_pattern, callback) => { handler = callback; } });
  let result;
  await handler({ request: () => ({ url: () => 'https://provider.test/tts' }), fulfill: async value => { result = value; } });
  assert.equal(result.status, 503);
  assert.match(result.body, /qa_live_tts_disabled/);
  await handler({ request: () => ({ url: () => 'https://provider.test/narrate', method: () => 'OPTIONS' }), fulfill: async value => { result = value; } });
  assert.equal(result.status, 204);
});
