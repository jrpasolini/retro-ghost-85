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
