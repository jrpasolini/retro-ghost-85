import "@fontsource/chakra-petch/latin-400.css";
import "@fontsource/chakra-petch/latin-600.css";
import "@fontsource/chakra-petch/latin-700.css";
import "@fontsource/press-start-2p/latin-400.css";
import "./style.css";
import { casas } from "./data/casas";
import type { Casa, Jogador } from "./types";

const jogadores: Jogador[] = [
  { id: 1, nome: "Jogador 1", cor: "#54f5c2", imagem: "./assets/player-1.webp", casa: 1 },
  { id: 2, nome: "Jogador 2", cor: "#ffd365", imagem: "./assets/player-2.webp", casa: 1 },
  { id: 3, nome: "Jogador 3", cor: "#48d8ff", imagem: "./assets/player-3.webp", casa: 1 },
  { id: 4, nome: "Jogador 4", cor: "#ff68bc", imagem: "./assets/player-4.webp", casa: 1 },
];

let casaAtiva = 1;
let jogadorAtivo = 1;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Elemento #app não encontrado");

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">RETRO COMPUTER SYSTEM • 1985</p>
        <h1>RETRO-GHOST-<span>85</span></h1>
      </div>
      <div class="status"><i></i> MVP VISUAL · ETAPA 1</div>
    </header>

    <section class="game-layout" aria-label="Protótipo do tabuleiro">
      <div class="board-column">
        <div id="tabuleiro" class="board-stage" role="group" aria-label="Tabuleiro com 40 casas">
          <img class="board-art" src="./assets/board-reference.webp" alt="Mesa retrô com computador, cassetes, disquetes, BBS e quarenta casas ao redor" />
          <div class="scanlines" aria-hidden="true"></div>
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
        <span class="type-chip">MARCO</span>
        <h2>A revista na banca</h2>
        <p class="effect-label">EFEITO PRELIMINAR</p>
        <p class="effect">+10 projeto</p>
        <p class="narrative">A narrativa detalhada desta casa será escrita na próxima etapa.</p>
        <div class="divider"></div>
        <p class="tip">Selecione qualquer casa no tabuleiro para inspecionar seu nome e efeito inicial.</p>
        <button class="secondary-action" type="button" disabled>JOGABILIDADE · PRÓXIMA ETAPA</button>
      </aside>
    </section>

    <footer>
      <span>BUILD 0.1.0</span>
      <span>40 CASAS · 4 JOGADORES LOCAIS · SEM IA NESTA ETAPA</span>
    </footer>
  </main>
`;

const housesElement = document.querySelector<HTMLDivElement>(".houses")!;
const tokensElement = document.querySelector<HTMLDivElement>(".tokens")!;
const playerListElement = document.querySelector<HTMLDivElement>(".player-list")!;

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
  playerListElement.innerHTML = jogadores.map((jogador) => `
    <button class="player-card ${jogador.id === jogadorAtivo ? "is-active" : ""}" type="button" data-player="${jogador.id}" style="--player-color:${jogador.cor}">
      <img src="${jogador.imagem}" alt="" />
      <span><b>P${jogador.id}</b>${jogador.nome}</span>
      <small>CASA ${String(jogador.casa).padStart(2, "0")}</small>
    </button>
  `).join("");

  const casaInicial = casas[0];
  tokensElement.innerHTML = jogadores.map((jogador, index) => `
    <button class="player-token ${jogador.id === jogadorAtivo ? "is-active" : ""}" type="button" data-player="${jogador.id}" aria-label="${jogador.nome}, casa ${jogador.casa}" style="--player-color:${jogador.cor};--tx:${casaInicial.x + 1 + index * 1.25}%;--ty:${casaInicial.y + 5.6}%">
      <img src="${jogador.imagem}" alt="" />
      <span>P${jogador.id}</span>
    </button>
  `).join("");
}

function updateInspector(casa: Casa) {
  document.querySelector<HTMLElement>(".counter")!.textContent = `${String(casa.id).padStart(2, "0")}/40`;
  document.querySelector<HTMLElement>(".house-number")!.textContent = String(casa.id).padStart(2, "0");
  const chip = document.querySelector<HTMLElement>(".type-chip")!;
  chip.textContent = casa.tipo.toUpperCase();
  chip.dataset.type = casa.tipo;
  document.querySelector<HTMLElement>(".inspector h2")!.textContent = casa.titulo;
  document.querySelector<HTMLElement>(".effect")!.textContent = casa.efeito;
}

function selectHouse(id: number) {
  casaAtiva = id;
  renderHouses();
  updateInspector(casas[id - 1]);
  bindHouseEvents();
}

function selectPlayer(id: number) {
  jogadorAtivo = id;
  renderPlayers();
  bindPlayerEvents();
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

renderHouses();
renderPlayers();
bindHouseEvents();
bindPlayerEvents();
