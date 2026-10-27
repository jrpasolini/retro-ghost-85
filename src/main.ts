import "@fontsource/chakra-petch/latin-400.css";
import "@fontsource/chakra-petch/latin-600.css";
import "@fontsource/chakra-petch/latin-700.css";
import "@fontsource/press-start-2p/latin-400.css";
import "./style.css";
import { casas } from "./data/casas";
import { atos } from "./data/atos";
import { prologo } from "./data/intro";
import type { Casa, Jogador } from "./types";
import { criarRngComEstado, novoEstadoRng, rolarD6 } from "./motor/dado";
import { podeIniciarJogada } from "./motor/turnos";
import { maiorAtoAlcancado, proximaTrilha } from "./motor/trilha";
import { criarJogadores, turnoDaCpu, type ConfiguracaoJogador } from "./motor/jogadores";
import { formatarGamelog } from "./motor/gamelog";
import { formatarLinhaLog, getPlayerTrajectory, NOME_TROFEU, textoMestre, trofeusVazios, type ChaveTrofeu } from "./motor/log";
import { posicaoDaPeca } from "./motor/posicao";
import { daEstadoSalvo, iniciarPartida, montarTelaEndgame, paraEstadoSalvo, registrarJogada, type EstadoPartida } from "./motor/partida";
import { ajustarQuantidade, clonarAssentos, confirmarAssentos } from "./motor/setup";
import { ControleDeAudio } from "./audio";
import { criarNarradorLocal, type PedidoNarracao } from "./narrador/narrador";
import { desserializarSave, serializarSave } from "./estado/save";

const narrador = criarNarradorLocal();
let rascunho: ConfiguracaoJogador[] = [{ controle: "humano", nome: "Jogador 1" }];
let confirmados: ConfiguracaoJogador[] = [];
let sessao: EstadoPartida | null = null;
let jogadores: Jogador[] = criarJogadores(rascunho);

let casaAtiva = 1;
let jogadorAtivo = 1;
let jogadorSelecionado = 1;
let rolandoDado = false;
let partidaIniciada = false;
let partidaEncerrada = false;
let atoMusical = 0;
let timerCpu: number | undefined;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Elemento #app não encontrado");

app.innerHTML = `
  <section id="opening-sequence" class="opening-sequence" aria-live="polite" aria-label="Apresentação de RETRO-GHOST-85">
    <div class="opening-stage opening-stage-portrait" aria-hidden="true">
      <img src="/assets/antonio-pasolini-portrait.png" alt="" />
      <p id="opening-credit" class="opening-credit">Presents a project that is part of the Hacktoberfest Open-Source AI Challenge: Week 4 called...</p>
    </div>
    <div class="opening-stage opening-stage-game" aria-hidden="true">
      <img src="/assets/retro-ghost-opening.png" alt="" />
      <p class="opening-prompt">PRESS SPACE TO START</p>
    </div>
    <p class="sr-only">Apresentação do projeto RETRO-GHOST-85.</p>
  </section>
  <main class="shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">RETRO COMPUTER SYSTEM • 1985</p>
        <h1>RETRO-GHOST-<span>85</span></h1>
      </div>
      <div class="top-actions">
        <div class="status"><i></i> MVP LOCAL · NARRATIVA E REGRAS</div>
        <div class="audio-console" aria-label="Controle da trilha sonora">
          <button id="btn-audio" type="button" aria-pressed="true">AUDIO ON</button>
          <span id="audio-track">INTRO</span>
          <label>VOL <input id="audio-volume" type="range" min="0" max="100" value="55" aria-label="Volume da trilha sonora" /></label>
        </div>
      </div>
    </header>

    <section class="game-layout" aria-label="Protótipo do tabuleiro">
      <div class="board-column">
        <div id="tabuleiro" class="board-stage" role="group" aria-label="Tabuleiro com 40 casas">
          <img class="board-art" src="./assets/board-reference-edited.webp" alt="Mesa retrô com computador, cassetes, disquetes, BBS e quarenta casas ao redor" />
          <div class="endgame-cover">
            <img src="./assets/casa-40-endgame.webp" alt="ENDGAME · PUBLICAÇÃO" />
          </div>
          <div id="einstein-easter-egg" class="easter-egg-screen" role="img" aria-label="Albert Einstein sorri na tela do computador" hidden>
            <img src="./assets/einstein-smile.webp" alt="" />
          </div>
          <div class="scanlines" aria-hidden="true"></div>
          <div class="cassette-deck" aria-label="Gravador de cassete para salvar e carregar a partida">
            <img src="./assets/cassette-save-load.png" alt="Gravador de dados em cassete com teclas REC e PLAY" />
            <button id="btn-save" class="tape-key tape-key-save" type="button" aria-label="REC: salvar partida em arquivo Markdown"><b>REC</b><span>SAVE</span></button>
            <button id="btn-load" class="tape-key tape-key-load" type="button" aria-label="PLAY: carregar partida de arquivo Markdown"><b>PLAY</b><span>LOAD</span></button>
            <input id="input-load" type="file" accept=".md,text/markdown,text/plain" hidden />
            <span id="tape-feedback" class="tape-feedback" aria-live="polite"></span>
          </div>
          <div id="board-game-log" class="board-game-log" tabindex="0" role="log" aria-live="polite" aria-relevant="additions" aria-label="Game log completo da partida. Role o mouse ou use as setas para ver o histórico.">
            <ol id="game-log-list"></ol>
          </div>
          <div class="houses" aria-label="Casas interativas"></div>
          <div class="tokens" aria-label="Peças dos quatro jogadores"></div>
        </div>

        <div class="player-console" aria-label="Seleção de jogadores">
          <div class="console-title">PLAYERS.LOCAL</div>
          <div class="player-list"></div>
          <div class="console-note">PASS-AND-PLAY · MESMO DISPOSITIVO</div>
        </div>
      </div>

      <aside class="inspector" aria-live="polite">
        <div class="inspector-head">
          <span class="prompt">&gt; INSPECT_HOUSE</span>
          <span class="counter">01/40</span>
        </div>
        <div class="house-number">01</div>
        <span class="type-chip">PRÓLOGO</span>
        <h2>Prólogo · Início</h2>
        <p class="effect-label">EFEITO DA CASA</p>
        <p class="effect"></p>
        <p class="narrative"></p>
        <p class="act-progress" aria-live="polite">ACTS do Jogador 1: 1/4</p>
        <div class="divider"></div>

        <div class="dice-panel" aria-label="Controle de rolagem do dado">
          <div class="dice-panel-header">
            <span class="prompt">&gt; DADO_LOCAL (1D6)</span>
            <span class="dice-tag">RNG PURO</span>
          </div>
          <div class="dice-display-area">
            <div class="dice-face" data-value="1" role="img" aria-label="Dado mostrando 1"></div>
            <div class="dice-readout">
              <span class="dice-value">–</span>
              <span class="dice-sub">AGUARDANDO JOGADA</span>
            </div>
          </div>
          <button id="btn-rolar-dado" class="dice-btn" type="button" disabled>
            ROLAR DADO
          </button>
          <div class="dice-status" aria-live="polite">
            Inicie a jornada para liberar o dado.
          </div>
          <button id="btn-reabrir-endgame" class="dice-btn endgame-reopen" type="button" hidden>VER ENDGAME</button>
        </div>

        <p class="tip" style="margin-top: .85rem;">Clique em qualquer casa ou jogador para inspecionar detalhes.</p>
      </aside>
    </section>

    <footer>
      <span>BUILD 0.6.0</span>
      <span>40 CASAS · 1–4 JOGADORES/CPU · 1D6 · SAVE/LOAD · TRILHA DINÂMICA</span>
    </footer>

    <dialog id="intro-dialog" class="intro-dialog" aria-labelledby="intro-title" aria-describedby="intro-copy">
      <div id="setup-step" class="intro-terminal setup-step">
        <p class="intro-kicker">${prologo.kicker}</p>
        <span class="intro-act">${prologo.rotulo}</span>
        <h2 id="intro-title">${prologo.titulo}</h2>
        <div id="intro-copy" class="intro-story">
          ${prologo.paragrafos.map((paragrafo) => `<p>${paragrafo}</p>`).join("")}
        </div>
        <h3 class="setup-heading">Quem vai programar?</h3>
        <p>Escolha de um a quatro participantes. Humanos dividem o mesmo dispositivo; a CPU apenas rola o dado automaticamente na própria vez.</p>
        <div class="player-count" aria-label="Quantidade de participantes">
          <button id="btn-menos-player" type="button" aria-label="Remover participante">−</button>
          <output id="player-count" aria-live="polite">1</output>
          <button id="btn-mais-player" type="button" aria-label="Adicionar participante">+</button>
        </div>
        <div id="player-config-list" class="player-config-list"></div>
        <p id="setup-summary" class="setup-summary" aria-live="polite"></p>
        <p id="setup-error" class="setup-error" aria-live="polite"></p>
        <div class="intro-actions">
          <button id="btn-load-setup" class="intro-secondary" type="button">CARREGAR SAVE</button>
          <button id="btn-iniciar-jornada" class="intro-primary" type="button">INICIAR JORNADA</button>
        </div>
        <small>CPU local · mesmas regras · mesma sorte · nenhuma chamada ao Gemma</small>
      </div>
    </dialog>

    <dialog id="endgame-dialog" class="intro-dialog endgame-dialog" aria-labelledby="endgame-title" aria-describedby="endgame-narration">
      <div class="intro-terminal">
        <p class="intro-kicker">RETRO-GHOST-85 // ENDGAME</p>
        <span class="intro-act">PUBLICAÇÃO</span>
        <h2 id="endgame-title" tabindex="-1">CONGRATULATIONS</h2>
        <p id="endgame-winner"></p>
        <p id="endgame-score"></p>
        <section class="narration-slot" aria-labelledby="narration-label">
          <h3 id="narration-label">O Mestre narra</h3>
          <p id="endgame-narration"></p>
          <div class="narration-controls">
            <button id="btn-ouvir-mestre" type="button">Ouvir o Mestre</button>
            <button id="btn-baixar-trofeu" type="button">Baixar troféu (MP3)</button>
          </div>
        </section>
        <section aria-labelledby="endgame-path-label">
          <h3 id="endgame-path-label">Trajetória</h3>
          <ol id="endgame-path" class="endgame-path"></ol>
        </section>
        <section aria-labelledby="endgame-rank-label">
          <h3 id="endgame-rank-label">Placar</h3>
          <ol id="endgame-ranking" class="endgame-ranking"></ol>
        </section>
        <div class="intro-actions">
          <button id="btn-ver-tabuleiro" class="intro-secondary" type="button">VER TABULEIRO</button>
          <button id="btn-nova-partida" class="intro-primary" type="button">NOVA PARTIDA</button>
        </div>
        <small>O cassete REC/SAVE continua disponível no tabuleiro.</small>
      </div>
    </dialog>

    <dialog id="trophy-dialog" class="intro-dialog endgame-dialog" aria-labelledby="trophy-title" aria-describedby="trophy-narration">
      <div class="intro-terminal">
        <p class="intro-kicker">RETRO-GHOST-85 // TROFÉU</p>
        <span id="trophy-act" class="intro-act">ATO</span>
        <h2 id="trophy-title" tabindex="-1">Chegou ao ato</h2>
        <section class="narration-slot" aria-labelledby="trophy-narration-label">
          <h3 id="trophy-narration-label">O Mestre narra</h3>
          <p id="trophy-narration"></p>
          <ol id="trophy-path" class="endgame-path"></ol>
          <div class="narration-controls">
            <button id="btn-ouvir-trofeu" type="button">Ouvir o Mestre</button>
            <button id="btn-baixar-trofeu-ato" type="button">Baixar troféu (MP3)</button>
          </div>
        </section>
        <div class="intro-actions">
          <button id="btn-continuar-trofeu" class="intro-primary" type="button">CONTINUAR</button>
        </div>
      </div>
    </dialog>
  </main>
`;

const housesElement = document.querySelector<HTMLDivElement>(".houses")!;
const tokensElement = document.querySelector<HTMLDivElement>(".tokens")!;
const playerListElement = document.querySelector<HTMLDivElement>(".player-list")!;
const btnRolarDado = document.querySelector<HTMLButtonElement>("#btn-rolar-dado")!;
const btnAudio = document.querySelector<HTMLButtonElement>("#btn-audio")!;
const audioTrack = document.querySelector<HTMLElement>("#audio-track")!;
const audioVolume = document.querySelector<HTMLInputElement>("#audio-volume")!;
const btnSave = document.querySelector<HTMLButtonElement>("#btn-save")!;
const btnLoad = document.querySelector<HTMLButtonElement>("#btn-load")!;
const inputLoad = document.querySelector<HTMLInputElement>("#input-load")!;
const tapeFeedback = document.querySelector<HTMLElement>("#tape-feedback")!;
const boardGameLog = document.querySelector<HTMLElement>("#board-game-log")!;
const gameLogList = document.querySelector<HTMLElement>("#game-log-list")!;
const introDialog = document.querySelector<HTMLDialogElement>("#intro-dialog")!;
const openingSequence = document.querySelector<HTMLElement>("#opening-sequence")!;
const openingCredit = document.querySelector<HTMLElement>("#opening-credit")!;
const endgameDialog = document.querySelector<HTMLDialogElement>("#endgame-dialog")!;
const playerConfigList = document.querySelector<HTMLElement>("#player-config-list")!;
const playerCount = document.querySelector<HTMLOutputElement>("#player-count")!;
const setupSummary = document.querySelector<HTMLElement>("#setup-summary")!;
const setupError = document.querySelector<HTMLElement>("#setup-error")!;
const btnMenosPlayer = document.querySelector<HTMLButtonElement>("#btn-menos-player")!;
const btnMaisPlayer = document.querySelector<HTMLButtonElement>("#btn-mais-player")!;
const btnLoadSetup = document.querySelector<HTMLButtonElement>("#btn-load-setup")!;
const btnIniciarJornada = document.querySelector<HTMLButtonElement>("#btn-iniciar-jornada")!;
const btnReabrirEndgame = document.querySelector<HTMLButtonElement>("#btn-reabrir-endgame")!;
const btnOuvirMestre = document.querySelector<HTMLButtonElement>("#btn-ouvir-mestre")!;
const btnBaixarTrofeu = document.querySelector<HTMLButtonElement>("#btn-baixar-trofeu")!;
const btnOuvirTrofeu = document.querySelector<HTMLButtonElement>("#btn-ouvir-trofeu")!;
const btnBaixarTrofeuAto = document.querySelector<HTMLButtonElement>("#btn-baixar-trofeu-ato")!;
const trophyDialog = document.querySelector<HTMLDialogElement>("#trophy-dialog")!;
const trophyTitle = document.querySelector<HTMLElement>("#trophy-title")!;
const trophyAct = document.querySelector<HTMLElement>("#trophy-act")!;
const trophyNarration = document.querySelector<HTMLElement>("#trophy-narration")!;
let filaTrofeus: ChaveTrofeu[] = [];
let trofeuEmExibicao: ChaveTrofeu | null = null;
let ignorarFechamentoTrofeu = false;

const trilha = new ControleDeAudio((ligado, nome) => {
  btnAudio.textContent = ligado ? "AUDIO ON" : "AUDIO OFF";
  btnAudio.setAttribute("aria-pressed", String(ligado));
  audioTrack.textContent = nome;
});
function ligarTrilhaNoPrimeiroGesto() {
  const tentar = () => {
    void trilha.desbloquear().then((ok) => {
      if (!ok) return;
      document.removeEventListener("pointerdown", tentar);
      document.removeEventListener("keydown", tentar);
    });
  };
  document.addEventListener("pointerdown", tentar);
  document.addEventListener("keydown", tentar);
}
ligarTrilhaNoPrimeiroGesto();
prepararBotoesNarracao(btnOuvirMestre, btnBaixarTrofeu);
prepararBotoesNarracao(btnOuvirTrofeu, btnBaixarTrofeuAto);

function escaparHtml(valor: string): string {
  return valor.replace(/[&<>'"]/g, (caractere) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[caractere]!);
}

function renderSetup() {
  playerCount.value = String(rascunho.length);
  btnMenosPlayer.disabled = rascunho.length === 1;
  btnMaisPlayer.disabled = rascunho.length === 4;
  let numeroCpu = 0;
  playerConfigList.innerHTML = rascunho.map((configuracao, index) => {
    if (configuracao.controle === "cpu") numeroCpu += 1;
    const nome = configuracao.controle === "cpu" ? `CPU-${numeroCpu}` : (configuracao.nome ?? `Jogador ${index + 1}`);
    return `<div class="player-config-row">
      <b>P${index + 1}</b>
      <select data-config-control="${index}" aria-label="Controle do participante ${index + 1}">
        <option value="humano"${configuracao.controle === "humano" ? " selected" : ""}>HUMANO</option>
        <option value="cpu"${configuracao.controle === "cpu" ? " selected" : ""}>CPU LOCAL</option>
      </select>
      <input data-config-name="${index}" value="${escaparHtml(nome)}" maxlength="24" aria-label="Nome do participante ${index + 1}"${configuracao.controle === "cpu" ? " disabled" : ""} />
    </div>`;
  }).join("");
  try {
    setupSummary.textContent = confirmarAssentos(lerAssentosDoFormulario()).resumo;
    setupError.textContent = "";
  } catch (erro) {
    setupSummary.textContent = "";
    setupError.textContent = erro instanceof Error ? erro.message : "Configuração inválida";
  }

  playerConfigList.querySelectorAll<HTMLSelectElement>("[data-config-control]").forEach((select) => {
    select.addEventListener("change", () => {
      rascunho = lerAssentosDoFormulario();
      renderSetup();
    });
  });
}

function lerAssentosDoFormulario(): ConfiguracaoJogador[] {
  return [...playerConfigList.querySelectorAll<HTMLElement>(".player-config-row")].map((linha) => {
    const controle = linha.querySelector("select")!.value as Jogador["controle"];
    const nome = linha.querySelector("input")!.value;
    return { controle, nome: controle === "humano" ? nome : undefined };
  });
}

function mostrarSetup() {
  if (confirmados.length) rascunho = clonarAssentos(confirmados);
  renderSetup();
  btnIniciarJornada.focus();
}

function atualizarTrilha(venceu = false) {
  const maiorAto = maiorAtoAlcancado(jogadores.map((jogador) => jogador.actsVisitados));
  if (atoMusical === 0 && !venceu) return;
  atoMusical = Math.max(atoMusical, maiorAto);
  if (sessao) sessao = { ...sessao, atoMusical };
  void trilha.tocar(proximaTrilha(atoMusical, maiorAto, venceu));
}

function prepararBotoesNarracao(ouvir: HTMLButtonElement, baixar: HTMLButtonElement) {
  const motivo = narrador.motivoIndisponivel;
  ouvir.disabled = !narrador.disponivel;
  baixar.disabled = !narrador.disponivel;
  ouvir.title = motivo;
  baixar.title = motivo;
  ouvir.setAttribute("aria-disabled", String(!narrador.disponivel));
  baixar.setAttribute("aria-disabled", String(!narrador.disponivel));
}

function pedidoNarracao(chave: ChaveTrofeu): PedidoNarracao | null {
  if (!sessao) return null;
  const trofeu = sessao.trofeus[chave];
  if (!trofeu) return null;
  return {
    tipo: chave === "endgame" ? "endgame" : "ato",
    chave,
    jogadorId: trofeu.jogadorId,
    trajetoria: getPlayerTrajectory(sessao.log, trofeu.jogadorId),
  };
}

async function acionarNarrador(chave: ChaveTrofeu, acao: "ouvir" | "baixar") {
  const pedido = pedidoNarracao(chave);
  if (!pedido || !narrador.disponivel) return;
  if (acao === "ouvir") await narrador.narrar(pedido);
  else await narrador.baixarTrofeu(pedido);
}

function mostrarFeedbackCassete(mensagem: string, erro = false) {
  tapeFeedback.textContent = mensagem;
  tapeFeedback.classList.toggle("is-error", erro);
  window.setTimeout(() => { if (tapeFeedback.textContent === mensagem) tapeFeedback.textContent = ""; }, 4500);
}

function estadoParaSalvar(): EstadoPartida {
  if (sessao) return sessao;
  const assentos = confirmados.length ? confirmados : rascunho;
  const previa = criarJogadores(assentos);
  return {
    assentos: clonarAssentos(assentos),
    jogadores: previa,
    jogadorAtivo: 1,
    jogadorSelecionado: 1,
    casaAtiva: 1,
    atoMusical: 0,
    partidaIniciada: false,
    partidaEncerrada: false,
    turno: 0,
    log: [],
    trofeus: trofeusVazios(),
    rng: novoEstadoRng(),
  };
}

function salvarPartida() {
  const arquivo = new Blob([serializarSave(paraEstadoSalvo(estadoParaSalvar()))], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = `retro-ghost-85-save-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
  mostrarFeedbackCassete("REC · PARTIDA GRAVADA");
}

function sincronizarVista() {
  if (!sessao) return;
  jogadores = sessao.jogadores;
  jogadorAtivo = sessao.jogadorAtivo;
  jogadorSelecionado = sessao.jogadorSelecionado;
  casaAtiva = sessao.casaAtiva;
  atoMusical = sessao.atoMusical;
  partidaIniciada = sessao.partidaIniciada;
  partidaEncerrada = sessao.partidaEncerrada;
}

function renderLog() {
  const entradas = sessao?.log ?? [];
  if (!entradas.length) {
    gameLogList.innerHTML = `<li class="is-latest"><span>SISTEMA PRONTO · CONFIGURE A PARTIDA</span></li>`;
    return;
  }
  gameLogList.innerHTML = entradas.map((entrada, indice) => {
    const linha = formatarLinhaLog(entrada);
    return `<li class="${indice === entradas.length - 1 ? "is-latest" : ""}" style="--player-color:${entrada.cor}" title="${escaparHtml(linha)}"><i class="log-pip" aria-hidden="true"></i><span>${escaparHtml(linha)}</span></li>`;
  }).join("");
  boardGameLog.scrollTop = boardGameLog.scrollHeight;
}

function fecharTrofeuSemRetomar() {
  filaTrofeus = [];
  trofeuEmExibicao = null;
  if (!trophyDialog.open) return;
  ignorarFechamentoTrofeu = true;
  trophyDialog.close();
  ignorarFechamentoTrofeu = false;
}

function apresentarTrofeu(chave: ChaveTrofeu, nome: string) {
  if (!sessao) return;
  trofeuEmExibicao = chave;
  const trofeu = sessao.trofeus[chave];
  const dono = trofeu ? sessao.jogadores.find((jogador) => jogador.id === trofeu.jogadorId)?.nome ?? nome : nome;
  const trajetoria = getPlayerTrajectory(sessao.log, trofeu?.jogadorId ?? 0);
  trophyAct.textContent = NOME_TROFEU[chave].toUpperCase();
  trophyTitle.textContent = `${dono} chegou ao ${NOME_TROFEU[chave]}`;
  trophyNarration.textContent = textoMestre(trajetoria, dono);
  document.querySelector<HTMLElement>("#trophy-path")!.innerHTML = trajetoria.map((entrada) => `<li>${escaparHtml(formatarLinhaLog(entrada))}</li>`).join("");
  if (timerCpu !== undefined) window.clearTimeout(timerCpu);
  btnRolarDado.disabled = true;
  if (!trophyDialog.open) trophyDialog.showModal();
  trophyTitle.focus();
}

function enfileirarTrofeus(chaves: ChaveTrofeu[], nome: string): boolean {
  const atos = chaves.filter((chave) => chave !== "endgame");
  if (!atos.length) return false;
  filaTrofeus.push(...atos);
  if (!trophyDialog.open) {
    const proximo = filaTrofeus.shift();
    if (proximo) apresentarTrofeu(proximo, nome);
  }
  return trophyDialog.open;
}

function continuarTrofeu() {
  const proximo = filaTrofeus.shift();
  if (proximo && sessao) {
    const dono = sessao.jogadores.find((jogador) => jogador.id === sessao?.trofeus[proximo]?.jogadorId)?.nome ?? "";
    apresentarTrofeu(proximo, dono);
    return;
  }
  trophyDialog.close();
}

function retomarDepoisDoTrofeu() {
  if (ignorarFechamentoTrofeu) return;
  trofeuEmExibicao = null;
  if (sessao?.partidaEncerrada) {
    btnRolarDado.disabled = true;
    abrirEndgame();
    return;
  }
  agendarTurnoCpu();
}

function abrirEndgame() {
  if (!sessao) return;
  const tela = montarTelaEndgame(sessao);
  if (!tela) return;
  document.querySelector<HTMLElement>("#endgame-winner")!.textContent = `CONGRATULATIONS, ${tela.vencedorNome}! Você chegou ao Endgame e publicou o jogo.`;
  document.querySelector<HTMLElement>("#endgame-score")!.textContent = `Projeto final: ${tela.projeto}/100 · Rolagens de ${tela.vencedorNome}: ${tela.rolamentosVencedor} · Rolagens da mesa: ${tela.rolamentosMesa}`;
  document.querySelector<HTMLElement>("#endgame-narration")!.textContent = tela.narracao;
  document.querySelector<HTMLElement>("#endgame-path")!.innerHTML = tela.trajetoria.map((entrada) => `<li>${escaparHtml(formatarLinhaLog(entrada))}</li>`).join("");
  document.querySelector<HTMLElement>("#endgame-ranking")!.innerHTML = tela.ranking.map((linha, indice) => {
    const trofeus = linha.trofeus.length ? linha.trofeus.map((chave) => NOME_TROFEU[chave]).join(", ") : "sem troféu de ato";
    return `<li><b>${indice + 1}. ${escaparHtml(linha.nome)}</b> · casa ${linha.casa} · ${linha.projeto}/100 · ${escaparHtml(trofeus)}</li>`;
  }).join("");
  if (!endgameDialog.open) endgameDialog.showModal();
  document.querySelector<HTMLElement>("#endgame-title")!.focus();
  btnReabrirEndgame.hidden = true;
}

function assumirSessao(partida: EstadoPartida) {
  fecharTrofeuSemRetomar();
  sessao = partida;
  confirmados = clonarAssentos(partida.assentos);
  rascunho = clonarAssentos(partida.assentos);
  sincronizarVista();
  document.querySelector<HTMLElement>("#einstein-easter-egg")!.hidden = !jogadores.some((jogador) => jogador.actsVisitados.length === 4);
  renderHouses();
  renderPlayers();
  updateInspector(casas[casaAtiva - 1]);
  bindHouseEvents();
  bindPlayerEvents();
  renderLog();
  btnRolarDado.disabled = partidaEncerrada || !partidaIniciada;
  if (endgameDialog.open) endgameDialog.close();
  if (partidaIniciada && introDialog.open) introDialog.close();
  if (!partidaIniciada) {
    if (!introDialog.open) introDialog.showModal();
    mostrarSetup();
  }
  atualizarTrilha(partidaEncerrada);
  if (partidaEncerrada) abrirEndgame();
  else btnReabrirEndgame.hidden = true;
  agendarTurnoCpu();
}

async function carregarPartida(arquivo: File) {
  try {
    assumirSessao(daEstadoSalvo(desserializarSave(await arquivo.text())));
    mostrarFeedbackCassete("PLAY · PARTIDA CARREGADA");
  } catch (erro) {
    mostrarFeedbackCassete(erro instanceof Error ? erro.message : "SAVE INVÁLIDO", true);
  } finally {
    inputLoad.value = "";
  }
}

const pontosPorFace: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

function renderDiceFace(element: HTMLElement, value: number) {
  const pontosAtivos = pontosPorFace[value];
  if (!pontosAtivos) return;

  element.dataset.value = String(value);
  element.setAttribute("aria-label", `Dado mostrando ${value}`);
  element.innerHTML = Array.from({ length: 9 }, (_, index) => {
    const position = index + 1;
    return `<span class="dice-pip${pontosAtivos.includes(position) ? " is-active" : ""}" aria-hidden="true"></span>`;
  }).join("");
}

document.querySelectorAll<HTMLElement>(".dice-face").forEach((face) => renderDiceFace(face, 1));

function renderHouses() {
  housesElement.innerHTML = casas.map((casa) => `
    <button
      class="house-hotspot ${casa.id === casaAtiva ? "is-active" : ""}"
      type="button"
      style="--x:${casa.x}%;--y:${casa.y}%;--w:${casa.width}%;--h:${casa.height}%"
      data-house="${casa.id}"
      aria-label="Casa ${casa.id}: ${casa.titulo}"
      aria-pressed="${casa.id === casaAtiva}"
    ><span>${casa.id}</span></button>
  `).join("");
}

function renderPlayers() {
  playerListElement.innerHTML = jogadores.map((jogador) => {
    const nome = escaparHtml(jogador.nome);
    return `
    <button class="player-card ${jogador.controle === "cpu" ? "is-cpu" : ""} ${jogador.id === jogadorAtivo ? "is-active" : ""} ${jogador.id === jogadorSelecionado ? "is-selected" : ""}" type="button" data-player="${jogador.id}" style="--player-color:${jogador.cor}" aria-label="${nome}, ${jogador.controle === "cpu" ? "CPU local" : "humano"}, casa ${jogador.casa}, projeto ${jogador.projeto} de 100, ACTS ${jogador.actsVisitados.length} de 4${jogador.id === jogadorAtivo ? ", sua vez" : ""}">
      <img src="${jogador.imagem}" alt="" />
      <span><b>P${jogador.id}</b>${nome}</span>
      <small>${jogador.controle === "cpu" ? "CPU" : "HUM"} · CASA ${String(jogador.casa).padStart(2, "0")} · ${jogador.projeto}/100</small>
    </button>
  `;
  }).join("");

  tokensElement.innerHTML = jogadores.map((jogador) => {
    const casa = casas[jogador.casa - 1];
    const ocupantes = jogadores.filter((item) => item.casa === jogador.casa);
    const indiceNaCasa = ocupantes.findIndex((item) => item.id === jogador.id);
    const { x, y } = posicaoDaPeca(casa, indiceNaCasa, ocupantes.length);
    return `
    <button class="player-token ${jogador.controle === "cpu" ? "is-cpu" : ""} ${jogador.id === jogadorAtivo ? "is-active" : ""}" type="button" data-player="${jogador.id}" aria-label="${escaparHtml(jogador.nome)}, ${jogador.controle === "cpu" ? "CPU local" : "humano"}, casa ${jogador.casa}, projeto ${jogador.projeto} de 100, ACTS ${jogador.actsVisitados.length} de 4" style="--player-color:${jogador.cor};--tx:${x}%;--ty:${y}%">
      <img src="${jogador.imagem}" alt="" />
      <span>P${jogador.id}</span>
    </button>
  `;
  }).join("");
  const selecionado = jogadores[jogadorSelecionado - 1];
  document.querySelector<HTMLElement>(".act-progress")!.textContent = `ACTS do ${selecionado.nome}: ${selecionado.actsVisitados.length}/4`;
}

function updateInspector(casa: Casa) {
  const inicioAct1 = casa.id === 1;
  document.querySelector<HTMLElement>(".counter")!.textContent = `${String(casa.id).padStart(2, "0")}/40`;
  document.querySelector<HTMLElement>(".house-number")!.textContent = String(casa.id).padStart(2, "0");
  const chip = document.querySelector<HTMLElement>(".type-chip")!;
  chip.textContent = casa.tipo.toUpperCase();
  chip.dataset.type = casa.tipo;
  document.querySelector<HTMLElement>(".inspector h2")!.textContent = casa.titulo;
  const effect = document.querySelector<HTMLElement>(".effect")!;
  effect.textContent = casa.efeito;
  effect.dataset.type = casa.tipo;
  const narrative = document.querySelector<HTMLElement>(".narrative")!;
  narrative.textContent = casa.narrativa;
  narrative.classList.toggle("is-act", casa.id === 10 || casa.id === 20 || casa.id === 30 || inicioAct1);
  if (inicioAct1) {
    document.querySelector<HTMLElement>(".inspector h2")!.textContent = atos[1].titulo;
    chip.textContent = "PRÓLOGO";
    chip.dataset.type = "marco";
    effect.textContent = "Ponto de partida · sem efeito";
    effect.dataset.type = "marco";
    narrative.textContent = atos[1].narrativa;
  }
}

function selectHouse(id: number) {
  casaAtiva = id;
  if (sessao) sessao = { ...sessao, casaAtiva: id };
  renderHouses();
  updateInspector(casas[id - 1]);
  bindHouseEvents();
}

function selectPlayer(id: number) {
  jogadorSelecionado = id;
  if (sessao) sessao = { ...sessao, jogadorSelecionado: id };
  renderPlayers();
  bindPlayerEvents();
  selectHouse(jogadores[id - 1].casa);
}

function jogoPausado(): boolean {
  return trophyDialog.open;
}

async function executarSorteioDado(automatico = false) {
  if (jogoPausado()) return;
  if (!partidaIniciada || !podeIniciarJogada(rolandoDado, partidaEncerrada)) return;
  const cpuAtual = turnoDaCpu(jogadores, jogadorAtivo, partidaIniciada, partidaEncerrada);
  if ((cpuAtual && !automatico) || (!cpuAtual && automatico)) return;
  await trilha.desbloquear();
  rolandoDado = true;

  const faceElements = Array.from(document.querySelectorAll<HTMLElement>(".dice-face"));
  const valueEl = document.querySelector<HTMLElement>(".dice-value");
  const subEl = document.querySelector<HTMLElement>(".dice-sub");
  const statusEl = document.querySelector<HTMLElement>(".dice-status");

  if (btnRolarDado) btnRolarDado.disabled = true;
  faceElements.forEach((face) => face.classList.add("rolling"));

  const jogador = jogadores[jogadorAtivo - 1];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    const ciclos = 14;
    for (let i = 0; i < ciclos; i++) {
      const faceTemp = Math.floor(Math.random() * 6) + 1;
      faceElements.forEach((face) => renderDiceFace(face, faceTemp));
      if (valueEl) valueEl.textContent = String(faceTemp);
      await new Promise((resolve) => setTimeout(resolve, 55));
    }
  }

  if (!sessao) {
    faceElements.forEach((face) => face.classList.remove("rolling"));
    rolandoDado = false;
    agendarTurnoCpu();
    return;
  }
  const gerador = criarRngComEstado(sessao.rng);
  const dado = rolarD6(gerador.aleatorio);
  const registro = registrarJogada(
    { ...sessao, rng: gerador.snapshot() },
    { dado: dado.valor },
    casas,
  );
  sessao = registro.estado;
  sincronizarVista();

  faceElements.forEach((face) => {
    face.classList.remove("rolling");
    renderDiceFace(face, dado.valor);
    face.classList.remove("is-result");
    void face.offsetWidth;
    face.classList.add("is-result");
  });
  if (valueEl) {
    valueEl.textContent = String(dado.valor);
  }
  if (subEl) subEl.textContent = `RESULTADO: ${dado.valor} · AVANCE ${dado.valor} CASA${dado.valor === 1 ? "" : "S"}`;
  if (registro.easterEggDesbloqueado) {
    document.querySelector<HTMLElement>("#einstein-easter-egg")!.hidden = false;
  }
  atualizarTrilha(registro.entrada.vitoria);
  renderPlayers();
  bindPlayerEvents();
  selectHouse(registro.entrada.casaDestino);
  renderLog();
  const log = formatarGamelog({
    jogador: jogador.nome,
    dado: dado.valor,
    casaDestino: registro.entrada.casaDestino,
    casaFinal: registro.entrada.casaFinal,
    projeto: registro.entrada.projeto,
    venceu: registro.entrada.vitoria,
    jogadaExtra: registro.entrada.jogadaExtra,
    proximoJogador: registro.entrada.vitoria || registro.entrada.jogadaExtra ? undefined : jogadores[jogadorAtivo - 1].nome,
    ignorados: registro.ignorados,
    easterEgg: registro.easterEggDesbloqueado,
  });
  if (statusEl) statusEl.textContent = log.completo;
  const pausa = enfileirarTrofeus(registro.novosTrofeus, jogador.nome);
  rolandoDado = false;
  if (pausa) return;
  if (registro.entrada.vitoria) abrirEndgame();
  agendarTurnoCpu();
}

function bindHouseEvents() {
  document.querySelectorAll<HTMLButtonElement>(".house-hotspot").forEach((button) => {
    button.addEventListener("click", () => selectHouse(Number(button.dataset.house)));
  });
}

function bindPlayerEvents() {
  document.querySelectorAll<HTMLButtonElement>("[data-player]").forEach((button) => {
    button.addEventListener("click", () => selectPlayer(Number(button.dataset.player)));
  });
}

function agendarTurnoCpu() {
  if (timerCpu !== undefined) window.clearTimeout(timerCpu);
  if (jogoPausado()) {
    btnRolarDado.disabled = true;
    return;
  }
  const cpu = turnoDaCpu(jogadores, jogadorAtivo, partidaIniciada, partidaEncerrada);
  btnRolarDado.disabled = !partidaIniciada || partidaEncerrada || cpu;
  if (!cpu) return;
  const atual = jogadores[jogadorAtivo - 1];
  document.querySelector<HTMLElement>(".dice-status")!.innerHTML = `<strong>${escaparHtml(atual.nome)}</strong> está preparando a jogada automática...`;
  timerCpu = window.setTimeout(() => { void executarSorteioDado(true); }, 900);
}

function iniciarJornada() {
  try {
    const confirmacao = confirmarAssentos(lerAssentosDoFormulario());
    confirmados = confirmacao.assentos;
    rascunho = clonarAssentos(confirmacao.assentos);
    setupError.textContent = "";
    sessao = iniciarPartida(confirmados, novoEstadoRng());
    sincronizarVista();
    introDialog.close();
    renderHouses();
    renderPlayers();
    updateInspector(casas[0]);
    bindHouseEvents();
    bindPlayerEvents();
    renderLog();
    void trilha.desbloquear().then(() => atualizarTrilha());
    const nome = jogadores[0]?.nome ?? "Jogador 1";
    document.querySelector<HTMLElement>(".dice-status")!.innerHTML = `Vez de <strong>${escaparHtml(nome)}</strong>. Clique para rolar o dado.`;
    agendarTurnoCpu();
    if (!btnRolarDado.disabled) btnRolarDado.focus();
  } catch (erro) {
    setupError.textContent = erro instanceof Error ? erro.message : "Configuração inválida";
  }
}

function novaPartida() {
  const assentos = confirmados.length ? clonarAssentos(confirmados) : clonarAssentos(rascunho);
  sessao = null;
  confirmados = [];
  rascunho = assentos;
  jogadores = criarJogadores(assentos);
  casaAtiva = 1;
  jogadorAtivo = 1;
  jogadorSelecionado = 1;
  atoMusical = 0;
  partidaIniciada = false;
  partidaEncerrada = false;
  rolandoDado = false;
  if (timerCpu !== undefined) window.clearTimeout(timerCpu);
  fecharTrofeuSemRetomar();
  btnReabrirEndgame.hidden = true;
  if (endgameDialog.open) endgameDialog.close();
  document.querySelector<HTMLElement>("#einstein-easter-egg")!.hidden = true;
  document.querySelector<HTMLElement>(".dice-status")!.textContent = "Inicie a jornada para liberar o dado.";
  renderHouses();
  renderPlayers();
  updateInspector(casas[0]);
  renderLog();
  bindHouseEvents();
  bindPlayerEvents();
  void trilha.tocar("intro");
  if (!introDialog.open) introDialog.showModal();
  mostrarSetup();
}

function iniciarApresentacao() {
  window.setTimeout(() => openingCredit.classList.add("is-visible"), 3_000);

  window.setTimeout(() => {
    openingSequence.classList.add("is-game-reveal");

    let encerrado = false;
    const encerrarApresentacao = (evento: Event) => {
      if (encerrado) return;
      encerrado = true;
      evento.preventDefault();
      evento.stopPropagation();
      window.removeEventListener("pointerdown", encerrarApresentacao);
      window.removeEventListener("keydown", encerrarApresentacao);
      openingSequence.hidden = true;
      if (!introDialog.open) introDialog.showModal();
    };

    window.addEventListener("pointerdown", encerrarApresentacao);
    window.addEventListener("keydown", encerrarApresentacao);
  }, 7_000);
}

renderHouses();
renderPlayers();
updateInspector(casas[0]);
bindHouseEvents();
bindPlayerEvents();
renderSetup();
renderLog();
iniciarApresentacao();
introDialog.addEventListener("cancel", (evento) => evento.preventDefault());
endgameDialog.addEventListener("close", () => {
  btnReabrirEndgame.hidden = !sessao?.partidaEncerrada;
});
boardGameLog.addEventListener("keydown", (evento) => {
  const pagina = boardGameLog.clientHeight;
  if (evento.key === "Home") boardGameLog.scrollTop = 0;
  else if (evento.key === "End") boardGameLog.scrollTop = boardGameLog.scrollHeight;
  else if (evento.key === "ArrowDown") boardGameLog.scrollTop += 24;
  else if (evento.key === "ArrowUp") boardGameLog.scrollTop -= 24;
  else if (evento.key === "PageDown") boardGameLog.scrollTop += pagina;
  else if (evento.key === "PageUp") boardGameLog.scrollTop -= pagina;
  else return;
  evento.preventDefault();
});

btnRolarDado.addEventListener("click", () => {
  executarSorteioDado(false);
});

btnAudio.addEventListener("click", () => { void trilha.alternar(); });
audioVolume.addEventListener("input", () => trilha.definirVolume(Number(audioVolume.value) / 100));
btnSave.addEventListener("click", salvarPartida);
btnLoad.addEventListener("click", () => inputLoad.click());
btnLoadSetup.addEventListener("click", () => inputLoad.click());
inputLoad.addEventListener("change", () => {
  const arquivo = inputLoad.files?.[0];
  if (arquivo) void carregarPartida(arquivo);
});
btnIniciarJornada.addEventListener("click", iniciarJornada);
btnReabrirEndgame.addEventListener("click", abrirEndgame);
document.querySelector<HTMLButtonElement>("#btn-ver-tabuleiro")!.addEventListener("click", () => endgameDialog.close());
document.querySelector<HTMLButtonElement>("#btn-nova-partida")!.addEventListener("click", novaPartida);
document.querySelector<HTMLButtonElement>("#btn-continuar-trofeu")!.addEventListener("click", continuarTrofeu);
trophyDialog.addEventListener("cancel", (evento) => {
  evento.preventDefault();
  continuarTrofeu();
});
trophyDialog.addEventListener("close", retomarDepoisDoTrofeu);
btnOuvirMestre.addEventListener("click", () => { void acionarNarrador("endgame", "ouvir"); });
btnBaixarTrofeu.addEventListener("click", () => { void acionarNarrador("endgame", "baixar"); });
btnOuvirTrofeu.addEventListener("click", () => { if (trofeuEmExibicao) void acionarNarrador(trofeuEmExibicao, "ouvir"); });
btnBaixarTrofeuAto.addEventListener("click", () => { if (trofeuEmExibicao) void acionarNarrador(trofeuEmExibicao, "baixar"); });
btnMenosPlayer.addEventListener("click", () => {
  const atuais = lerAssentosDoFormulario();
  rascunho = ajustarQuantidade(atuais, atuais.length - 1);
  renderSetup();
});
btnMaisPlayer.addEventListener("click", () => {
  const atuais = lerAssentosDoFormulario();
  rascunho = ajustarQuantidade(atuais, atuais.length + 1);
  renderSetup();
});

