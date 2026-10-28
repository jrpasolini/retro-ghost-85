import type { Idioma } from "../i18n/content.ts";

export type DadosDoGamelog = {
  jogador: string;
  dado: number;
  casaDestino: number;
  casaFinal: number;
  projeto: number;
  venceu: boolean;
  jogadaExtra: boolean;
  proximoJogador?: string;
  ignorados?: string[];
  easterEgg?: boolean;
};

export function formatarGamelog(dados: DadosDoGamelog, idioma: Idioma = "pt-BR"): { completo: string; compacto: string } {
  if (idioma === "en-US") {
    const square = dados.casaDestino === dados.casaFinal
      ? `square ${dados.casaFinal}`
      : `square ${dados.casaDestino} and finished on square ${dados.casaFinal}`;
    const outcome = dados.venceu ? ` Victory! ${dados.jogador} published the game.`
      : dados.jogadaExtra ? " Roll again."
      : dados.proximoJogador ? ` Next turn: ${dados.proximoJogador}.` : "";
    const missed = dados.ignorados?.length ? ` Skipped turns: ${dados.ignorados.join(", ")}.` : "";
    const egg = dados.easterEgg ? " Easter egg: Einstein smiles from the monitor!" : "";
    const move = dados.casaDestino === dados.casaFinal ? String(dados.casaFinal) : `${dados.casaDestino}→${dados.casaFinal}`;
    const suffix = dados.venceu ? " · VICTORY" : dados.jogadaExtra ? " · ROLL AGAIN" : dados.proximoJogador ? ` · TURN: ${dados.proximoJogador}` : "";
    return {
      completo: `${dados.jogador} rolled ${dados.dado} and landed on ${square}. Progress: ${dados.projeto}/100.${outcome}${missed}${egg}`,
      compacto: `${dados.jogador}: DIE ${dados.dado} · SQUARE ${move} · ${dados.projeto}/100${suffix}`,
    };
  }
  const movimento = dados.casaDestino === dados.casaFinal
    ? `casa ${dados.casaFinal}`
    : `casa ${dados.casaDestino} e ficou na casa ${dados.casaFinal}`;
  const desfecho = dados.venceu
    ? ` Vitória! ${dados.jogador} publicou o jogo.`
    : dados.jogadaExtra
      ? " Jogue outra vez."
      : dados.proximoJogador
        ? ` Próxima vez: ${dados.proximoJogador}.`
        : "";
  const pulados = dados.ignorados?.length ? ` Perderam a vez: ${dados.ignorados.join(", ")}.` : "";
  const easterEgg = dados.easterEgg ? " Easter egg: Einstein apareceu sorrindo no monitor!" : "";
  const seta = dados.casaDestino === dados.casaFinal ? String(dados.casaFinal) : `${dados.casaDestino}→${dados.casaFinal}`;
  const sufixo = dados.venceu
    ? " · VITÓRIA"
    : dados.jogadaExtra
      ? " · JOGUE NOVAMENTE"
      : dados.proximoJogador
        ? ` · VEZ: ${dados.proximoJogador}`
        : "";

  return {
    completo: `${dados.jogador} tirou ${dados.dado}, caiu na ${movimento}. Projeto: ${dados.projeto}/100.${desfecho}${pulados}${easterEgg}`,
    compacto: `${dados.jogador}: DADO ${dados.dado} · CASA ${seta} · ${dados.projeto}/100${sufixo}`,
  };
}
