# Retro Ghost 85 — Estrutura do Projeto

> Documento vivo. Toda decisão tomada entra aqui, com data.
> Criado em **26/10/2026** por Melissa, a pedido do Junior.
> Status: **arquitetura em consolidação; mecânicas e 40 casas são propostas, ainda não aprovadas**.
> Integração de decisões revisada em **26/10/2026**. A auditoria da infraestrutura precede a implementação.

---

## 1. Visão

Um jogo de tabuleiro digital ambientado em **1985**, onde até **4 jogadores** percorrem
a carreira de um desenvolvedor da época — da revista com listagem em BASIC até a
publicação do próprio projeto.

O caminho é feito de **40 casas**, cada uma um marco real daquele mundo: cassete que
não carrega, disco que corrompe, modem acústico, BBS, grupo de usuários, contrato
com revista.

**Gemma 4 é o mestre do jogo**, conduz a sessão, narra, propõe desafios e solicita ações por ferramentas autorizadas. O motor determinístico valida dados, efeitos e turnos; a IA não altera o estado livremente.

**Nome decidido:** **Retro-Ghost-85**. Referências a MSX são históricas, não fazem parte da marca do produto.

---

## 2. Princípios e requisitos acordados

1. **Gemma 4 como mestre do jogo.** O modelo conduz, narra, propõe desafios e aciona ferramentas; o backend verifica permissões, resultados de dados, movimentos e regras. Sorteios são realizados por RNG verificável, solicitado pela Gemma via ferramenta e apresentado igualmente a todos os participantes.
2. **Resiliência e orçamento.** Respostas curtas, contexto resumido, cache quando apropriado, limitação de requisições e fallback de texto-base. Não remover a participação central da Gemma por padrão: eventual modo offline é degradação funcional claramente sinalizada.
3. **Salvamento portátil em Markdown.** Exportação/importação `.md` com estado estruturado, esquema versionado e diário narrativo legível; validação rigorosa, limites de tamanho e isolamento de instruções inseridas em arquivos importados.
4. **Até 4 jogadores.** Modo local (pass-and-play) e modo online por sala, com identidade de participante, turnos serializados, reconexão e sincronização por Cloudflare Durable Objects. Priorizar um recorte funcional mínimo para a Week 4.
5. **Arquitetura de operação definida.** Render Static para frontend; Cloudflare Workers + Durable Objects para sala, estado compartilhado e proxy seguro da Gemma 4 via Workers AI. Google Antigravity/Gemini são candidatos a *ferramentas de desenvolvimento*, condicionados a auditoria financeira.
6. **Autenticidade e identidade própria.** Visual inspirado em 1985, com legibilidade e acessibilidade; sem logos MSX oficiais, ROMs, BIOS ou ativos de terceiros sem licença.
7. **Sem saltar etapas.** Antes de definir detalhes finais de casas e gameplay: confirmar integração GitHub, elegibilidade dos créditos Google, protótipos de acesso a Gemma/Workers AI, hospedagem e limites de custo.

> **Distinção de escopo:** o modo pass-and-play e a narração exclusivamente passiva aparecem em versões anteriores como estratégias de contingência, **não** como substitutos das decisões atuais do projeto.

---

## 3. Nome e marca — decidido

**Nome do projeto: Retro-Ghost-85.** Decidido em 26/10/2026.

- **`MSX` não entra no nome** do repositório, do jogo, do domínio ou do título.
- A referência ao MSX fica na **narrativa** — ambientação, cenários, diálogos.
- Nos **créditos** do README e do jogo, uma nota de atribuição:
  > *MSX é marca registrada de seus respectivos titulares. Este projeto é uma obra
  > independente, sem vínculo, patrocínio ou endosso. Não distribui BIOS, ROMs ou
  > software proprietário.*
- **Nada de BIOS ou ROM** no pacote. O jogo é web, roda em texto e DOM, e não emula
  hardware.

## 4. Arquitetura de execução e construção

```text
Jogadores (1–4) ── HTTPS ── Render Static (frontend web)
                                  │
                                  │ HTTPS / WebSocket autenticado por sala
                                  ▼
                     Cloudflare Worker (API gateway)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
       Durable Object por sala              Workers AI: Gemma 4
       turnos, eventos, estado               mestre/narração/ferramentas
                 │                                 │
                 └────── ações validadas ──────────┘

GitHub privado (fonte canônica) -> build -> Render Static
Antigravity/Gemini (desenvolvimento, sujeito a validação financeira)
```

**Responsabilidades.** Render serve arquivos estáticos. Worker autentica e limita chamadas e controla origens permitidas; Durable Object é a autoridade da sala e executa regras e sorteios; Gemma 4 solicita ferramentas e recebe resultados, sem escrever estado diretamente. Credenciais ficam no backend. WebSocket deve lidar com reconexão, duplicação de ações e retomada de estado. Proteção CORS não substitui autenticação, autorização ou rate limiting.

**Hospedagem e domínio.** Caminho `jrpasolini.tech/retro-ghost-85` é **intenção a validar**, não pressuposto: confirmar quem responde pelo domínio e se o host permite servir esta subpasta. `base` de Vite e rotas de assets devem refletir o deployment efetivo. GitHub Pages pode ser espelho **somente após a liberação pública**; não configurar espelho público do repositório privado antes da submissão.

**Google Cloud.** O saldo promocional informado de R$ 5.677,28 é específico de *Trial credit for GenAI App Builder* (validade informada: 27/05/2027). A elegibilidade de Antigravity empresarial, AI Studio Build, API ou SKUs relacionados **não está confirmada**. Nenhuma despesa/ativação até conferir escopo, tarifação e abatimento real do crédito. Não utilizar o crédito como justificativa para provisionar recursos desnecessários.

**Ordem técnica:** auditar créditos e acesso às ferramentas -> protótipo privado de build -> Cloudflare Durable Object mínimo (sala e reconexão) -> Gemma via Workers AI com limite/fallback -> integração -> deploy e revisão. Documentar contratos de mensagens antes do desenvolvimento.

---

## 5. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Build | Vite + TypeScript | simples, saída estática, funciona nos dois hosts |
| UI | Vite + TypeScript; avaliar DOM/Preact após wireframe | preservar desempenho, acessibilidade e complexidade mínima |
| Estado | estado autoritativo no Durable Object para salas online; serialização `.md` | modo local pode operar isolado; sincronizar por eventos versionados |
| Dados | JSON versionado no repo (`data/casas.json`) | casas são conteúdo, não código |
| Mestre | Workers AI Gemma 4 + ferramentas validadas pelo Worker/DO | checar id, capacidades, limites e quotas |
| Testes | Vitest para o motor de regras | a parte que precisa ser confiável |

**Escolha da biblioteca visual e do motor ainda pendente.** Priorizar simplicidade e compartilhar regras entre modo local e online. Para o modo online, RNG/turnos e estado ficam sob autoridade do Durable Object.

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
│   │   ├── dado.ts         # RNG determinístico local/testes; sorteios online no servidor
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
    ├── src/index.ts        # API + autenticação e proxy para Workers AI
    ├── src/sala.ts         # Durable Object: estado, WebSockets, turnos
    ├── src/mestre.ts       # ferramentas e validação da Gemma
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
  semente: number;       // somente se RNG determinístico for adotado
  turno: number;         // índice do jogador da vez
  rodada: number;
  jogadores: Jogador[];
  log: EntradaLog[];     // eventos e narrativa acumulada
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
- Arquivo `.md` contém front matter estruturado e histórico narrativo. Validar schema, quantidade de jogadores, intervalos, tipos, referências e tamanho; escapar texto exibido e impedir injeção de prompt via histórico.
- Reconstruir estado sem confiar em comandos contidos no diário. Importação online exige permissão do anfitrião e substituição atômica do estado da sala.
- Histórico narrativo preservado; eventos estruturados permitem reconstrução consistente.
- Save editável é aceitável para partida local; em sala online, adulterações e conflitos devem ser identificados/validados, sem presumir integridade criptográfica de um Markdown.

---

## 8. Contrato da Gemma 4 como mestre — a validar com protótipo

**Entrada controlada pelo backend:** resumo conciso de estado/participantes, histórico relevante, casa/evento, ferramentas permitidas e limites de saída. O cliente não fornece instruções de sistema nem chaves.

**Ferramentas propostas:** `roll_dice`, `get_game_state`, `propose_challenge`, `evaluate_challenge`, `apply_event`, `end_turn`. O Worker/DO valida a autorização da vez, resultados dos dados, regras, idempotência e eventos; o modelo não atribui livremente posições, recompensas ou vitória.

**Saída:** narrativa breve em português ou inglês, opcionalmente acompanhada por chamadas de ferramentas estruturadas. Se a Gemma falhar, preservar a partida e oferecer narração-base, com indicação clara do modo degradado.

**Pontos pendentes:** confirmar identificador do modelo no Workers AI, formato real de function calling/JSON, custos em Neurons, limites no Free e comportamento sob concorrência. Fixar orçamento de tokens, timeout, cache, limites por sala/IP e testes adversariais.

---

## 9. Proposta preliminar de tabuleiro — 40 casas (não aprovada)

**Rascunho elaborado previamente.** Quatro atos de dez casas; revisar época, equilíbrio e plausibilidade histórica **depois** da aprovação de infraestrutura. Os efeitos abaixo não são contrato fechado.

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

## 10. Roteiro por gates — semana 4

| Etapa | Entrega e critério de saída |
|---|---|
| G0 — FinOps / ferramentas | Verificar elegibilidade do crédito GenAI App Builder para agentes de desenvolvimento Google, SKU, limites e gastos; nenhuma criação paga sem aceite |
| G1 — Contratos técnicos | Validar Render Static, Cloudflare Worker, Durable Object, Workers AI Gemma 4, acesso, rate limits, autenticação e diagrama de mensagens |
| G2 — POC isolada | Build estático acessível de teste + sala com 2 clientes, turno serializado, reconexão e chamada Gemma com fallback |
| G3 — Núcleo e persistência | Estado versionado, exportação/importação Markdown validada, testes do motor, modo local |
| G4 — Experiência e visual | Wireframes e identidade retrô originais, tabuleiro, peças, responsividade, acessibilidade, efeitos leves |
| G5 — Conteúdo e integração | Somente agora ratificar as 40 casas, desafios, balanceamento, textos e história; integração ponta a ponta |
| G6 — Auditoria e publicação | Testes multiusuário, segurança, custo, licenças, revisão de créditos, documentação, deploy e publicação no prazo oficial |

**Política de redução de escopo:** priorizar funcionamento completo da partida, acesso ao mestre Gemma e save; se multiplayer online ficar instável, manter modo local como contingência sem afirmar que multiplayer foi entregue. Não tornar público repositório ou espelho sem autorização explícita do Junior.

---

## 11. Riscos e decisões abertas

| Risco | Estado | Decisão |
|---|---|---|
| Uso do nome MSX | **resolvido** | fora do nome; so narrativa + creditos |
| Id exato do modelo Gemma na plataforma | aberto | confirmar antes do dia 4 |
| Base path no Render (`/retro-ghost-85`) | conhecido | resolver no dia 1 |
| Rate limit da API | controlado | cache + validação + fallback |
| Artigos 1 e 2 citam jogos e nomes | **bloqueado** | revisão de direitos antes de publicar |
| Prazo | crítico | reduzir polimento ou multiplayer antes de descartar Gemma, que é central ao desafio |
| Créditos Google | aberto | validar SKU/eligibilidade para agentes desenvolvedores, sem gastos sem autorização |
| Repositório privado | decidido | manter privado até autorização explícita de publicação |
| Render subpasta + domínio | não verificado | testar roteamento e configurações reais antes de prometer URL |
| Durable Objects | pendente | validar cota, persistência, fluxo online e reconexão |

---

## 12. Registro de decisões

- **26/10/2026 — Render entra.** Não como backend, mas como hospedagem estática sob
  `jrpasolini.tech`. Decisão do Junior; corrige a recomendação anterior de cortar.
- **26/10/2026 — o modelo não raciocina.** Ele narra template pronto. Decisão do Junior.
- **26/10/2026 — artigos ficam para depois.** Precisam de revisão de direitos (jogos
  citados). Não publicar antes disso. Revisão da recomendação anterior de publicar a
  Parte A durante a semana 4.
- **26/10/2026 — nome decidido: Retro Ghost 85.** MSX fora do título, presente só na narrativa e nos créditos.

---

## 13. Direção visual — responsabilidade da Bruna

**Objetivo:** criar identidade original de terminal doméstico de 1985 com atmosfera Halloween leve, sem confundir com emulador ou reproduzir ROMs/logotipos. Entregáveis sujeitos à aprovação: (a) moodboard e referências; (b) paleta/tipografia com licenças verificadas; (c) wireframe desktop e mobile; (d) componentes visuais de tabuleiro, peças, dado, ficha e log do mestre; (e) estados de carregamento/reconexão/erro e tela de créditos; (f) checklist de contraste, teclado, toque e movimento reduzido.

**Diretrizes iniciais:** verde-fósforo/âmbar e CRT como inspiração, não obrigação de monocromia; texto legível; animações não bloqueantes; sons opcionais; nada de assets oficiais do MSX ou de terceiros sem licença. Produzir imagens e recursos originais e entregar especificação/código/assets ao repositório mediante revisão. Separar direção visual de mecânica ainda não decidida.

## 14. Papéis e integração entre agentes

- **Junior:** product owner, aprovação das decisões de escopo, gastos, merges e publicação.
- **Google Antigravity + Gemini:** implementação incremental sob tarefas pequenas, preferencialmente em branches/PRs; devem respeitar esta estrutura e não assumir elegibilidade do crédito.
- **Bruna:** direção visual, revisão de arquitetura, coerência dos requisitos e auditoria de UX, segurança e entregas antes da aprovação do Junior.
- **Codex / Grok Bot / Cursor Pro:** apoio opcional em revisão independente, testes e auditoria; evitar agentes sobrescrevendo os mesmos arquivos simultaneamente.
- **GitHub:** fonte canônica; `master` protegida por revisão humana quando possível; segredos e dados privados fora do código/commits.

## 15. Decisões pendentes de aprovação

1. Verificação do escopo do crédito promocional de desenvolvimento agêntico e o primeiro teste controlado.
2. Contrato detalhado do modo online (convites, autenticação efêmera, reconexão e persistência).
3. Conjunto exato de ferramentas da Gemma 4 e suas limitações reais no Workers AI.
4. Regras de cooperação/competição, condições de vitória, conteúdo das 40 casas e progressão.
5. Endereço público, espelhamento GitHub Pages e estratégia de lançamento ao final do desafio.
6. Aprovação dos wireframes e da identidade visual.

> **26/10/2026 — revisão Bruna:** foram reconciliados os requisitos de mestre Gemma 4, multiplayer online via Durable Objects, privacidade do repositório, auditoria de créditos e divisão de responsabilidades. Conteúdo anterior preservado como proposta, não como obrigação.
