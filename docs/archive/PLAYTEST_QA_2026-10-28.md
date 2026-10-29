> **Historical archive.** This document records earlier planning or QA and may describe superseded behavior. Use the [current documentation](../README.md) and [project README](../../README.md) for the implemented version.

# Playtest QA — 28/10/2026

Sessão de teste jogada em produção (`retro-ghost-85.onrender.com`), build **0.6.0**,
com duas partidas: uma solo e uma de dois jogadores humanos em pass-and-play
(Junior × Melissa). Este documento registra **apenas o que foi observado jogando**,
com o que foi confirmado por medição e o que ainda precisa de reprodução.

Contexto: nada aqui é bloqueante de publicação. São correções de polimento e
uma decisão de regra que já está coerente com o texto do prólogo.

---

## 1. Placar do endgame numera duas vezes

**Status:** confirmado por leitura de código.

`src/main.ts` gera cada linha do ranking já com o número escrito à mão:

```ts
`<li><b>${indice + 1}. ${escaparHtml(linha.nome)}</b> · casa ${linha.casa} · …</li>`
```

Mas o container é um `<ol id="endgame-ranking">` (`src/main.ts:199`), que **já
numera automaticamente**. O CSS não desliga o marcador (`src/style.css:831` só
define `padding-left`, `max-height` e `overflow`). Resultado: a linha sai como
`1. 1. Junior · casa 40 …` e `2. 2. Melissa · casa 28 …`.

**Correção sugerida (a mais simples):** remover o `${indice + 1}. ` do template e
deixar o `<ol>` numerar. Mantém a semântica de lista ordenada e o leitor de tela
anuncia a posição corretamente.

```ts
`<li><b>${escaparHtml(linha.nome)}</b> · casa ${linha.casa} · ${linha.projeto}/100 · ${escaparHtml(trofeus)}</li>`
```

---

## 2. Efeito "perca 1 jogada" fica inerte em partida de um jogador

**Status:** confirmado em jogo.

Casas 17, 23, 32 e 38 aplicam `perdeTurno: true`. Em partida solo, o log registra
`perde turno · pulou Jogador 1` — mas o jogador seguinte é ele mesmo, então a
rolagem seguinte acontece normalmente. O efeito vira decoração.

Em dois jogadores funciona como esperado: no turno 11 a Melissa caiu na casa 23,
o log marcou `perde turno`, o turno 12 foi do Junior com a nota `pulou Melissa`,
e ela voltou no 14.

**Duas saídas possíveis:**

- **Penalidade real em solo:** converter `perdeTurno` em bloqueio da próxima
  rolagem do mesmo jogador, independente do número de participantes.
- **Aviso no texto:** manter o comportamento e marcar no efeito que ele só vale
  em partidas com 2+ jogadores.

A primeira é mais consistente, mas muda o balanceamento da partida solo.

---

## 3. Vitória é por posição, não por projeto

**Status:** confirmado em jogo — e o texto do prólogo está correto.

Na primeira partida, o endgame abriu na **casa 40 com projeto 96/100** (não 100).
Na segunda, o vencedor chegou à casa 40 com 92/100 e o projeto fechou em 100
somente por causa do `+10` da própria casa 40.

Isso confirma a regra escrita no prólogo — *"o primeiro a alcançar a casa 40
coloca o jogo no catálogo"* — e a nota da casa 40: *"os pontos de projeto ficam no
placar e no desempate; não há retorno à casa 30"*. **Nada a corrigir aqui.**

Ponto de atenção para quando a regra for revisada: com `1D6`, sair da casa 39 e
tirar 5 levaria a 44. A implementação atual já para na 40 e vence, o que é o
comportamento desejado (cap na 40). Vale manter assim e documentar explicitamente.

---

## 4. Peça desalinhada da casa em telas menores

**Status:** **não reproduzido por medição** — precisa da tela em que apareceu.

Relatado durante o jogo: com a janela menor, a peça do jogador aparece deslocada
da casa correta.

Medição feita em 11 viewports (1440×900, 1280×800, 1171×859, 1050×800, 900×700,
768×800, 700×800, 680×800, 600×800, 480×800, 390×844), comparando o centro de cada
`.player-token` com o centro do `.house-hotspot` da casa correspondente:

```
pedido 1440x900 | houses 1091x613 | pior: casa 40 dx=0 dy=0
pedido 1280x800 | houses  964x541 | pior: casa 40 dx=0 dy=0
pedido 1171x859 | houses  858x482 | pior: casa 40 dx=0 dy=0
pedido  900x700 | houses  856x481 | pior: casa 40 dx=0 dy=0
pedido  768x800 | houses  727x408 | pior: casa 40 dx=0 dy=0
pedido  700x800 | houses  659x370 | pior: casa 40 dx=0 dy=0
pedido  680x800 | houses  694x390 | pior: casa 40 dx=0 dy=0
pedido  390x844 | houses  694x390 | pior: casa 40 dx=0 dy=0
```

O deslocamento peça↔hotspot é **zero em todos os casos**. Então o problema não
está em `posicaoDaPeca()` nem no cálculo percentual das peças.

### Hipótese principal: arte recortada vs. hotspots percentuais

`.houses` e `.tokens` usam `inset: 0` e posições em `%`, herdando o tamanho do
`.board-stage`. A arte usa `object-fit: cover` (`src/style.css:210-215`).

Quando o `aspect-ratio` do container diverge de `1672 / 941` (proporção natural da
arte), o `cover` **recorta** a imagem — mas os hotspots continuam calculando `%`
sobre o container inteiro, não sobre a área visível da arte. As duas coisas
desalinham juntas: hotspot e peça ficam coerentes entre si, e ambos desalinham da
arte que o jogador está vendo. Foi exatamente esse o padrão medido.

Medição de `aspectMismatch` (`container` vs. `natural`) nos viewports testados:
até **0.003**, o que dá recorte de ~0.4px — pequeno demais para explicar o que ele
viu. **Ou seja: a hipótese explica o mecanismo, mas não a magnitude relatada.**

### Hipótese secundária: `≤680px` força tamanho fixo com scroll horizontal

```css
@media (max-width: 680px) {
  .board-stage { overflow-x: auto; aspect-ratio: auto; }
  .board-art, .houses, .tokens, .scanlines { width: 694px; height: 390px; inset: 0 auto auto 0; }
}
```

Abaixo de 680px o tabuleiro passa a ter **694px fixos** dentro de um stage que pode
ter 356px (medido em 390×844). O conteúdo é maior que a área visível e rola na
horizontal. A peça está na posição correta em relação à arte — mas quem olha sem
rolar vê só a fatia esquerda da imagem, e a peça pode parecer fora do lugar.
Em 390×844 o stage mediu **356px** para um conteúdo de **694px**.

**O que falta para fechar o diagnóstico:** a resolução exata da janela onde ele viu
o desvio, e um print. Com isso dá para distinguir entre as duas hipóteses em uma
medição.

---

## 5. O que funcionou como projetado

Registrado porque é o desenho da etapa 2 e vale confirmar que está de pé:

- **Troféu por conquista, não por passagem.** Quem chega primeiro no marco ganha a
  narração do caminho completo até ali; quem chega depois não recebe nada. Na
  segunda partida, o Junior levou Ato 2, Ato 3, Ato 4 e Endgame; a Melissa passou
  pelos mesmos marcos depois e não recebeu troféu nem popup.
- **A narração é só do vencedor do marco.** O texto do troféu conta apenas os
  turnos de quem conquistou — os turnos do outro jogador são omitidos, sem
  mencionar que existiram.
- **Easter egg do Einstein** só aparece quando algum jogador completa os quatro
  atos (`src/main.ts:519`), e o estado sobrevive ao save (`src/main.ts:714`).
- **Log completo** com trajetória, efeito aplicado e placar de projeto por turno.
- **Save/load em Markdown** pelo cassete REC/PLAY, disponível no tabuleiro.

---

## Resumo por prioridade

| # | Item | Status | Impacto |
|---|------|--------|---------|
| 1 | Numeração dupla no placar do endgame | Confirmado | Visível na tela de vitória |
| 2 | "Perca 1 jogada" inerte em partida solo | Confirmado | Regra inconsistente |
| 3 | Vitória por posição (casa 40) | Confirmado, correto | Nenhum |
| 4 | Peça desalinhada em tela menor | Não reproduzido | Precisa de print + resolução |

---

## Adendo — 28/10: teste dinâmico de resize no Chromium (sem recarregar)

**Objeto:** investigar o relato de peças aparentemente deslocadas depois de redimensionar a janela em pleno gameplay. Diferente da medição estática original, este ensaio percorre larguras progressivamente maiores e menores **na mesma sessão**.

**Reprodução automatizada:** [GitHub Actions #40707465444](https://github.com/jrpasolini/retro-ghost-85/actions/runs/40707465444) — [capturas + medições JSON](https://github.com/jrpasolini/retro-ghost-85/actions/runs/40707465444/artifacts/12823499895).

**Código do ensaio:** `qa/verify-resize.mjs` e workflow `.github/workflows/resize-audit.yml`; ambos mantidos **somente na branch da PR #6**. O frontend e a imagem original não foram alterados.

### Metodologia

1. Compilar e abrir o Vite no Chromium headless, aguardando o WebP original **1672×941** carregar.
2. Sem recarregar a página, visitar 14 dimensões na ida/volta, cobrindo as transições 1051↔1050 px e 681↔680 px, além de 390×844 px.
3. Medir os centros dos 40 hotspots contra a **projeção geométrica da imagem** levando `object-fit: cover` em consideração; conferir também peças ↔ hotspots e caixas de `.houses`/`.tokens` ↔ imagem.
4. Configurar quatro participantes humanos de verdade na UI e repetir o resize com as quatro peças na casa inicial, incluindo a formação de quatro ocupantes.
5. Executar **quatro rolagens reais do aplicativo**, movimentando os personagens; repetir o resize sobre a mesma sessão, medindo as quatro peças contra a imagem e os deslocamentos esperados de `posicaoDaPeca`.
6. Salvar capturas de tela em resoluções representativas e JSON de medições para inspeção humana.

### Resultados observados

| Cenário | Maior diferença encontrada | Resultado |
|---|---:|---|
| Peça P1 ↔ hotspot inicial, ida e volta | 0,016 px | PASS |
| 40 hotspots ↔ imagem projetada (14 dimensões) | 0,311 px | PASS |
| Camada de peças/hotspots ↔ caixa da imagem | 0 px | PASS |
| Quatro peças na casa 1 ↔ projeção | 0,0194 px | PASS |
| Formação dos quatro participantes na casa 1 ↔ motor | 0 pontos percentuais | PASS |
| Quatro participantes após quatro rolagens ↔ imagem projetada | 0,291 px | PASS |
| Formação após quatro rolagens ↔ motor | 0 pontos percentuais | PASS |

**Descontinuidade responsiva real:** em largura de janela 681 px, a imagem mede ~655 px; em 680 px, a imagem passa a 694 px fixos, gerando overflow e corte horizontal. Em uma janela de 390 px, o stage mede ~371 px, mas a imagem continua com 694 px, exigindo rolagem. O jogo não deslocou peças em relação à imagem no ensaio, mas **a escala e o enquadramento mudam abruptamente** e podem explicar a impressão visual do usuário.

### Conclusão e limites

- O código atual **já posiciona peças relativamente ao tabuleiro** via percentuais em `casas`, `posicaoDaPeca` e CSS `--tx`/`--ty`. Nenhum `resize` handler é necessário para esses valores CSS se recalcularem.
- **Não foi reproduzida uma dessincronia geométrica geral** nas transições testadas, inclusive depois de jogadas.
- A verificação compara a projeção dos percentuais sobre a imagem, **não** identifica visualmente por computador o desenho real do centro de cada casa rasterizada. Portanto, não certifica as coordenadas da arte com precisão pixel a pixel.
- O ensaio rodou no Chromium do GitHub Actions, com fator de escala 1; **não reproduz necessariamente** configurações locais de Edge, zoom, monitor, DPR, extensões ou um evento transitório específico.
- **Não modificar hotspots, motor ou WebP** para tentar corrigir um defeito não reproduzido. A única área de aperfeiçoamento com evidência objetiva é a quebra de apresentação em `max-width: 680px`, a ser tratada como UX responsiva separada.
- Se o efeito persistir no navegador do autor, obter captura **durante o desvio** com dimensões da janela, porcentagem de zoom, e, se possível, casa/participantes envolvidos. Não inferir a causa sem esse registro.

**Decisão neste PR:** manter o diagnóstico e os testes reexecutáveis; nenhuma mudança de produção até decisão sobre o comportamento responsivo no mobile.

---

## Fechamento — correções implementadas e testes de regressão (28/10)

Os achados 1 e 2 deste relatório são registros históricos do playtest; **ambos já foram corrigidos no código da PR #6**, sem modificar o WebP, os hotspots ou as coordenadas do tabuleiro.

### Penalidade solo

- Nas casas 17, 23, 32 e 38, `perdeTurno` permanece pendente até a próxima ação do único jogador.
- O botão muda para **PASSAR TURNO**; ao ser acionado, consome exatamente uma penalidade sem rolar o dado, sem avançar a peça, sem pontuar e sem consumir RNG.
- Um registro `dado1: null` fica no game log e na trajetória. O schema JSON do save permanece **1**, e a penalidade é restaurada após REC/PLAY.
- Jogos com dois a quatro participantes continuam consumindo penalidades na rotação de turnos como antes.
- Endgame exibe o número de **rolagens reais**, excluindo turnos pulados da contagem; a trajetória do Mestre descreve o turno perdido sem inventar resultado de dado.

### Ranking do Endgame

- Os nomes deixam de receber número manual em cada `<li>`; o `<ol>` já cuida da numeração sem duplicá-la.

### Evidência reexecutável

- **59 testes unitários passaram, 0 falhas**, TypeScript e build aprovados em [GitHub Actions](https://github.com/jrpasolini/retro-ghost-85/actions/runs/40725979502).
- [Teste de navegador com Chromium e Playwright aprovado](https://github.com/jrpasolini/retro-ghost-85/actions/runs/40726785489): resize sem recarga com quatro participantes, quatro rolagens e teste de interface específico do modo solo.
- O teste de UI carrega um save com penalidade pendente, confirma **PASSAR TURNO → ROLAR DADO**, verifica a entrada no log e a posição inalterada da peça, e carrega um Endgame com pulo para conferir **nome sem número duplicado e contagem de duas rolagens reais**.
- [Capturas e medições](https://github.com/jrpasolini/retro-ghost-85/actions/runs/40726785489/artifacts/12832763738) disponíveis como artefato.

O cenário de descontinuidade visual em `max-width: 680px` segue documentado como **melhoria de UX futura**, não como defeito geométrico comprovado. Preservado fora deste fechamento para não alterar o tabuleiro antes da internacionalização.
