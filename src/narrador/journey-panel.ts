import { JourneyStore } from '../services/journey.ts';
import type { NarrationRequest } from '../services/narrator.ts';

export function journeyControls(playId: string, downloadId: string): string {
  return `<div class="journey-deck">
    <div class="journey-deck-strip" aria-hidden="true"><span>JOURNEY / SIDE A</span><span class="journey-led"></span><span>RG • 85</span></div>
    <div class="journey-deck-keys">
      <button id="${playId}" class="journey-play" type="button" disabled>
        <span class="journey-play-symbol" aria-hidden="true"></span>
        <span class="journey-key-copy"><b class="journey-transport">PLAY</b><span class="journey-play-label">Ouvir sua jornada</span></span>
      </button>
      <button id="${downloadId}" class="journey-download" type="button" disabled>
        <span class="journey-cassette" aria-hidden="true"><span class="journey-cassette-label">DOWNLOAD</span><span class="journey-reels"><i></i><i></i></span><span class="journey-tape-base"></span></span>
        <span class="journey-download-label">Download da jornada em voz</span>
      </button>
    </div>
    <p class="journey-status" role="status" aria-live="polite"></p>
  </div>`;
}

export class JourneyPanel {
  private request: NarrationRequest | null = null;
  private revision = 0;
  private ready = false;
  private busy = false;
  private url: string | null = null;
  private audio = new Audio();
  private readonly deck: HTMLElement;
  private readonly status: HTMLElement;
  private readonly play: HTMLButtonElement;
  private readonly download: HTMLButtonElement;

  private readonly story: HTMLElement;
  private readonly store: JourneyStore;
  private readonly onPlay: () => void;
  private readonly onStop: () => void;

  constructor(root: HTMLElement, story: HTMLElement, store: JourneyStore, onPlay: () => void, onStop: () => void) {
    this.story = story; this.store = store; this.onPlay = onPlay; this.onStop = onStop;
    this.deck = root.querySelector('.journey-deck')!;
    this.status = root.querySelector('.journey-status')!;
    this.play = root.querySelector('.journey-play')!;
    this.download = root.querySelector('.journey-download')!;
    this.play.addEventListener('click', () => { void this.listen(); });
    this.download.addEventListener('click', () => this.save());
    this.audio.addEventListener('ended', () => { this.onStop(); this.message('Jornada concluída. Ouça novamente ou baixe o cassete.', 'Journey finished. Listen again or download the cassette.'); this.render(); });
    this.audio.addEventListener('error', () => { this.onStop(); this.message('Não foi possível reproduzir o áudio. Tente novamente.', 'Audio could not be played. Please try again.'); this.render(); });
  }

  private label(pt: string, en: string): string { return this.request?.lang === 'pt-BR' ? pt : en; }
  private message(pt: string, en: string): void { this.status.textContent = this.label(pt, en); }
  private render(): void {
    const playing = !this.audio.paused && !this.audio.ended;
    this.deck.classList.toggle('is-playing', playing);
    this.deck.classList.toggle('is-busy', this.busy);
    this.play.disabled = this.busy || !this.request;
    this.download.disabled = !this.url;
    this.play.setAttribute('aria-busy', String(this.busy));
    this.play.setAttribute('aria-pressed', String(playing));
    this.play.querySelector('.journey-transport')!.textContent = playing ? 'PAUSE' : 'PLAY';
    const text = playing ? this.label('Pausar sua jornada', 'Pause your journey')
      : this.url ? (this.audio.currentTime > 0 && !this.audio.ended ? this.label('Continuar áudio', 'Resume audio') : this.label('Ouvir novamente', 'Listen again')) : this.label('Ouvir sua jornada', 'Listen to your journey');
    this.play.querySelector('.journey-play-label')!.textContent = text;
    this.play.setAttribute('aria-label', text);
    this.download.querySelector('.journey-download-label')!.textContent = this.label('Download da jornada em voz', 'Download your journey audio');
    this.download.setAttribute('aria-label', this.label('Download da jornada em voz (MP3)', 'Download your journey audio (MP3)'));
  }

  async show(request: NarrationRequest): Promise<void> {
    this.stop();
    const revision = ++this.revision;
    this.request = request;
    this.ready = false;
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = null; this.audio.removeAttribute('src');
    this.story.textContent = request.beats.map(b => b.beat).join('\n\n');
    this.busy = true;
    this.message('O Mestre está preparando o comentário da sua jornada…', 'The Master is preparing your journey’s closing comment…');
    this.render();
    try {
      const result = await this.store.text(request);
      if (revision !== this.revision) return;
      if (result.ok) {
        this.story.textContent = result.narration;
        this.ready = true;
        if (result.fallback) this.message('Sua história está pronta. O comentário do Mestre está indisponível nesta tentativa.', 'Your story is ready. The Master’s comment is unavailable on this attempt.');
        else this.message('Sua jornada está pronta. Pressione PLAY para gerar a voz.', 'Your journey is ready. Press PLAY to generate the voice.');
      } else this.message('O Mestre não respondeu. Pressione PLAY para tentar novamente.', 'The Master did not respond. Press PLAY to try again.');
    } finally { if (revision === this.revision) { this.busy = false; this.render(); } }
  }

  private async listen(): Promise<void> {
    if (this.busy || !this.request) return;
    if (!this.audio.paused) { this.audio.pause(); this.onStop(); this.message('Reprodução pausada. Pressione PLAY para continuar.', 'Playback paused. Press PLAY to continue.'); this.render(); return; }
    const request = this.request;
    if (!this.ready) { await this.show(request); if (!this.ready || this.request !== request) return; }
    const activeRevision = this.revision;
    this.busy = true; if (!this.url) this.message('Gravando sua jornada em voz…', 'Recording your voiced journey…'); this.render();
    try {
      if (!this.url) {
        const blob = await this.store.audio(request);
        if (activeRevision !== this.revision) return;
        this.url = URL.createObjectURL(blob); this.audio.src = this.url;
      }
      if (activeRevision !== this.revision) return;
      this.onPlay();
      try { await this.audio.play(); if (activeRevision !== this.revision) return; this.message('Tocando sua jornada. O cassete já está disponível para download.', 'Playing your journey. The cassette is ready to download.'); }
      catch { if (activeRevision !== this.revision) return; this.onStop(); this.message('Áudio pronto. Pressione PLAY para ouvir.', 'Audio ready. Press PLAY to listen.'); }
    } catch {
      if (activeRevision === this.revision) this.message('Não foi possível gerar a voz. Pressione PLAY para tentar novamente.', 'Voice generation failed. Press PLAY to try again.');
    } finally { if (activeRevision === this.revision) { this.busy = false; this.render(); } }
  }

  private save(): void {
    if (!this.url || !this.request) return;
    const name = this.request.player.replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0, 32) || 'player';
    const a = document.createElement('a'); a.href = this.url;
    a.download = `retro-ghost-85-${name}-${this.request.act}-${this.request.lang}.mp3`;
    a.click();
    this.message('Cassete salvo. Você pode ouvir novamente quando quiser.', 'Cassette saved. You can listen again whenever you like.');
  }

  stop(): void {
    ++this.revision;
    const playing = !this.audio.paused;
    this.audio.pause();
    if (playing) this.onStop();
    this.busy = false;
    this.render();
  }

  reset(): void {
    this.stop();
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = null; this.request = null; this.ready = false;
    this.audio.removeAttribute('src'); this.render();
  }
}
