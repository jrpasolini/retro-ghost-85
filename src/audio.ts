import type { Idioma } from "./i18n/content.ts";
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
  "act-1": "PRÓLOGO",
  "act-2": "ACT 2 · BBS",
  "act-3": "ACT 3 · DEBUG",
  "act-4": "ACT 4 · FINAL",
  endgame: "CONGRATULATIONS",
};

const trackNamesEn: Record<TrilhaId, string> = {
  intro: "INTRO", "act-1": "PROLOGUE", "act-2": "ACT 2 · BBS",
  "act-3": "ACT 3 · DEBUG", "act-4": "ACT 4 · FINAL", endgame: "CONGRATULATIONS",
};

export class ControleDeAudio {
  private readonly audio = new Audio();
  private readonly aoAtualizar: (ligado: boolean, nome: string) => void;
  private idioma: Idioma;
  private desbloqueado = false;
  private ligado = true;
  private narracaoAtiva = false;
  private trilha: TrilhaId = "intro";

  constructor(aoAtualizar: (ligado: boolean, nome: string) => void, idioma: Idioma = "pt-BR") {
    this.aoAtualizar = aoAtualizar;
    this.idioma = idioma;
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
    this.aoAtualizar(this.ligado, this.nomeAtual());
  }

  private nomeAtual(): string { return (this.idioma === "pt-BR" ? nomes : trackNamesEn)[this.trilha]; }

  definirIdioma(idioma: Idioma): void {
    this.idioma = idioma;
    this.aoAtualizar(this.ligado, this.nomeAtual());
  }

  suspenderParaNarracao(): void { this.narracaoAtiva = true; this.audio.pause(); }

  retomarAposNarracao(): void {
    this.narracaoAtiva = false;
    if (this.ligado && this.desbloqueado && !this.audio.ended) void this.reproduzir();
  }

  private async reproduzir(): Promise<boolean> {
    if (this.narracaoAtiva) return false;
    try {
      await this.audio.play();
      return true;
    } catch {
      this.desbloqueado = false;
      return false;
    }
  }

  async desbloquear(): Promise<boolean> {
    if (!this.ligado || this.narracaoAtiva) {
      this.desbloqueado = true;
      return true;
    }
    try {
      await this.audio.play();
      this.desbloqueado = true;
      return true;
    } catch {
      this.desbloqueado = false;
      return false;
    }
  }

  async tocar(trilha: TrilhaId): Promise<void> {
    if (this.trilha === trilha && !this.audio.paused) return;
    this.trilha = trilha;
    this.audio.pause();
    this.audio.src = arquivos[trilha];
    this.audio.currentTime = 0;
    this.audio.loop = false;
    this.aoAtualizar(this.ligado, this.nomeAtual());
    if (this.desbloqueado && this.ligado) {
      await this.reproduzir();
    }
  }

  async alternar(): Promise<void> {
    this.ligado = !this.ligado;
    if (this.ligado) await this.desbloquear();
    else this.audio.pause();
    this.aoAtualizar(this.ligado, this.nomeAtual());
  }

  definirVolume(valor: number): void {
    this.audio.volume = Math.max(0, Math.min(1, valor));
  }
}

