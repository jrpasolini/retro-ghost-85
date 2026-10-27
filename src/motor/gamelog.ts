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

export function formatarGamelog(dados: DadosDoGamelog): { completo: string; compacto: string } {
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
