import type { Idioma } from "./content.ts";
import { ui } from "./ui.ts";

/** Converts literal UI copy and accessibility labels without mutating game state.
 * The original PT string is retained for instant, lossless switching back.
 * Text created later by normal rendering is localized by a MutationObserver.
 */
export function instalarTradutorDaInterface(raiz: HTMLElement, idiomaInicial: Idioma) {
  let idioma = idiomaInicial;
  type Original = { pt: string; last: string };
  const textos = new WeakMap<Text, Original>();
  const atributos = new WeakMap<Element, Map<string, Original>>();
  const nomesAtributos = ["aria-label", "title", "alt", "placeholder"];
  const origemPadrao = (texto: string): string => texto;

  function textoDinamico(texto: string): string {
    const literal = ui(texto, idioma);
    if (idioma === "pt-BR" || literal !== texto) return literal;
    let m: RegExpMatchArray | null;
    if ((m = texto.match(/^Controle do participante (\d+)$/))) return `Player control ${m[1]}`;
    if ((m = texto.match(/^Nome do participante (\d+)$/))) return `Player name ${m[1]}`;
    if ((m = texto.match(/^Dado mostrando (\d+)$/))) return `Die showing ${m[1]}`;
    if ((m = texto.match(/^Casa (\d+): (.+)$/))) return `Square ${m[1]}: ${m[2]}`;
    if ((m = texto.match(/^ACTS do (.+): (\d+)\/4$/))) return `${m[1]}'s Acts: ${m[2]}/4`;
    if ((m = texto.match(/^Vez de (.+)\. Clique para rolar o dado\.$/))) return `${m[1]}'s turn. Click to roll the die.`;
    if ((m = texto.match(/^(.+) perdeu uma jogada\. Clique em PASSAR TURNO para cumprir a penalidade sem rolar o dado\.$/))) return `${m[1]} must skip a turn. Click SKIP TURN to serve the penalty without rolling.`;
    if ((m = texto.match(/^(.+) cumpriu a penalidade sem rolar o dado nem avançar\. Próxima jogada liberada\.$/))) return `${m[1]} skipped the turn without rolling or moving. Your next roll is ready.`;
    if ((m = texto.match(/^(.+) está preparando a jogada automática\.\.\.$/))) return `${m[1]} is preparing an automatic roll...`;
    if ((m = texto.match(/^RESULTADO: (\d+) · AVANCE \d+ CASAS?$/))) return `RESULT: ${m[1]} · ADVANCE ${m[1]} ${m[1] === "1" ? "SQUARE" : "SQUARES"}`;
    if ((m = texto.match(/^(.+), seu nome entrou no catálogo!$/))) return `${m[1]}, your name made it into the catalog!`;
    if ((m = texto.match(/^(.+) chegou ao Ato ([2-4])$/))) return `${m[1]} reached Act ${m[2]}`;
    if ((m = texto.match(/^Projeto final: (\d+)\/100 · Rolagens de (.+): (\d+) · Rolagens da mesa: (\d+)$/))) return `Final progress: ${m[1]}/100 · ${m[2]}'s rolls: ${m[3]} · Total rolls: ${m[4]}`;
    return texto;
  }

  function traduzirTexto(node: Text): void {
    const atual = node.nodeValue ?? "";
    const guardado = textos.get(node);
    if (guardado && atual === guardado.last) return;
    const texto = guardado ? origemPadrao(atual) : atual;
    const traduzido = textoDinamico(texto);
    textos.set(node, { pt: texto, last: traduzido });
    if (traduzido !== atual) node.nodeValue = traduzido;
  }

  function atualizarTextos(node: Text): void {
    const atual = node.nodeValue ?? "";
    const memo = textos.get(node);
    if (memo && atual !== memo.last) {
      // The game just wrote a new canonical string into this existing node.
      traduzirTexto(node);
      return;
    }
    const pt = memo?.pt ?? atual;
    const next = textoDinamico(pt);
    textos.set(node, {pt, last: next});
    if (atual !== next) node.nodeValue = next;
  }

  function atualizarAtributos(el: Element): void {
    let originais = atributos.get(el);
    if (!originais) { originais = new Map(); atributos.set(el, originais); }
    for (const atributo of nomesAtributos) {
      const atual = el.getAttribute(atributo);
      if (atual === null) continue;
      const memo = originais.get(atributo);
      const original = memo && atual === memo.last ? memo.pt : atual;
      const next = textoDinamico(original);
      originais.set(atributo, { pt: original, last: next });
      if (atual !== next) el.setAttribute(atributo, next);
    }
  }

  function percorrer(root: Node) {
    if (root.nodeType === Node.TEXT_NODE) { atualizarTextos(root as Text); return; }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const element = root as Element;
    if (element.matches("script,style")) return;
    atualizarAtributos(element);
    for (const child of element.childNodes) percorrer(child);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") percorrer(mutation.target);
      else if (mutation.type === "attributes") atualizarAtributos(mutation.target as Element);
      else for (const node of mutation.addedNodes) percorrer(node);
    }
  });

  function aplicar(novo: Idioma) {
    idioma = novo;
    document.documentElement.lang = idioma;
    document.documentElement.dataset.language = idioma;
    document.querySelector('meta[name="description"]')?.setAttribute("content", idioma === "pt-BR"
      ? "Retro-Ghost-85 — aventura de tabuleiro retrô para até quatro jogadores locais."
      : "Retro-Ghost-85 — a haunted 1985 computer board adventure for one to four local players.");
    const skip = document.querySelector(".skip-link");
    if (skip) skip.textContent = idioma === "pt-BR" ? "Ir para o tabuleiro" : "Skip to game board";
    document.querySelectorAll<HTMLButtonElement>("[data-language]").forEach(button => {
      const selected = button.dataset.language === idioma;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("is-selected", selected);
    });
    percorrer(raiz);
  }
  aplicar(idioma);
  observer.observe(raiz, {childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:nomesAtributos});
  return { aplicar, get idioma() { return idioma; }, desconectar: () => observer.disconnect() };
}
