import test from "node:test";
import assert from "node:assert/strict";

class AudioFalso {
  static ultimo: AudioFalso;
  preload = "";
  volume = 1;
  loop = false;
  src = "";
  currentTime = 0;
  paused = true;
  reproducoes = 0;
  private eventos = new Map<string, Array<() => void>>();

  constructor() { AudioFalso.ultimo = this; }
  addEventListener(tipo: string, callback: () => void) {
    this.eventos.set(tipo, [...(this.eventos.get(tipo) ?? []), callback]);
  }
  async play() { this.paused = false; this.reproducoes += 1; }
  pause() { this.paused = true; }
  emitir(tipo: string) { this.paused = true; this.eventos.get(tipo)?.forEach((callback) => callback()); }
}

(globalThis as unknown as { Audio: typeof AudioFalso }).Audio = AudioFalso;
const { ControleDeAudio } = await import("../audio.ts");

test("reinicia automaticamente as trilhas dos atos quando elas terminam", async () => {
  const controle = new ControleDeAudio(() => undefined);
  await controle.desbloquear();
  const audio = AudioFalso.ultimo;
  assert.equal(audio.reproducoes, 1);
  audio.emitir("ended");
  await Promise.resolve();
  assert.equal(audio.reproducoes, 2);
  assert.equal(audio.currentTime, 0);
});

test("não repete a faixa curta de congratulations", async () => {
  const controle = new ControleDeAudio(() => undefined);
  await controle.desbloquear();
  await controle.tocar("endgame");
  const audio = AudioFalso.ultimo;
  const antes = audio.reproducoes;
  audio.emitir("ended");
  await Promise.resolve();
  assert.equal(audio.reproducoes, antes);
});
