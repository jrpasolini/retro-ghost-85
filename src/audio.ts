import { trilhaDeveRepetir, type TrilhaId } from "./motor/trilha.ts";

const arquivos: Record<TrilhaId, string> = {
  intro: "./audio/intro.mp3",
  "act-1": "./audio/act-1.mp3",
  "act-2": "./audio/act-2.mp3",
  "act-3": "./audio/act-3.mp3",
  "act-4": "./audio/act-4.mp3",
  endgame: "./audio/endgame.mp3",
};

const nomes: Record<TrilhaId, string> = {
  intro: "INTRO",
  "act-1": "ACT 1 · BOOT",
  "act-2": "ACT 2 · BBS",
  "act-3": "ACT 3 · DEBUG",
  "act-4": "ACT 4 · FINAL",
  endgame: "CONGRATULATIONS",
};

export class ControleDeAudio {
  private readonly audio = new Audio();
  private readonly aoAtualizar: (ligado: boolean, nome: string) => void;
  private desbloqueado = false;
  private ligado = true;
  private trilha: TrilhaId = "intro";

  constructor(aoAtualizar: (ligado: boolean, nome: string) => void) {
    this.aoAtualizar = aoAtualizar;
    this.audio.preload = "metadata";
    this.audio.volume = 0.55;
    // O reinício é controlado pelo evento `ended`. Isso evita que alguns
    // navegadores interrompam silenciosamente faixas longas após o primeiro ciclo.
    this.audio.loop = false;
    this.audio.src = arquivos.intro;
    this.audio.addEventListener("ended", () => {
      if (!this.ligado || !this.desbloqueado || !trilhaDeveRepetir(this.trilha)) return;
      this.audio.currentTime = 0;
      void this.reproduzir();
    });
    this.aoAtualizar(this.ligado, nomes[this.trilha]);
  }

  private async reproduzir(): Promise<void> {
    try {
      await this.audio.play();
    } catch {
      this.desbloqueado = false;
    }
  }

  async desbloquear(): Promise<void> {
    this.desbloqueado = true;
    if (!this.ligado) return;
    await this.reproduzir();
  }

  async tocar(trilha: TrilhaId): Promise<void> {
    if (this.trilha === trilha && !this.audio.paused) return;
    this.trilha = trilha;
    this.audio.pause();
    this.audio.src = arquivos[trilha];
    this.audio.currentTime = 0;
    this.audio.loop = false;
    this.aoAtualizar(this.ligado, nomes[trilha]);
    if (this.desbloqueado && this.ligado) {
      await this.reproduzir();
    }
  }

  async alternar(): Promise<void> {
    this.ligado = !this.ligado;
    if (this.ligado) await this.desbloquear();
    else this.audio.pause();
    this.aoAtualizar(this.ligado, nomes[this.trilha]);
  }

  definirVolume(valor: number): void {
    this.audio.volume = Math.max(0, Math.min(1, valor));
  }
}

