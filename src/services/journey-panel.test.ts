import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyPanel } from '../narrador/journey-panel.ts';
import type { JourneyStore } from './journey.ts';
import type { NarrationRequest } from './narrator.ts';

class ElementFixture {
  textContent = '';
  disabled = false;
  classList = { toggle() {} };
  nodes = new Map<string, ElementFixture>();
  listeners = new Map<string, () => void>();
  querySelector(selector: string) { if (!this.nodes.has(selector)) this.nodes.set(selector, new ElementFixture()); return this.nodes.get(selector)!; }
  addEventListener(event: string, callback: () => void) { this.listeners.set(event, callback); }
  setAttribute() {}
}
class AudioFixture {
  static last: AudioFixture;
  paused = true; ended = false; currentTime = 0; src = '';
  resolve!: () => void; reject!: (error: Error) => void;
  constructor() { AudioFixture.last = this; }
  addEventListener() {}
  removeAttribute() { this.src = ''; }
  pause() { this.paused = true; }
  play() { this.paused = false; return new Promise<void>((resolve,reject) => { this.resolve=resolve; this.reject=reject; }); }
}

test('closing a journey ignores late play success/failure and does not resume another view’s soundtrack', async () => {
  for (const outcome of ['resolve','reject']) {
    (globalThis as unknown as {Audio: typeof AudioFixture}).Audio = AudioFixture;
    const root = new ElementFixture(), story = new ElementFixture();
    let played = 0, stopped = 0;
    const store = {
      text: async () => ({ ok: true, narration: 'Approved story and comment.', fallback: false }),
      audio: async () => new Blob([new Uint8Array([1,2,3])], {type:'audio/mpeg'}),
    } as unknown as JourneyStore;
    const panel = new JourneyPanel(root as unknown as HTMLElement, story as unknown as HTMLElement, store, () => played++, () => stopped++);
    const request: NarrationRequest = { player:'Alex', act:'2', lang:'en', beats:[{id:1,titulo:'Start',beat:'Approved story.'}] };
    await panel.show(request);
    root.querySelector('.journey-play').listeners.get('click')!();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(played,1);
    panel.stop();
    const status = root.querySelector('.journey-status').textContent;
    assert.equal(stopped,1);
    if(outcome==='resolve') AudioFixture.last.resolve(); else AudioFixture.last.reject(new Error('late play failure'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(stopped,1, 'stale play must not resume music after the view was closed');
    assert.equal(root.querySelector('.journey-status').textContent,status);
    panel.reset();
  }
});
