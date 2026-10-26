# Retro Ghost 85 — Estrutura do Projeto

> Documento vivo. Toda decisão tomada entra aqui, com data.
> Criado em **26/10/2026** por Melissa, a pedido do Junior.
> Status: **estrutura aprovada para começar**.

---

## 1. Visão

Um jogo de tabuleiro digital ambientado em **1985**, onde até **4 jogadores** percorrem
a carreira de um desenvolvedor da época — da revista com listagem em BASIC até a
publicação do próprio projeto.

O caminho é feito de **40 casas**, cada uma um marco real daquele mundo: cassete que
não carrega, disco que corrompe, modem acústico, BBS, grupo de usuários, contrato
com revista.

Um modelo de linguagem (**Gemma**) atua como **mestre narrador**: ele não decide nada.
Ele **conta** o que o dado já decidiu.

**Nome de trabalho:** Retro Ghost 85. Ver §3 — o nome está sob revisão.

---

## 2. Princípios de design (não negociáveis)

1. **O dado decide. A IA narra.** O código rola o dado, move a peça e aplica o efeito.
   O modelo recebe o resultado pronto e devolve texto. O modelo **nunca** devolve
   "avance 4 casas".
2. **O modelo não raciocina.** Prompt curto, temperatura baixa, saída limitada a
   narração. Nada de cadeia de pensamento, nada de decisão. Isso protege custo,
   rate limit e justiça do jogo.
3. **Narração é cacheada.** Cada casa tem texto-base escrito à mão. O modelo gera
   variações e é opcional: se a API falhar, o jogo continua com o texto-base.
4. **Save é um arquivo.** O estado da partida é um `.md` legível, baixável e
   recarregável. Sem banco de dados, sem login, sem servidor de estado.
5. **Pass-and-play.** Os 4 jogadores compartilham um aparelho. Multiplayer em rede
   está fora do escopo da v1.
6. **Autenticidade acima de polimento.** Tabuleiro tipográfico, verde-fósforo,
   sem ilustração sofisticada. O que convence é a precisão histórica, não a arte.

---

## 3. Nome e marca — decidido

**Nome do projeto: Retro Ghost 85.** Decidido em 26/10/2026.

- **`MSX` não entra no nome** do repositório, do jogo, do domínio ou do título.
- A referência ao MSX fica na **narrativa** — ambientação, cenários, diálogos.
- Nos **créditos** do README e do jogo, uma nota de atribuição:
  > *MSX é marca registrada de seus respectivos titulares. Este projeto é uma obra
  > independente, sem vínculo, patrocínio ou endosso. Não distribui BIOS, ROMs ou
  > software proprietário.*
- **Nada de BIOS ou ROM** no pacote. O jogo é web, roda em texto e DOM, e não emula
  hardware.

## 4. Arquitetura

Três camadas, cada uma com um papel único. Nenhuma delas tem lógica de jogo.

```
                 jrpasolini.tech/retro-ghost-85
                            │
                    ┌───────┴────────┐
                    │  Render        │  site estático (canônico, sob o domínio)
                    │  static site   │  espelha o build do GitHub
                    └───────┬────────┘
                            │  fetch JSON
                    ┌───────┴────────┐
                    │ Cloudflare     │  UM Worker: proxy do Gemma
                    │ Worker         │  guarda a chave, aplica rate limit,
                    └───────┬────────┘  devolve narração
                            │
                     Google AI / Gemma

     GitHub Pages ────── espelho público e redundante do mesmo build
```

**Por que o Render entra (e com que papel):** o domínio `jrpasolini.tech` vive lá, e
queremos `jrpasolini.tech/retro-ghost-85`. Então o Render é **hospedagem estática sob o
domínio** — não é backend. Ele serve `dist/`, e nada mais.

**Atenção ao base path:** servir em subpasta exige `base` configurado no build
(`/retro-ghost-85/`) e caminhos de asset relativos. Erro clássico: página abre, CSS e JS
404 porque foram pedidos na raiz do domínio. Resolver isso **no primeiro dia**, não no
último.

**GitHub Pages** é espelho, não fonte. Mesmo build, `base` correspondente.

**Worker** é o único com segredo. Ele expõe `POST /narrate` e nada mais. Sem CORS
aberto para o mundo: allowlist do domínio.

---

## 5. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Build | Vite + TypeScript | simples, saída estática, funciona nos dois hosts |
| UI | DOM puro (ou Preact se doer) | tabuleiro é texto e movimento, não precisa de framework |
| Estado | objeto JS + serialização para `.md` | ver §7 |
| Dados | JSON versionado no repo (`data/casas.json`) | casas são conteúdo, não código |
| Narrativa | Worker + Gemma | ver §8 |
| Testes | Vitest para o motor de regras | a parte que precisa ser confiável |

**Sem biblioteca de jogo.** O motor é pequeno: dado, movimento, efeitos, turnos.

---

## 6. Estrutura de arquivos

```
retro-ghost-85/
├── README.md
├── package.json
├── vite.config.ts
├── index.html
├── public/
│   └── fonte-tipografica/
├── data/
│   ├── casas.json          # as 40 casas: id, título, tipo, efeito, texto-base
│   ├── eventos.json        # tabelas de fatalidade e bônus
│   └── versao.json         # schema version do save
├── src/
│   ├── main.ts             # boot, roteamento entre telas
│   ├── motor/
│   │   ├── dado.ts         # RNG (semente salva no save)
│   │   ├── tabuleiro.ts    # movimento, voltas, vitória
│   │   ├── efeitos.ts      # aplica efeito da casa ao estado
│   │   └── turnos.ts       # ordem, pass-and-play
│   ├── estado/
│   │   ├── jogo.ts         # tipo GameState
│   │   ├── save.ts         # serializar / desserializar .md
│   │   └── migracao.ts     # save antigo -> schema atual
│   ├── narrativa/
│   │   ├── cliente.ts      # chama o Worker
│   │   ├── cache.ts        # cache local das narrações
│   │   └── fallback.ts     # texto-base quando a API falha
│   └── ui/
│       ├── tabuleiro.ts
│       ├── ficha.ts        # cartela de cada jogador
│       └── log.ts          # diário da partida
└── worker/
    ├── src/index.ts        # POST /narrate
    └── wrangler.toml
```

---

## 7. Modelo de dados

### 7.1 Estado do jogo (em memória)

```ts
type Jogador = {
  id: number;            // 1..4
  nome: string;
  casa: number;          // 0..39 (posição no tabuleiro)
  projeto: number;       // 0..100 — progresso do projeto
  energia: number;       // 0..3
  inventario: string[];  // ids de itens
  flags: Record<string, boolean>;
};

type GameState = {
  schema: 1;
  versaoJogo: string;
  semente: number;       // RNG determinístico, salvo
  turno: number;         // índice do jogador da vez
  rodada: number;
  jogadores: Jogador[];
  log: EntradaLog[];     // narrativa acumulada
  iniciadoEm: string;    // ISO
  atualizadoEm: string;
};
```

### 7.2 Save em `.md`

Formato: front matter YAML (estado) + log narrativo em markdown (história).

```markdown
---
schema: 1
jogo: retro-ghost-85
versao: 0.1.0
semente: 841532
turno: 2
rodada: 7
iniciado_em: 2026-10-27T20:10:00-03:00
atualizado_em: 2026-10-27T21:44:00-03:00
jogadores:
  - id: 1
    nome: Junior
    casa: 12
    projeto: 34
    energia: 2
    inventario: [cassete, joystick]
    flags: { drive: true }
---

# Retro Ghost 85 — diário da partida

## Rodada 1

**Junior** tirou 4 e caiu na casa *A listagem da revista*.
O programa rodou. Ele não sabia por quê, e isso foi o começo.
```

**Regras do save:**
- Carregar = ler front matter, reconstruir estado, continuar.
- Log é **append-only**: carregar não reescreve a história.
- `semente` garante que recarregar não muda o futuro da partida.
- O arquivo é editável de propósito. Trapacear é permitido e é temático.

---

## 8. Contrato do narrador

**Entrada (o Worker monta, o cliente envia):**
```json
{
  "casa": 12,
  "titulo": "A listagem da revista",
  "tipo": "marco",
  "resultado": "sucesso",
  "jogador": "Junior",
  "contexto": { "energia": 2, "projeto": 34, "itens": ["cassete"] }
}
```

**Saída:** apenas `{ "texto": "..." }`.
- 2 a 4 frases.
- Sem números de regra, sem instrução de movimento, sem pergunta ao jogador.
- Temperatura baixa (0.4–0.6). `max_tokens` curto.

**Regra de ouro:** o Worker **valida** a saída. Se vier com número de casa, comando
ou JSON inválido, descarta e usa o texto-base. O jogo nunca quebra por causa do modelo.

---

## 9. O tabuleiro — 40 casas

Quatro atos de dez casas. A ordem é a carreira real de um dev brasileiro em 1985.

| # | Casa | Tipo | Efeito |
|---|---|---|---|
| 1 | A revista na banca | marco | +10 projeto |
| 2 | Digitar a listagem | evento | +5 projeto |
| 3 | O erro de digitação | fatalidade | −1 energia, −5 projeto |
| 4 | `RUN` e a tela azul | marco | +10 projeto |
| 5 | Salvar no cassete | evento | ganha item *cassete* |
| 6 | O cassete que não carrega | fatalidade | −5 projeto (ou −1 energia se tiver drive) |
| 7 | Fitas virgens do camelô | evento | +3 projeto |
| 8 | O joystick emprestado | evento | ganha item *joystick* |
| 9 | O cartucho do amigo | evento | +8 projeto |
| 10 | **Primeiro programa que funciona** | marco | +15 projeto |
| 11 | O drive de disquete | marco | ganha item *drive*, +5 projeto |
| 12 | Formatar o disco | evento | +3 projeto |
| 13 | MSX-DOS pela primeira vez | marco | +10 projeto |
| 14 | O assembler | evento | +10 projeto |
| 15 | Sprite fora do lugar | fatalidade | −5 projeto |
| 16 | Mapa de memória e VRAM | evento | +8 projeto |
| 17 | Colisão que não colide | fatalidade | −1 energia |
| 18 | Música em PSG | evento | +6 projeto |
| 19 | O bug de scroll | fatalidade | −8 projeto |
| 20 | **O jogo roda liso** | marco | +15 projeto |
| 21 | O modem acústico | marco | ganha item *modem*, +5 projeto |
| 22 | Discar para a BBS | evento | +10 projeto |
| 23 | Linha ocupada | fatalidade | perde o turno |
| 24 | O grupo de usuários | marco | ganha item *contato*, +8 projeto |
| 25 | Disquete com vírus | fatalidade | −1 energia, perde 1 item |
| 26 | Cópia de software: o dilema | escolha | +6 projeto **ou** +1 energia |
| 27 | Feira de informática | evento | +8 projeto |
| 28 | Revista especializada | evento | +5 projeto |
| 29 | Concurso de programas | evento | +12 projeto ou −1 energia |
| 30 | **Primeiro freelance** | marco | +15 projeto, ganha item *contrato* |
| 31 | O contrato | marco | +10 projeto |
| 32 | O prazo | fatalidade | −1 energia |
| 33 | O manual | evento | +6 projeto |
| 34 | A capa | evento | +5 projeto |
| 35 | Duplicação em série | evento | +8 projeto |
| 36 | Distribuição | evento | +6 projeto |
| 37 | A crítica na revista | evento | +10 projeto ou −10 |
| 38 | A errata | fatalidade | −6 projeto |
| 39 | O segundo jogo | evento | +10 projeto |
| 40 | **Seu nome no catálogo** | final | vitória |

**Vitória:** chegar à casa 40 com `projeto ≥ 100`. Quem chega sem projeto suficiente
fica preso na 39 e precisa de mais uma volta (reviravolta, não derrota).

**Energia:** 0 = volta 3 casas e recupera 1. Nunca elimina jogador.

---

## 10. Roadmap da semana 4

| Dia | Entrega |
|---|---|
| 1 | Repo, Vite, tabuleiro tipográfico na tela, dado e movimento funcionando |
| 2 | As 40 casas em JSON, motor de efeitos, turnos, pass-and-play |
| 3 | Save/load `.md` + testes do motor |
| 4 | Worker + Gemma + cache + fallback |
| 5 | Deploy no Render sob `/retro-ghost-85`, espelho no Pages, chaves e CORS |
| 6 | Polimento, textos-base das 40 casas, README, prints |
| 7 | Post de submissão + vídeo/GIF de 30s |

**Se atrasar:** corta o Gemma, não o jogo. O jogo funciona com texto-base; a narração
é o tempero, não a carne.

---

## 11. Riscos e decisões abertas

| Risco | Estado | Decisão |
|---|---|---|
| Uso do nome MSX | **resolvido** | fora do nome; so narrativa + creditos |
| Id exato do modelo Gemma na plataforma | aberto | confirmar antes do dia 4 |
| Base path no Render (`/retro-ghost-85`) | conhecido | resolver no dia 1 |
| Rate limit da API | controlado | cache + validação + fallback |
| Artigos 1 e 2 citam jogos e nomes | **bloqueado** | revisão de direitos antes de publicar |
| Prazo | real | corte do Gemma se necessário |

---

## 12. Registro de decisões

- **26/10/2026 — Render entra.** Não como backend, mas como hospedagem estática sob
  `jrpasolini.tech`. Decisão do Junior; corrige a recomendação anterior de cortar.
- **26/10/2026 — o modelo não raciocina.** Ele narra template pronto. Decisão do Junior.
- **26/10/2026 — artigos ficam para depois.** Precisam de revisão de direitos (jogos
  citados). Não publicar antes disso. Revisão da recomendação anterior de publicar a
  Parte A durante a semana 4.
- **26/10/2026 — nome decidido: Retro Ghost 85.** MSX fora do título, presente só na narrativa e nos créditos.
