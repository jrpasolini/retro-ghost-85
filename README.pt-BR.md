# Retro Ghost 85

Um jogo de tabuleiro digital ambientado em **1985**, onde até quatro jogadores percorrem
a carreira de um desenvolvedor daquela época — da listagem em BASIC arrancada de uma
revista até o dia em que o próprio projeto aparece no catálogo.

**40 casas. Quatro atos. Um mestre narrador.**

---

## A ideia

O tabuleiro não é uma metáfora genérica de "desafios". É a carreira real de quem
programava em 1985: a revista na banca, o erro de digitação que você não encontra, o
cassete que não carrega, o drive de disquete, o modem acústico, a BBS, o grupo de
usuários, o contrato com a revista especializada.

Cada casa é um marco verdadeiro — e carrega o que havia de maravilhoso e de cruel
naquele mundo.

## O princípio que sustenta o jogo

> **O dado decide. A IA narra.**

O código rola o dado, move a peça e aplica o efeito. O modelo de linguagem recebe o
resultado **já decidido** e devolve apenas a narração da cena. Ele nunca escolhe o que
acontece, nunca move peças, nunca decide derrota.

Isso mantém o jogo justo, barato e rápido — e permite que ele funcione **offline**,
com o texto-base escrito à mão, quando a API não está disponível.

## O save é um arquivo

O estado da partida é um `.md` legível: front matter com o estado, log narrativo
abaixo. Baixa, guarda, carrega no dia seguinte, continua de onde parou.

Editar o arquivo à mão é permitido de propósito. Em 1985, quem sabia abrir o arquivo
sabia mudar o jogo.

## Arquitetura

```
https://jrpasolini.tech/retro-ghost-85/   → site estático (base do Vite "./")
Cloudflare Worker + Gemma 4               → cliente de narração configurado, ainda fora da tela
ElevenLabs                                → voz da narração, etapa seguinte
```

Sem banco de dados. Sem login. Sem servidor de estado.

O site público fica em `https://jrpasolini.tech/retro-ghost-85/`. O `vite.config.ts` mantém `base: "./"` para os arquivos resolverem nesse subcaminho.

## Worker de narração

A Gemma 4 é o Mestre narrador na categoria **Best use of Gemma** do Hacktoberfest. Ela não rola o dado e não muda o tabuleiro. As telas continuam no texto local “narração em breve”. Nenhuma tela chama o Worker ainda.

| | |
| --- | --- |
| Worker | `https://retro-ghost-85-narrator.antonio-pasolini.workers.dev` |
| Modelo | `@cf/google/gemma-4-26b-a4b-it` (Cloudflare Workers AI, Gemma 4) |
| Ambiente | `VITE_NARRATOR_URL` em `.env.example`. `src/config.ts` usa esse valor ou, se faltar, a URL do Worker acima. |
| Cliente | `checkNarratorHealth()` e `requestNarration({ player, act, trajectory })` em `src/services/narrator.ts`. Eles expiram e devolvem `{ ok: false, error }` em vez de lançar erro na interface. |

`trajectory` é Markdown vindo de `getPlayerTrajectory`, com no máximo 20 000 caracteres. `act` é `"2"`, `"3"`, `"4"` ou `"endgame"`.

```
GET  /health   → { ok, model }
POST /narrate  → { player, act, trajectory }
               ← { narration, model } ou { error }
```

O CORS do Worker só libera `https://jrpasolini.tech`, `https://www.jrpasolini.tech`, `http://localhost:5173` e `http://localhost:4173`.

## Stack

Vite · TypeScript · DOM puro · JSON para o conteúdo das casas · ElevenLabs Music · Cloudflare Workers

## Documentação

- [`ESTRUTURA.md`](./ESTRUTURA.md) — documento vivo do projeto: princípios,
  arquitetura, modelo de dados, contrato do narrador, as 40 casas, roadmap e
  registro de decisões.
- [`HISTORICO_NARRATIVO.md`](./HISTORICO_NARRATIVO.md) — base histórica e regras das 40 casas nesta versão.
- [`estrategia.md`](./estrategia.md) — decisões sobre modos de partida, participantes humanos e CPU local.

## Status

Protótipo local com abertura cinematográfica, tabuleiro, narrativa das 40 casas, configuração de 1 a 4 participantes humanos/CPU, um dado de seis faces, movimento, consequências determinísticas, save/load em Markdown e trilha dinâmica por ato. A abertura mostra o retrato de Antonio Pasolini, revela o crédito do Hacktoberfest após um segundo, apresenta a arte do jogo aos dois segundos e entrega o controle à preparação da jornada aos quatro segundos. As seis faixas originais — introdução, quatro atos e encerramento — foram criadas com a ElevenLabs. O cliente do Worker da Gemma 4 já está no repositório, mas a interface ainda não o usa.

## Créditos e atribuição

**MSX** é marca registrada de seus respectivos titulares. Este projeto é uma obra
independente, sem vínculo, patrocínio ou endosso de qualquer detentor da marca.

O projeto **não distribui** BIOS, ROMs, imagens de disco ou qualquer software
proprietário. É um jogo de tabuleiro em texto e DOM — não emula hardware.

Nomes de empresas, revistas, modems e equipamentos citados na narrativa pertencem a
seus respectivos donos e aparecem em contexto histórico e descritivo.

Trilha sonora original criada com a **ElevenLabs Music** para o Retro-Ghost-85.

## Licença

A definir.

