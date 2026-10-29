# Retro-Ghost-85

[English — documentação principal](README.md) · **Português brasileiro**

Um jogo de tabuleiro digital sobre criar seu primeiro jogo de computador em **1985**: listagens BASIC, backups em cassete, disquetes, sprites, BBS e a publicação no catálogo.

**40 casas · 1–4 jogadores locais · Quatro atos · Um Mestre narrador**

[Jogar no site do projeto](https://jrpasolini.tech/retro-ghost-85/) · [Hospedagem Render](https://retro-ghost-85.onrender.com/)

## O dado decide. A IA narra.

O navegador rola um dado de seis faces, move as peças, aplica consequências, controla turnos da CPU local e determina a vitória. O primeiro a chegar à casa 40 vence, independentemente dos pontos de projeto. A Gemma não decide jogadas.

Os troféus dos atos e o Endgame guardam a trajetória de quem os conquistou naquele momento. A narrativa reúne beats aprovados em português/inglês e um comentário final curto da **Google Gemma 7B**, pela **Cloudflare Workers AI**. São até dois beats por ato e cinco no encerramento.

O botão retrô **PLAY/PAUSE** gera e reproduz a jornada usando a voz configurada da **ElevenLabs**. O cassete ao lado habilita o download do MP3 depois da geração. Ouvir novamente e baixar reutilizam o áudio na sessão. A trilha pausa durante a fala e retoma depois, respeitando AUDIO OFF.

O jogo continua funcional sem os serviços de narração. Os textos aprovados são o fallback; comentário e voz precisam de rede. Não há cache PWA que garanta um primeiro carregamento offline.

## Idioma e saves

Inglês é o padrão no primeiro acesso. A bandeira do Brasil seleciona português, e a escolha explícita é lembrada sem alterar a partida. REC/SAVE exporta um `.md`; PLAY/LOAD importa o arquivo. O JSON dentro do save é a fonte de verdade e mantém compatibilidade entre os idiomas. O texto narrativo não é executado como instrução.

## Executar e verificar

Use Node.js 22.18+ e npm:

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm audit
```

O build gera `dist/` e valida caminhos relativos. A configuração `base: "./"` suporta a raiz de um domínio ou o subcaminho `/retro-ghost-85/`.

`VITE_NARRATOR_URL` é apenas uma URL pública opcional; veja [.env.example](.env.example). Chaves de provedores ficam nos secrets do Worker, nunca em variáveis `VITE_`. Uma chamada não cacheada usa no máximo 96 tokens de saída, aceita comentário de até 40 palavras e limita a espera da inferência a 20 segundos; o cliente espera até 25 segundos. O texto completo/entrada TTS tem limite de 2.800 caracteres. Não há quota autenticada por partida nem rate limit global; os limites por pedido não garantem custo zero.

## Documentação e créditos

A documentação atual é mantida primeiro em inglês:

- [Índice](docs/README.md), [arquitetura](docs/ARCHITECTURE.md) e [deploy](docs/DEPLOYMENT.md).
- [Worker](workers/narrator/README.md) e [contribuição](CONTRIBUTING.md).
- [Créditos](CREDITS.md), [avisos de terceiros](THIRD_PARTY_NOTICES.md) e [inventário de mídias](docs/ASSETS.md).
- [Revisão final](docs/RELEASE_REVIEW.md) e [arquivo histórico em português](docs/archive/README.md).

Criado e mantido por **Antonio Pasolini (jrpasolini)**. Créditos a ElevenLabs Music e TTS, Google Gemma, Cloudflare Workers/Workers AI/KV, Render, .Tech Domains, GitHub/Actions/Copilot Pro, Vite, TypeScript, Playwright, Fontsource e autores das fontes. As seis trilhas foram geradas para o projeto na ferramenta web de criação de música da ElevenLabs, conforme confirmação do autor.

## Licença

Copyright (c) 2026 Antonio Pasolini e colaboradores. Código-fonte original, documentação e textos narrativos autorais sob a [licença MIT](LICENSE). As fontes mantêm SIL OFL 1.1. Artes, retrato, trilha e voz têm escopo e condições separados nos [avisos de terceiros](THIRD_PARTY_NOTICES.md); MIT não substitui termos de provedores ou direitos de marcas e mídias. O projeto não distribui ROMs, BIOS ou imagens de disco proprietárias, e não implica patrocínio ou endosso dos fornecedores citados.
