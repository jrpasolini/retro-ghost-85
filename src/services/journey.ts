import { NARRATOR_TIMEOUT_MS, resolveNarratorUrl } from '../config.ts';
import { requestNarration, type NarrationRequest, type NarrationResult, type NarratorCallOptions } from './narrator.ts';

export async function requestJourneyAudio(text: string, lang: string, options: NarratorCallOptions = {}): Promise<Blob> {
  if (!text.trim() || text.length > 2800) throw new Error('invalid_narration');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? NARRATOR_TIMEOUT_MS);
  try {
    const response = await (options.fetchImpl ?? fetch)(`${(options.baseUrl ?? resolveNarratorUrl()).replace(/\/+$/, '')}/tts`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, lang: lang === 'en-US' ? 'en' : lang }), signal: controller.signal,
    });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) throw new Error('audio_unavailable');
    const audio = await response.blob();
    if (!audio.size || audio.size > 10 * 1024 * 1024) throw new Error('invalid_audio');
    return audio;
  } finally { clearTimeout(timer); }
}

/** Share in-flight requests and finished audio for this session; never regenerate on replay/download. */
export class JourneyStore {
  private texts = new Map<string, Promise<NarrationResult>>();
  private sounds = new Map<string, Promise<Blob>>();
  private readonly options: NarratorCallOptions;
  constructor(options: NarratorCallOptions = {}) { this.options = options; }

  text(request: NarrationRequest): Promise<NarrationResult> {
    const key = JSON.stringify(request);
    const hit = this.texts.get(key);
    if (hit) return hit;
    const pending = requestNarration(request, this.options).then(result => {
      if (!result.ok && this.texts.get(key) === pending) this.texts.delete(key);
      return result;
    });
    this.texts.set(key, pending);
    return pending;
  }

  async audio(request: NarrationRequest): Promise<Blob> {
    const result = await this.text(request);
    if (!result.ok) throw new Error('narration_unavailable');
    const key = JSON.stringify([request.lang, result.narration]);
    const hit = this.sounds.get(key);
    if (hit) return hit;
    const pending = requestJourneyAudio(result.narration, request.lang, this.options).catch(error => {
      if (this.sounds.get(key) === pending) this.sounds.delete(key);
      throw error;
    });
    this.sounds.set(key, pending);
    return pending;
  }

  clear(): void { this.texts.clear(); this.sounds.clear(); }
}
