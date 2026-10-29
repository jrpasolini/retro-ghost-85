# Retro-Ghost-85

**🇧🇷 Português brasileiro** · [🇺🇸 English (padrão)](./README.md)

Jogo de tabuleiro digital ambientado em **1985**. Até quatro participantes acompanham a trajetória de quem tenta desenvolver e publicar um jogo de computador: da listagem em BASIC copiada de uma revista aos tropeços com cassete, disquetes, sprites, modem/BBS e ao lançamento no catálogo.

**40 casas. Quatro atos. Um Mestre narrador.**

## Jogabilidade

> **O dado decide. A IA narra.**

- **1d6**, movimento e efeitos decididos pelo motor local; a IA não controla dados, CPU, pontuação, progresso ou vitória.
- **1 a 4 participantes**, humanos em pass-and-play e CPU local com as mesmas regras. Toda partida precisa incluir ao menos um humano.
- Todos começam na casa 1. Os marcos 10/20/30 abrem os atos 2/3/4; a casa 40 é o **Endgame · Publicação**. O primeiro a alcançar a 40 vence; não é necessário atingir 100 de projeto.
- Os troféus dos atos são dados ao primeiro a alcançar cada região. Nos troféus e Endgame, o Worker monta uma seleção do histórico do participante e a IA pode acrescentar um comentário curto.
- A partida não depende de disponibilidade da API de IA: as 40 histórias-base foram escritas previamente, em dois idiomas. Isso não significa que o site hospedado ou o TTS sejam totalmente offline.
- Trilha musical com seis faixas: introdução, atos 1 a 4 e encerramento.

## Idiomas e save

- O **inglês (en-US)** é padrão na primeira visita, mesmo em navegador configurado para outro idioma.
- É possível mudar para **português brasileiro (pt-BR)**, inclusive no meio da partida, sem alterar RNG, peças ou progresso.
- REC/PLAY exporta e importa um arquivo **Markdown `.md`** com JSON estruturado e histórico legível. O JSON mantém a mesma estrutura em ambos os idiomas.

## O Mestre: Gemma e ElevenLabs

O fluxo implementado usa um **Cloudflare Worker** em `https://retro-ghost-85-narrator.antonio-pasolini.workers.dev`.

O modelo **padrão no código** é `@cf/google/gemma-7b-it-lora` (Gemma 7B, pesos abertos, servido por Workers AI); a variável `NARRATION_MODEL` pode substituir o modelo no ambiente implantado. **Confirmar o modelo efetivo pelo `GET /health` no lançamento.** Citações à Gemma 4 nos planos antigos documentam uma arquitetura superada e não o runtime atual.

No troféu dos atos 2, 3 e 4 e no Endgame:

1. O navegador prepara um histórico imutável da conquista, restrito ao participante.
2. Código local e Worker selecionam até **2 beats por ato** ou **5 no Endgame**, por identificadores canônicos.
3. O Worker compõe a narrativa com as histórias previamente escritas, e a Gemma tenta acrescentar **uma frase de fechamento** (máximo 40 palavras / 600 caracteres). Ela **não escreve os 40 episódios**, não decide resultados e não substitui as regras.
4. Se a inferência falhar, a história aprovada aparece sem o comentário dinâmico.
5. O botão **PLAY** solicita a voz pela **ElevenLabs API**, usando o Worker; o usuário pode ouvir e baixar o mesmo áudio em MP3. Repetição/download reutilizam o arquivo da sessão.

**Contrato atual:** `POST /narrate` com `{ player, act, lang, beats: [{ id }] }`, resposta com `text`, `model`, `fallback` e `cached`; `POST /tts` com `{ text, lang }` retorna `audio/mpeg` quando configurado. A voz é distinta das seis trilhas geradas com **ElevenLabs Music**.

O Worker não exige login e **não implementa autenticação ou rate limit global próprios**. Essa é uma decisão operacional consciente e aceita pelo autor no MVP. O Free Tier da Cloudflare não garante quota de consumo da ElevenLabs; CORS ou URL não divulgada não constituem autenticação. O código mantém validação, limites por requisição, cache e fallback. Mais detalhes em [Worker do Mestre](workers/narrator/README.md).

## Execução local

```bash
npm ci
npm run dev
```

Para testar a compilação e a lógica:

```bash
npm test
npm run build
```

Os workflows GitHub Actions fazem testes e validações automatizadas do gameplay, layout e internacionalização. O commit-base auditado em 29/10/2026 foi `a4f7998`, com os workflows de build/testes e resize concluídos com sucesso.

## Arquitetura e demonstração

```text
Frontend estático     Vite + TypeScript + DOM, sem banco de dados
Motor de jogo          RNG, movimentos, turnos e vitória locais
Mestre                Cloudflare Worker + Gemma 7B por padrão
Voz                  ElevenLabs API / TTS sob demanda
Música               6 faixas atribuídas à ElevenLabs Music
QA                   Node Test + GitHub Actions + Playwright
```

Endereços documentados para a demonstração: [jrpasolini.tech/retro-ghost-85](https://jrpasolini.tech/retro-ghost-85/) e [retro-ghost-85.onrender.com](https://retro-ghost-85.onrender.com/). Conferir funcionamento real antes da submissão, incluindo `/health` e voz.

## Hacktoberfest 2026 — Week 4

O projeto foi criado em **26/10/2026**, dentro do prazo oficial da **Week 4 — Ghost in the Machine**. A proposta homenageia a computação doméstica de 1985 com jogo retrô, trilha e um narrador de pesos abertos. A participação da IA é propositalmente **restrita a um comentário narrativo curto**; o artigo de submissão deve demonstrar esse valor sem exagerar sua função.

**O repositório fica privado até o lançamento do artigo no DEV**, quando será tornado público por decisão do autor. Este README não constitui submissão. Consulte [Checklist do challenge](SUBMISSAO_WEEK4_2026.md) e [Estado vigente](STATUS_ATUAL.md). Commits posteriores ao prazo final devem ser registrados neste README, com data e contexto.

## Documentação

- [STATUS_ATUAL.md](STATUS_ATUAL.md) — estado da implementação e decisões vigentes (principal referência).
- [SUBMISSAO_WEEK4_2026.md](SUBMISSAO_WEEK4_2026.md) — regras oficiais e checklist de lançamento.
- [ESTRUTURA.md](ESTRUTURA.md) — registro da arquitetura e sua evolução; capítulos iniciais são históricos.
- [HISTORICO_NARRATIVO.md](HISTORICO_NARRATIVO.md) — fatos históricos, cânone e regras.
- [estrategia.md](estrategia.md) — decisões e planos originais; algumas fases já foram concluídas.
- [ASSETS_E_CREDITOS.md](ASSETS_E_CREDITOS.md) — créditos e conferência de direitos das mídias.

## Marcas e licenciamento

**MSX** e demais marcas citadas pertencem aos seus titulares. Retro-Ghost-85 é independente, sem patrocínio, afiliação ou endosso desses titulares. O projeto não distribui ROMs, BIOS ou imagens de disco proprietárias e não emula hardware.

O **código original e a documentação de software** estão licenciados sob **MIT** (consulte [LICENSE](LICENSE)). Imagens, fotos, artes, música, áudio/voz e recursos de terceiros **não recebem automaticamente a licença MIT**. Suas permissões de publicação/reutilização precisam ser confirmadas antes de abrir o repositório; consulte [ASSETS_E_CREDITOS.md](ASSETS_E_CREDITOS.md).
