import "@fontsource/chakra-petch/latin-400.css";
import "@fontsource/chakra-petch/latin-600.css";
import "@fontsource/chakra-petch/latin-700.css";
import "@fontsource/press-start-2p/latin-400.css";
import "./style.css";
import { casas } from "./data/casas";
import { atos } from "./data/atos";
import type { Casa, Jogador } from "./types";
import { rolar2D6 } from "./motor/dado";
import { aplicarJogada } from "./motor/tabuleiro";
import { avancarTurno, podeIniciarJogada } from "./motor/turnos";
import { maiorAtoAlcancado, proximaTrilha } from "./motor/trilha";
import { ControleDeAudio } from "./audio";
import { desserializarSave, serializarSave, type EstadoSalvo } from "./estado/save";

let jogadores: Jogador[] = [
  { id: 1, nome: "Jogador 1", cor: "#54f5c2", imagem: "./assets/player-1.webp", casa: 1, projeto: 0, turnosPerdidos: 0, actsVisitados: [1] },
  { id: 2, nome: "Jogador 2", cor: "#ffd365", imagem: "./assets/player-2.webp", casa: 1, projeto: 0, turnosPerdidos: 0, actsVisitados: [1] },
  { id: 3, nome: "Jogador 3", cor: "#48d8ff", imagem: "./assets/player-3.webp", casa: 1, projeto: 0, turnosPerdidos: 0, actsVisitados: [1] },
  { id: 4, nome: "Jogador 4", cor: "#ff68bc", imagem: "./assets/player-4.webp", casa: 1, projeto: 0, turnosPerdidos: 0, actsVisitados: [1] },
];

let casaAtiva = 1;
let jogadorAtivo = 1;
let jogadorSelecionado = 1;
let rolandoDado = false;
let partidaIniciada = false;
let partidaEncerrada = false;
let atoMusical = 0;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Elemento #app não encontrado");

app.innerHTML = `
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
          <div class="endgame-cover" aria-hidden="true"><span>40</span><b>ENDGAME</b><small>PUBLICAÇÃO</small></div>
          <div id="einstein-easter-egg" class="easter-egg-screen" role="img" aria-label="Albert Einstein sorri na tela do computador" hidden>
            <img src="./assets/einstein-smile.webp" alt="" />
          </div>
          <div class="scanlines" aria-hidden="true"></div>
          <div class="cassette-deck" aria-label="Gravador de cassete para salvar e carregar a partida">
            <img src="./assets/cassette-save-load.webp" alt="Gravador de dados em cassete com teclas REC e PLAY" />
            <button id="btn-save" class="tape-key tape-key-save" type="button" aria-label="REC: salvar partida em arquivo Markdown"><b>REC</b><span>SAVE</span></button>
            <button id="btn-load" class="tape-key tape-key-load" type="button" aria-label="PLAY: carregar partida de arquivo Markdown"><b>PLAY</b><span>LOAD</span></button>
            <input id="input-load" type="file" accept=".md,text/markdown,text/plain" hidden />
            <span id="tape-feedback" class="tape-feedback" aria-live="polite"></span>
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
        <span class="type-chip">ACT 1</span>
        <h2>Ato 1 · BOOT</h2>
        <p class="effect-label">EFEITO DA CASA</p>
        <p class="effect"></p>
        <p class="narrative"></p>
        <p class="act-progress" aria-live="polite">ACTS do Jogador 1: 1/4</p>
        <div class="divider"></div>

        <div class="dice-panel" aria-label="Controle de rolagem dos dados">
          <div class="dice-panel-header">
            <span class="prompt">&gt; DADOS_LOCAL (2D6)</span>
            <span class="dice-tag">RNG PURO</span>
          </div>
          <div class="dice-display-area">
            <div class="dice-face" data-die="1" data-value="1" role="img" aria-label="Dado 1 mostrando 1"></div>
            <div class="dice-face" data-die="2" data-value="1" role="img" aria-label="Dado 2 mostrando 1"></div>
            <div class="dice-readout">
              <span class="dice-value">– + –</span>
              <span class="dice-sub">AGUARDANDO JOGADA</span>
            </div>
          </div>
          <button id="btn-rolar-dado" class="dice-btn" type="button" disabled>
            ROLAR DADOS
          </button>
          <div class="dice-status" aria-live="polite">
            Inicie a jornada para liberar os dados.
          </div>
        </div>

        <p class="tip" style="margin-top: .85rem;">Clique em qualquer casa ou jogador para inspecionar detalhes.</p>
      </aside>
    </section>

    <footer>
      <span>BUILD 0.4.0</span>
      <span>40 CASAS · 4 JOGADORES · 2D6 · SAVE/LOAD · TRILHA DINÂMICA</span>
    </footer>

    <dialog id="intro-dialog" class="intro-dialog" aria-labelledby="intro-title" aria-describedby="intro-copy">
      <div class="intro-terminal">
        <p class="intro-kicker">RETRO-GHOST-85 // SYSTEM READY</p>
        <span class="intro-act">ACT 1</span>
        <h2 id="intro-title">BOOT · A revista na banca</h2>
        <p id="intro-copy">${atos[1].narrativa}</p>
        <div class="intro-actions">
          <button id="btn-ouvir-intro" class="intro-secondary" type="button">OUVIR INTRO</button>
          <button id="btn-iniciar-jornada" class="intro-primary" type="button">INICIAR JORNADA</button>
        </div>
        <small>A partida começa na casa 1 · 4 jogadores locais · 2D6</small>
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
const introDialog = document.querySelector<HTMLDialogElement>("#intro-dialog")!;
const btnOuvirIntro = document.querySelector<HTMLButtonElement>("#btn-ouvir-intro")!;
const btnIniciarJornada = document.querySelector<HTMLButtonElement>("#btn-iniciar-jornada")!;

const trilha = new ControleDeAudio((ligado, nome) => {
  btnAudio.textContent = ligado ? "AUDIO ON" : "AUDIO OFF";
  btnAudio.setAttribute("aria-pressed", String(ligado));
  audioTrack.textContent = nome;
});
document.addEventListener("pointerdown", () => { void trilha.desbloquear(); }, { once: true });

function atualizarTrilha(venceu = false) {
  const maiorAto = maiorAtoAlcancado(jogadores.map((jogador) => jogador.actsVisitados));
  if (atoMusical === 0 && !venceu) return;
  atoMusical = Math.max(atoMusical, maiorAto);
  void trilha.tocar(proximaTrilha(atoMusical, maiorAto, venceu));
}

function estadoAtual(): EstadoSalvo {
  return {
    schema: 1,
    jogadorAtivo,
    jogadorSelecionado,
    casaAtiva,
    atoMusical,
    partidaIniciada,
    partidaEncerrada,
    jogadores: jogadores.map(({ id, casa, projeto, turnosPerdidos, actsVisitados }) => ({ id, casa, projeto, turnosPerdidos, actsVisitados })),
  };
}

function mostrarFeedbackCassete(mensagem: string, erro = false) {
  tapeFeedback.textContent = mensagem;
  tapeFeedback.classList.toggle("is-error", erro);
  window.setTimeout(() => { if (tapeFeedback.textContent === mensagem) tapeFeedback.textContent = ""; }, 4500);
}

function salvarPartida() {
  const arquivo = new Blob([serializarSave(estadoAtual())], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = `retro-ghost-85-save-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
  mostrarFeedbackCassete("REC · PARTIDA GRAVADA");
}

async function carregarPartida(arquivo: File) {
  try {
    const salvo = desserializarSave(await arquivo.text());
    jogadores = jogadores.map((jogador) => ({ ...jogador, ...salvo.jogadores.find((item) => item.id === jogador.id)! }));
    jogadorAtivo = salvo.jogadorAtivo;
    jogadorSelecionado = salvo.jogadorSelecionado;
    casaAtiva = salvo.casaAtiva;
    atoMusical = salvo.atoMusical;
    partidaIniciada = salvo.partidaIniciada;
    partidaEncerrada = salvo.partidaEncerrada;
    btnRolarDado.disabled = partidaEncerrada || !partidaIniciada;
    document.querySelector<HTMLElement>("#einstein-easter-egg")!.hidden = !jogadores.some((jogador) => jogador.actsVisitados.length === 4);
    renderHouses();
    renderPlayers();
    updateInspector(casas[casaAtiva - 1]);
    bindHouseEvents();
    bindPlayerEvents();
    if (partidaIniciada && introDialog.open) introDialog.close();
    if (!partidaIniciada && !introDialog.open) introDialog.showModal();
    atualizarTrilha(partidaEncerrada);
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
  element.setAttribute("aria-label", `Dado ${element.dataset.die} mostrando ${value}`);
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
  const deslocamentos = [
    { x: -1, y: -1.7 }, { x: 1, y: -1.7 },
    { x: -1, y: 1.7 }, { x: 1, y: 1.7 },
  ];
  playerListElement.innerHTML = jogadores.map((jogador) => `
    <button class="player-card ${jogador.id === jogadorAtivo ? "is-active" : ""} ${jogador.id === jogadorSelecionado ? "is-selected" : ""}" type="button" data-player="${jogador.id}" style="--player-color:${jogador.cor}" aria-label="${jogador.nome}, casa ${jogador.casa}, projeto ${jogador.projeto} de 100, ACTS ${jogador.actsVisitados.length} de 4${jogador.id === jogadorAtivo ? ", sua vez" : ""}">
      <img src="${jogador.imagem}" alt="" />
      <span><b>P${jogador.id}</b>${jogador.nome}</span>
      <small>CASA ${String(jogador.casa).padStart(2, "0")} · ${jogador.projeto}/100</small>
    </button>
  `).join("");

  tokensElement.innerHTML = jogadores.map((jogador, index) => `
    <button class="player-token ${jogador.id === jogadorAtivo ? "is-active" : ""}" type="button" data-player="${jogador.id}" aria-label="${jogador.nome}, casa ${jogador.casa}, projeto ${jogador.projeto} de 100, ACTS ${jogador.actsVisitados.length} de 4" style="--player-color:${jogador.cor};--tx:${casas[jogador.casa - 1].x + casas[jogador.casa - 1].width / 2 + deslocamentos[index].x}%;--ty:${casas[jogador.casa - 1].y + casas[jogador.casa - 1].height / 2 + deslocamentos[index].y}%">
      <img src="${jogador.imagem}" alt="" />
      <span>P${jogador.id}</span>
    </button>
  `).join("");
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
    chip.textContent = "ACT 1";
    chip.dataset.type = "marco";
    effect.textContent = "Ponto de partida · sem efeito";
    effect.dataset.type = "marco";
    narrative.textContent = atos[1].narrativa;
  }
}

function selectHouse(id: number) {
  casaAtiva = id;
  renderHouses();
  updateInspector(casas[id - 1]);
  bindHouseEvents();
}

function selectPlayer(id: number) {
  jogadorSelecionado = id;
  renderPlayers();
  bindPlayerEvents();
  selectHouse(jogadores[id - 1].casa);
}

async function executarSorteioDado() {
  if (!partidaIniciada || !podeIniciarJogada(rolandoDado, partidaEncerrada)) return;
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
      const facesTemp = faceElements.map(() => Math.floor(Math.random() * 6) + 1);
      faceElements.forEach((face, index) => renderDiceFace(face, facesTemp[index]));
      if (valueEl) valueEl.textContent = facesTemp.join(" + ");
      await new Promise((resolve) => setTimeout(resolve, 55));
    }
  }

  const { dados, total } = rolar2D6();

  faceElements.forEach((face, index) => {
    face.classList.remove("rolling");
    renderDiceFace(face, dados[index].valor);
    face.classList.remove("is-result");
    void face.offsetWidth;
    face.classList.add("is-result");
  });
  if (valueEl) {
    valueEl.textContent = `${dados[0].valor} + ${dados[1].valor} = ${total}`;
  }
  if (subEl) subEl.textContent = `TOTAL: ${total} · AVANCE ${total} CASAS`;
  const resultado = aplicarJogada(jogador, total, casas);
  jogadores[jogadorAtivo - 1] = resultado.jogador;
  jogadorSelecionado = jogadorAtivo;
  if (resultado.easterEggDesbloqueado) {
    document.querySelector<HTMLElement>("#einstein-easter-egg")!.hidden = false;
  }
  if (resultado.venceu) partidaEncerrada = true;
  atualizarTrilha(resultado.venceu);
  const turno = !resultado.venceu && !resultado.jogadaExtra
    ? avancarTurno(jogadores, jogadorAtivo)
    : { jogadores, jogadorAtivo, ignorados: [] as string[] };
  jogadores = turno.jogadores;
  jogadorAtivo = turno.jogadorAtivo;
  const ignorados = turno.ignorados;
  renderPlayers();
  bindPlayerEvents();
  selectHouse(resultado.casa.id);
  if (statusEl) {
    const desfecho = resultado.venceu
      ? ` Vitória! ${jogador.nome} publicou o jogo.`
      : resultado.recusouFinal
        ? " Projeto abaixo de 100: volte à casa 30."
        : resultado.jogadaExtra
          ? " Jogue outra vez."
          : ` Próxima vez: ${jogadores[jogadorAtivo - 1].nome}.`;
    statusEl.textContent = `${jogador.nome} tirou ${dados[0].valor} + ${dados[1].valor} = ${total}, caiu na casa ${resultado.casa.id} e ficou na casa ${resultado.jogador.casa}. Projeto: ${resultado.jogador.projeto}/100.${desfecho}${ignorados.length ? ` Perderam a vez: ${ignorados.join(", ")}.` : ""}${resultado.easterEggDesbloqueado ? " Easter egg: Einstein apareceu sorrindo no monitor!" : ""}`;
  }

  if (btnRolarDado) btnRolarDado.disabled = partidaEncerrada;
  rolandoDado = false;
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

function iniciarJornada() {
  partidaIniciada = true;
  atoMusical = 1;
  introDialog.close();
  btnRolarDado.disabled = false;
  document.querySelector<HTMLElement>(".dice-status")!.innerHTML = "Vez de <strong>Jogador 1</strong>. Clique para rolar os dados.";
  void trilha.desbloquear().then(() => atualizarTrilha());
}

renderHouses();
renderPlayers();
updateInspector(casas[0]);
bindHouseEvents();
bindPlayerEvents();
introDialog.showModal();
introDialog.addEventListener("cancel", (evento) => evento.preventDefault());

btnRolarDado.addEventListener("click", () => {
  executarSorteioDado();
});

btnAudio.addEventListener("click", () => { void trilha.alternar(); });
audioVolume.addEventListener("input", () => trilha.definirVolume(Number(audioVolume.value) / 100));
btnSave.addEventListener("click", salvarPartida);
btnLoad.addEventListener("click", () => inputLoad.click());
inputLoad.addEventListener("change", () => {
  const arquivo = inputLoad.files?.[0];
  if (arquivo) void carregarPartida(arquivo);
});
btnOuvirIntro.addEventListener("click", () => {
  void trilha.desbloquear();
  btnOuvirIntro.textContent = "INTRO TOCANDO";
  btnOuvirIntro.disabled = true;
});
btnIniciarJornada.addEventListener("click", iniciarJornada);

