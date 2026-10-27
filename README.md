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
jrpasolini.tech/retro-ghost-85      → Render (site estático, domínio próprio)
GitHub Pages                        → espelho público do mesmo build
Cloudflare Worker                   → único ponto com segredo: proxy do modelo
```

Sem banco de dados. Sem login. Sem servidor de estado.

## Stack

Vite · TypeScript · DOM puro · JSON para o conteúdo das casas · ElevenLabs Music · Cloudflare Workers

## Documentação

- [`ESTRUTURA.md`](./ESTRUTURA.md) — documento vivo do projeto: princípios,
  arquitetura, modelo de dados, contrato do narrador, as 40 casas, roadmap e
  registro de decisões.
- [`HISTORICO_NARRATIVO.md`](./HISTORICO_NARRATIVO.md) — base histórica e regras das 40 casas nesta versão.
- [`estrategia.md`](./estrategia.md) — decisões sobre modos de partida, participantes humanos e CPU local.

## Status

Protótipo local com tabuleiro, narrativa das 40 casas, configuração de 1 a 4 participantes humanos/CPU, um dado de seis faces, movimento, consequências determinísticas, save/load em Markdown e trilha dinâmica por ato. As seis faixas originais — introdução, quatro atos e encerramento — foram criadas com a ElevenLabs. A integração com Gemma e a publicação ainda não fazem parte desta versão.

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

