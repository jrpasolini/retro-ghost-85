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

**Gemma 4 é a voz/persona do mestre narrador, não o motor do jogo.** O navegador sorteia os dados, move as peças e aplica eventos conforme regras e textos-base predefinidos. A Gemma pode apresentar, dar tom e realizar pequenas variações supervisionadas de textos prontos em momentos selecionados, respeitando orçamento rígido. Nenhuma jogada depende de inferência.

**Nome decidido:** **Retro-Ghost-85**. Referências a MSX são históricas, não fazem parte da marca do produto.

---

## 2. Princípios e requisitos acordados

1. **Offline-first e pass-and-play (MVP).** Uma partida para 1 a 4 pessoas **no mesmo dispositivo**, cada uma na sua vez. **Multiplayer remoto não faz parte da v1**. Possível extensão futura somente mediante nova aprovação.
2. **Código decide; Gemma narra.** Sorteio por função local de RNG, movimento, bônus, penalidades, inventário, desafios e vitória são definidos por código/JSON. Gemma **não joga dados, não escolhe resultados, não raciocina sobre regras, não cria desafios do zero e não altera o estado**.
3. **Conteúdo pré-escrito como fonte de verdade.** Cada casa possui título, efeito, texto-base e, se necessário, variações aprovadas. O jogador recebe imediatamente esse conteúdo mesmo sem IA. A Gemma é uma camada *opcional* de apresentação/estilo do mestre em acontecimentos marcantes, jamais condição para prosseguir.
4. **Economia máxima de Workers AI.** Não chamar modelo para rolar dados, trocar turno, calcular regras, mostrar casas repetidas ou recontar textos já cacheados. Usar gatilhos esparsos, entradas curtas, cache por chave estável, saídas curtas, limite por sessão/dia e interrupção automática ao se aproximar da cota.
5. **Limite conceitual.** Um modelo generativo **sempre consome inferência/tokens quando responde**, mesmo copiando ou reformulando um template. Repetir texto sem transformação deve ocorrer inteiramente no navegador. Não prometer custo zero quando Gemma é consultada; medir uso real em Neurons.
6. **Resiliência.** API indisponível/429/timeout -> texto-base imediatamente, sem travar tabuleiro ou perder turno. Indicar quando a voz de IA está indisponível e permitir modo econômico/desativado.
7. **Save portátil.** Exportação/importação `.md` (front matter estruturado + diário legível) sem conta nem backend para estado; validar campos, limites de tamanho e sanear exibição e histórico.
8. **Infraestrutura mínima.** Render Static serve o frontend; um Cloudflare Worker invoca Workers AI com controle de acesso/abuso, orçamento e fallback. **Sem Durable Objects, banco ou WebSockets na v1.** Gemini pode auxiliar a escrever/revisar código, mas **nenhum serviço Google Cloud será usado como runtime ou financiador do projeto**.
9. **Identidade original e precisão histórica.** Referências ao MSX somente na ambientação, sem ROMs/BIOS/logos oficiais sem licença. Conteúdo das 40 casas ainda é proposta, não requisito fechado.
10. **Etapas obrigatórias.** Validar a disponibilidade e o custo real da Gemma 4 no Workers AI, realizar prova mínima de integração e conferir a hospedagem estática antes de fixar mecânicas e arte finais.

> **Escopo aprovado em 26/10/2026 (revisão):** pass-and-play local e narrador baseado em templates substituem a proposta anterior de mestre agêntico com ferramentas e multiplayer em rede.

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

## 4. Arquitetura de execução e construção (MVP aprovado)

```text
     1 a 4 pessoas, 1 navegador / dispositivo
                       │
                       ▼
              Render Static (Vite)
                       │
              Frontend TypeScript
       ┌───────────────┼──────────────────────────┐
       │               │                          │
   RNG local        Motor de regras         Casas/eventos JSON
 (sem inferência)   e estado local           + texto-base
       └───────────────┼──────────────────────────┘
                       │
             Save/load .md no navegador
                       │
            [somente ocasiões escolhidas]
                       ▼
             Cloudflare Worker /narrate
             rate limit, cache e validação
                       │
                       ▼
           Workers AI: Gemma 4 (narrador)
                       │
                  texto breve
                       ▼
           UI ou fallback pronto localmente

GitHub PRIVADO (fonte) -> build -> Render Static
Gemini (ferramenta auxiliar de codificação, sem integração financeira ao Google Cloud)
```

**Sem multiplayer em rede na v1:** eliminar sala, WebSocket, Durable Objects, sincronização de turnos, login e banco de estado. Caso um dia haja multiplayer remoto, criar documento e orçamento próprios. A restrição não impede 4 jogadores locais.

**Responsabilidades:** o frontend é autoritativo para sorteios, posições, eventos, inventário, turnos e save; o Worker só controla e limita chamadas de IA, sem chaves expostas no cliente. CORS por origem ajuda, mas **não autentica requisições nem impede abuso**: combinar proteção de endpoint, validação de payload, tamanho, rate limit e orçamento.

**Hospedagem e domínio:** Render Static é a escolha. O caminho `jrpasolini.tech/retro-ghost-85` é intenção sujeita a confirmação do roteamento da subpasta. Ajustar `base` e URLs de assets conforme URL efetivamente servida. GitHub Pages poderá ser espelho **apenas após autorização explícita de publicação**.

**Google Cloud / GenAI App Builder — FORA DO ESCOPO:** por decisão do Junior em 26/10/2026, ficam descartadas a utilização dos créditos promocionais Google Cloud, a criação de agentes GenAI gerenciados e a implantação de serviços Google Cloud neste projeto. Não é necessário investigar a elegibilidade de SKUs ou gastar créditos para concluir o Retro-Ghost-85. **Gemini é permitido exclusivamente como ferramenta externa de apoio à programação**, sem dependência de API ou de serviços pagos Google na aplicação. Dados de saldo, faturamento e benefício promocional não devem constar em documentação pública do jogo.

**Cloudflare Free (fontes oficiais consultadas em 26/10/2026):** Workers Free tem 100.000 requisições/dia; Workers AI oferece 10.000 Neurons/dia grátis (orçamento distinto de requisições e **diferente** de tokens). Modelo catalogado: `@cf/google/gemma-4-26b-a4b-it`. Medir consumo real no painel e confirmar acesso da conta. Fontes: https://developers.cloudflare.com/workers/platform/limits/ ; https://developers.cloudflare.com/workers-ai/platform/pricing/ ; https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/ .

**Ordem técnica:** confirmar Workers AI Free/Gemma e Render Static -> esqueleto Vite privado -> motor local com testes -> save/load .md -> Worker/Gemma com quotas e fallback -> integração visual -> deploy e auditoria.

---

## 5. Stack do MVP

| Camada | Escolha | Motivo |
|---|---|---|
| Build | Vite + TypeScript | build estático pequeno e portátil |
| UI | DOM puro ou Preact após wireframe | rapidez e acessibilidade; evitar dependências sem necessidade |
| Dados/regras | JSON versionado + TypeScript no navegador | eventos reproduzíveis e desacoplados de IA |
| Sorteio | API de aleatoriedade do navegador; persistência do resultado no estado/log | sem chamada ao modelo, testes com RNG injetável |
| Estado | objeto local e save/load `.md` | sem sessão remota, contas ou banco |
| Narrador | Cloudflare Worker + Workers AI Gemma 4 | apenas eventos selecionados; templates e cache |
| Testes | Vitest + testes de importação e fallback | proteger regras, estado e robustez |

**Não utilizar Durable Objects na v1.** O frontend deve funcionar e ser jogável mesmo que o Worker esteja totalmente indisponível. Não escolher engine de jogo ou UI pesada antes do protótipo visual.

---

## 6. Estrutura de arquivos proposta

```text
retro-ghost-85/
├── README.md
├── ESTRUTURA.md
├── package.json
├── vite.config.ts
├── index.html
├── public/                # ativos visuais originais/licenciados
├── data/
│   ├── casas.json         # id, título, tipo, efeito, texto-base, variações
│   ├── eventos.json       # eventos e desfechos predefinidos
│   └── versao.json
├── src/
│   ├── main.ts
│   ├── motor/
│   │   ├── dado.ts        # RNG local; sorteios testáveis
│   │   ├── tabuleiro.ts
│   │   ├── efeitos.ts
│   │   └── turnos.ts      # 1–4, pass-and-play
│   ├── estado/
│   │   ├── jogo.ts
│   │   ├── save.ts        # .md
│   │   └── migracao.ts
│   ├── narrativa/
│   │   ├── cliente.ts     # solicitação opcional a /narrate
│   │   ├── cache.ts
│   │   ├── politica.ts    # limites, gatilhos, deduplicação
│   │   └── fallback.ts    # textos-base
│   └── ui/
│       ├── tabuleiro.ts
│       ├── ficha.ts
│       ├── log.ts
│       └── creditos.ts
└── worker/
    ├── src/index.ts       # POST /narrate somente
    └── wrangler.toml
```

**Nota:** a árvore é proposta arquitetural; agentes podem propor melhorias justificadas sem adicionar multiplayer remoto ou serviços pagos.

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
  semente?: number;      // somente se RNG determinístico for adotado
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
semente: 841532 # opcional; somente com PRNG determinístico
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
- Reconstruir estado sem confiar em comandos contidos no diário. Importar sempre como dados, nunca como instruções para Gemma.
- Histórico narrativo preservado; eventos estruturados permitem reconstrução consistente.
- Save editável é aceitável para partida local; definir comportamento diante de dados editados ou inconsistentes. O arquivo não fornece prova criptográfica de integridade.

---

## 8. Contrato do narrador econômico — Gemma 4

**Gemma é mestre de cerimônias, não árbitro.** O conteúdo, o resultado do dado, a casa, o desfecho e o efeito já foram definidos localmente; o modelo apenas apresenta um texto aprovado com tom retrô. **Não solicitar plano, raciocínio, criação de desafios, decisão de regras, escolha de dados ou uso de ferramentas de jogo.**

**Fluxo padrão (0 Neurons):** sorteio local -> cálculo local -> buscar `textoBase` em JSON -> exibir imediatamente -> registrar no diário -> próximo turno.

**Fluxo opcional e esparso de IA:** se um gatilho aprovado ocorrer (por exemplo, início da sessão, marco de capítulo ou final) e cache/limite permitirem, enviar apenas ID de evento, `textoBase` e tom/idioma ao Worker; solicitar saída breve (por exemplo 1–2 frases, limite curto de tokens), sem inventar fatos. Texto retornado pode enriquecer a apresentação mas nunca altera o efeito aplicado.

**Contrato de entrada ilustrativo:**
```json
{
  "eventoId": "marco-10",
  "textoBase": "Seu primeiro programa funcionou.",
  "tom": "misterioso-retro",
  "idioma": "pt-BR"
}
```

**Saída esperada:** `{ "texto": "..." }` com limite de comprimento e tratamento de erro. Se o pedido for **somente repetir** `textoBase`, **não chamar Gemma**: apresentar localmente. A decisão de permitir pequenas variações estéticas deve ser aprovada após medir custo real e avaliar quanto agrega ao desafio.

**Estratégia de economia (obrigatória):**
- **Nenhuma chamada por dado/casa/turno.** Pode-se avaliar um teto inicial como 2–3 ocasiões por partida, mas só fixar depois de benchmark real de Neurons e experiência.
- Cache por `versaoConteudo + eventoId + tom + idioma`, com textos iguais para eventos equivalentes e sem dados pessoais no cache global.
- Prompt mínimo, sem diário completo; saída curta, limite de tokens, sem raciocínio deliberado solicitado; medir tokens de entrada/saída e Neurons efetivamente consumidos.
- Limitar solicitações por IP/sessão e quotas globais; proteger contra reenvios, automatizações e abuso de endpoint. Não confiar apenas em CORS.
- Erro/timeout/429 -> usar `textoBase`, com jogo totalmente funcional; sem repetição automática de requests.
- **Critério do challenge:** demonstrar o uso real e honesto da Gemma 4 na experiência sem afirmar que o modelo controla regras quando isso não acontece. A relevância da IA para a avaliação é um risco a validar.

Modelo identificado no catálogo Cloudflare: `@cf/google/gemma-4-26b-a4b-it`. Disponibilidade na conta e custo efetivo devem ser testados de forma controlada.

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

**Vitória (regra vigente em 27/10/2026):** o primeiro jogador a alcançar a casa 40 — pousando nela ou passando além, com a peça limitada à casa 40 — publica o jogo e encerra a partida, qualquer que seja o projeto. Os pontos de projeto (0 a 100) são placar, aparecem no HUD e no ranking final e desempatam a classificação; não são condição de vitória. A casa 40 ainda concede +10 de projeto ao placar. Uma variante que devolvia o jogador à casa 30 quando o projeto era menor que 100 foi considerada e rejeitada: alongava o final e tirava o ritmo da publicação.

O parágrafo antigo desta proposta preliminar pedia vitória só com `projeto ≥ 100` e deixava quem chegasse curto preso na casa 39. Essa condição não está no motor.

**Energia:** 0 = volta 3 casas e recupera 1. Nunca elimina jogador.

**Atualização de 26/10/2026:** a tabela acima permanece como registro da proposta inicial e foi substituída pelas 40 histórias e consequências em [`src/data/casas.ts`](src/data/casas.ts). As regras atuais, as mudanças das casas 2, 25 e 27 e as fontes de época estão em [`HISTORICO_NARRATIVO.md`](HISTORICO_NARRATIVO.md). A implementação atual usa projeto de 0 a 100 e 2d6; a antiga energia desta proposta não é aplicada.

**Easter egg e partida atual:** os jogadores partem da casa 1, o **prólogo**. O movimento usa normalmente a soma de 2d6. No tabuleiro, a casa 10 é o **Ato 2**, a 20 o **Ato 3**, a 30 o **Ato 4** e a 40 é exclusivamente **ENDGAME · PUBLICAÇÃO**. O troféu de cada ato vai a quem entra primeiro naquela região; a casa 1 não premia. As visitas musicais e o retrato de Einstein continuam ligados às casas 1, 10, 20 e 30. Quando um mesmo jogador visita as quatro, Einstein sorri no monitor central; o progresso não é compartilhado entre jogadores.

---

## 10. Roteiro por etapas (gates) — semana 4

| Etapa | Entrega / critério de saída |
|---|---|
| G0 — Confirmação de escopo | Google Cloud/GenAI App Builder e créditos removidos. Gemini é apenas assistente de codificação. Verificar disponibilidade da Gemma 4 e limites do Workers AI Free |
| G1 — Stack e viabilidade | Confirmar Render Static, Worker, acesso ao Gemma 4 Free, orçamento de Neurons e design de fallback |
| G2 — Núcleo offline | POC local: tabuleiro, dado de RNG local, regras e turnos até 4 no mesmo dispositivo; testes |
| G3 — Persistência | Exportar/importar `.md` com validação, histórico e testes de regressão |
| G4 — Narrador econômico | `/narrate` com template pronto, IA em marcos esparsos, cache, rate limit, uso medido e fallback |
| G5 — Experiência e conteúdo | Wireframe, arte original, responsividade e acessibilidade; só então ratificar casas, texto-base, desafios e equilíbrio |
| G6 — Auditoria e publicação | Testes, licenças, segurança, controle de quotas, README, deployment e documentação do uso Gemma |

**Critério de corte:** preservar o jogo completo com seus textos-base e, se possível, integrações demonstráveis com Gemma. Nunca bloquear jogadas por indisponibilidade da API. **Não implementar multiplayer em rede nesta versão** e nunca publicar o repositório privado sem autorização explícita.

---

## 11. Riscos e decisões abertas

| Risco | Estado | Diretriz |
|---|---|---|
| Marca MSX | resolvido para nome | citações históricas com atribuição; sem ativos proprietários |
| Identificador/modelo Gemma | catálogo verificado | testar disponibilidade real na conta, latência e saída curta |
| Quota Workers AI Free | limite documentado | 10.000 Neurons/dia; cache, gatilhos esparsos e fallback |
| Relevância da IA para o challenge | aberto | demonstrar valor narrativo real da Gemma sem exagerar função |
| Render em subpasta | pendente | validar URL/base path e roteamento efetivo |
| Segurança do Worker público | pendente | rate limit, limites de payload e orçamento diário; CORS não basta |
| Artigos MSX | pendente | revisão de direitos antes da publicação |
| Google Cloud e créditos | **retirados do escopo** | não criar agentes Google Cloud, não provisionar recursos nem gastar créditos neste projeto |
| Repositório GitHub | privado | não publicar sem aprovação |
| Multiplayer remoto | **fora do escopo v1** | repensar em versão futura, se houver demanda |

---

## 12. Registro de decisões

- **26/10/2026 — Render entra.** Não como backend, mas como hospedagem estática sob
  `jrpasolini.tech`. Decisão do Junior; corrige a recomendação anterior de cortar.
- **26/10/2026 — o modelo não raciocina.** Ele narra template pronto. Decisão do Junior.
- **26/10/2026 — simplificação consolidada.** Junior ratificou 1–4 jogadores locais, sem multiplayer remoto; dado e efeitos 100% locais; Gemma 4 só para apresentação eventual de templates e nunca para controle de regras. Limites Free e resiliência priorizados.
- **26/10/2026 — Google Cloud cancelado no Retro-Ghost-85.** Junior descartou o uso do GenAI App Builder, agentes hospedados no Google Cloud e créditos promocionais. A Gemma 4 via Cloudflare Workers AI Free permanece como narradora; Gemini pode apoiar a escrita de código, sem ser componente de produção do jogo. Motivo: manter a arquitetura enxuta e concentrar a demonstração de IA aberta na Gemma.
- **26/10/2026 — artigos ficam para depois.** Precisam de revisão de direitos (jogos
  citados). Não publicar antes disso. Revisão da recomendação anterior de publicar a
  Parte A durante a semana 4.
- **26/10/2026 — nome decidido: Retro Ghost 85.** MSX fora do título, presente só na narrativa e nos créditos.

---

## 13. Direção visual — responsabilidade da Bruna

**Objetivo:** criar identidade original de terminal doméstico de 1985 com atmosfera Halloween leve, sem confundir com emulador ou reproduzir ROMs/logotipos. Entregáveis sujeitos à aprovação: (a) moodboard e referências; (b) paleta/tipografia com licenças verificadas; (c) wireframe desktop e mobile; (d) componentes visuais de tabuleiro, peças, dado, ficha e log do mestre; (e) estados de carregamento/narração opcional indisponível e tela de créditos; (f) checklist de contraste, teclado, toque e movimento reduzido.

**Diretrizes iniciais:** verde-fósforo/âmbar e CRT como inspiração, não obrigação de monocromia; texto legível; animações não bloqueantes; sons opcionais; nada de assets oficiais do MSX ou de terceiros sem licença. Produzir imagens e recursos originais e entregar especificação/código/assets ao repositório mediante revisão. Separar direção visual de mecânica ainda não decidida.

## 14. Papéis e integração entre agentes

- **Junior:** product owner, aprovação das decisões de escopo, gastos, merges e publicação.
- **Gemini:** ferramenta auxiliar de codificação e revisão, com tarefas incrementais e mudanças rastreadas em branches/PRs quando possível. Não usar GenAI App Builder, créditos promocionais ou runtime no Google Cloud. Antigravity não é dependência ou requisito do projeto.
- **Bruna:** direção visual, revisão de arquitetura, coerência dos requisitos e auditoria de UX, segurança e entregas antes da aprovação do Junior.
- **Codex / Grok Bot / Cursor Pro:** apoio opcional em revisão independente, testes e auditoria; evitar agentes sobrescrevendo os mesmos arquivos simultaneamente.
- **GitHub:** fonte canônica; `master` protegida por revisão humana quando possível; segredos e dados privados fora do código/commits.

## 15. Decisões pendentes de aprovação

1. Prova controlada de acesso à Gemma 4 pelo Cloudflare Workers AI Free, com medição de Neurons e fallback.
2. Política de economia da Gemma (quais marcos acionam IA, limites por partida, cache, métricas de Neurons).
3. Teste real do contrato de narração da Gemma 4 no Workers AI; sem ferramentas de jogo.
4. Regras de cooperação/competição **local**, condições de vitória, conteúdo das 40 casas e progressão.
5. Endereço público, espelhamento GitHub Pages e estratégia de lançamento ao final do desafio.
6. Aprovação dos wireframes e da identidade visual.

> **26/10/2026 — revisão anterior Bruna (SUPERADA):** foi considerada uma arquitetura com mestre agêntico e multiplayer online via Durable Objects. **26/10/2026 — decisão posterior do Junior (VIGENTE):** retomar a solução enxuta da Melissa: pass-and-play local, Gemma apenas como apresentadora narrativa de conteúdos prontos em ocasiões econômicas, RNG e regras no navegador. Sem Durable Objects no MVP.


---

## 16. Logbook de implementação

### 26/10/2026 — Etapa 1: fundação visual interativa do tabuleiro

**Status:** concluída e validada no navegador.

- Criado o esqueleto Vite + TypeScript, sem framework de UI e sem backend.
- Integrada a arte 16:9 aprovada como cenário original do tabuleiro.
- Mapeadas as 40 casas como botões semânticos sobre a arte, com seleção por clique/teclado e painel de inspeção.
- Inseridos os quatro jogadores locais, selecionáveis no tabuleiro e no console inferior; todos começam na casa 1.
- Os nomes, tipos e efeitos atuais vêm da proposta preliminar da seção 9 e continuam sujeitos à revisão de conteúdo e balanceamento.
- A casa 24 preserva visualmente o prompt BASIC inspirado, sem logotipo ou marca MSX na identidade do produto.
- A arte usa apenas a identidade original Retro-Ghost-85; a fotografia pixelada de Einstein aparece como referência histórica/decorativa na composição aprovada.
- Fontes foram incorporadas ao bundle para evitar dependência de CDN em execução.
- Adicionados foco visível, link de salto, rótulos acessíveis, região viva do inspetor e suporte a movimento reduzido.
- Build de produção executado com sucesso: `npm run build`.
- QA visual documentado em `design-qa.md` com resultado aprovado.

**Fronteira desta etapa:** não foram implementados dado, turnos, movimento, aplicação de efeitos, save/load, Worker ou Gemma. O botão de jogabilidade permanece propositalmente desativado.

**Contrato para o Antigravity/Gemini:** implementar a jogabilidade sobre a estrutura existente; usar `src/data/casas.ts` como fonte inicial; preservar as coordenadas e acessibilidade dos hotspots; mover as quatro peças atualizando o estado em vez de redesenhar o tabuleiro; não introduzir multiplayer remoto, serviços Google Cloud ou dependência obrigatória de IA.

### 26/10/2026 — Etapa 2: motor local de dados, movimento e turnos (RNG 2d6)

**Status:** concluída e validada com testes automatizados e build.

- Criado o módulo `src/motor/dado.ts` para sorteio de dois dados locais (2d6) sem chamadas de rede ou inferência de IA.
- Implementado suporte à Crypto API do navegador (`crypto.getRandomValues`) com fallback seguro para `Math.random`.
- Adicionado gerador determinístico por semente Mulberry32 (`criarRngSemente`) para viabilizar testes unitários e futuras reproduções de partidas (`semente`).
- Criada suíte de testes unitários com o test runner nativo do Node.js (`src/motor/dado.test.ts`), integrada ao script `npm test`.
- Integrado o painel interativo de rolagem no console lateral (`src/main.ts` e `src/style.css`), com botão temático "ROLAR DADOS [2D6]", animação retrô de rolagem (com suporte a `prefers-reduced-motion`) e anúncio acessível para leitores de tela (`aria-live="polite"`).
- O sorteio identifica o jogador atualmente selecionado/ativo e exibe o feedback visual e textual imediato do resultado.
- Implementados movimento, efeitos determinísticos, alternância entre quatro jogadores locais, jogadas extras, turnos perdidos, condição de vitória e retorno à casa 30 quando o projeto ainda não alcançou 100.
- Extraída a rotação de turnos para `src/motor/turnos.ts`, com testes para rotação completa, jogadores pulados e bloqueio de jogada após encerramento.

**Fronteira desta etapa:** save/load em Markdown, Worker/Gemma e integração de narrativa opcional ainda serão implementados nas próximas etapas.

### 27/10/2026 — Etapa 3: trilha dinâmica ElevenLabs e cassete de save/load

**Status:** concluída em implementação; validada com testes automatizados, build e QA no navegador.

- Integradas seis faixas originais criadas com ElevenLabs Music: introdução, quatro atos e encerramento de vitória.
- A música é global para a mesa e avança quando o primeiro jogador alcança um novo ACT; nunca retrocede quando outro jogador permanece em um ato anterior.
- A introdução toca antes da primeira jogada, o ACT 1 assume no início da partida e a faixa `endgame` substitui a trilha do tabuleiro quando há vitória.
- Adicionados controle de áudio, faixa atual e volume, respeitando a exigência de interação do navegador antes da reprodução.
- Os dados funcionais permanecem no painel direito. Os dados decorativos da barra inferior foram cobertos por um gravador de dados original inspirado em equipamentos de 1985, sem marca ou logotipo de terceiros.
- A tecla `REC / SAVE` exporta a partida como Markdown e a tecla `PLAY / LOAD` importa o arquivo `.md`.
- O save contém somente estado estruturado validado; nomes, imagens e HTML não são aceitos do arquivo importado, reduzindo risco de injeção.
- Adicionados testes para progressão musical global, faixa de vitória, serialização Markdown e rejeição de saves inválidos.
- Corrigido o início da partida: os quatro jogadores agora começam na casa 1, apresentada por um popup `ACT 1 · BOOT`; a casa 40 foi reservada ao encerramento `ENDGAME · PUBLICAÇÃO`.
- Saves anteriores são migrados ao carregar, convertendo a antiga visita inicial da casa 40 para a casa 1.

**Fronteira desta etapa:** o diário narrativo completo dentro do save, a integração opcional com Gemma e o deploy público permanecem para as próximas etapas.

### 27/10/2026 — Etapa 4: configuração de participantes e CPU local

**Status:** concluída em implementação; validada com testes automatizados, build e navegador.

- O popup inicial ganhou uma etapa para configurar de 1 a 4 participantes.
- Cada slot pode ser humano ou CPU local; partidas exigem ao menos um humano e CPU só faz sentido com dois ou mais participantes.
- Jogadores humanos aceitam nomes personalizados; CPUs recebem nomes sequenciais automáticos.
- A CPU não possui dificuldade nem personalidade: usa o mesmo RNG 2d6 e as mesmas regras, chamando diretamente o motor na própria vez.
- O botão de dados permanece bloqueado durante turnos automáticos; jogadas extras e turnos perdidos continuam respeitados.
- Nome e tipo de controle foram incorporados ao save Markdown, mantendo migração para saves anteriores.
- Entradas de nome são normalizadas, limitadas e escapadas antes de aparecerem no DOM.
- A estratégia detalhada foi registrada em `estrategia.md`.

**Fronteira desta etapa:** Gemma continua somente como narradora opcional; não controla CPU, dados ou decisões do jogo.

### 27/10/2026 — Etapa 5: auditoria de partida completa, trilhas e gamelog

**Status:** concluída em implementação; validada com simulação determinística, 36 testes e build.

- Corrigido o ciclo das trilhas: introdução e ACTS 1–4 reiniciam ao terminar; `CONGRATULATIONS` permanece sem loop.
- O avanço musical agora acontece quando o primeiro jogador entra na faixa de um novo ato, mesmo que o resultado de 2D6 pule exatamente as casas 10, 20 ou 30.
- O gamelog ganhou uma versão compacta sobre a área `GAME LOG` da arte, posicionada depois do prompt `>`; o painel lateral mantém a mensagem completa.
- As duas mensagens são derivadas da mesma estrutura de dados da jogada, evitando divergência de nome, dados, destino, efeito, projeto e próximo turno.
- As peças ficam centralizadas quando estão sozinhas e só se distribuem quando compartilham uma casa. As posições foram verificadas programaticamente contra os limites das 40 casas.
- Simulada uma partida humano × CPU com o nome fictício `Alex`: Alex venceu a CPU-1 em 19 jogadas, na casa 40, com 100/100 de projeto; os dois alcançaram os quatro atos.
- A suíte cobre reinício das músicas, não repetição do endgame, salto de marcos, consistência do gamelog, posição das sprites e partida completa humano × CPU.

**Validação:** `npm test` com 36 testes aprovados e `npm run build` concluído sem erros.

### 27/10/2026 — Etapa 6: boot, cassete, endgame, troféus, game log e casa 40

**Status:** concluída em implementação; validada com testes automatizados, build e navegador.

- O popup de boot não oferece mais “OUVIR INTRO”. A introdução toca em segundo plano assim que o navegador libera o áudio (primeiro clique ou tecla, inclusive no setup). Se o autoplay for bloqueado, o controle de volume no canto superior continua sendo o mute; a recusa do navegador não gera erro.
- O gravador da barra inferior passou a usar PNG (`public/assets/cassette-save-load.webp` era um WebP VP8X com canal alfa que o navegador da prévia tratava como imagem quebrada e mostrava só o texto alternativo). REC/SAVE e PLAY/LOAD continuam sobre a arte.
- A vitória é chegar primeiro à casa 40, com ou sem 100 de projeto. Não há mais retorno à casa 30. O projeto permanece placar e desempate.
- Ao vencer, abre o diálogo ENDGAME · PUBLICAÇÃO: parabéns com o nome, projeto final, quantidade de rolagens, caminho casa a casa e ranking. “Nova partida” volta ao setup. Esc ou “Ver tabuleiro” fecha o diálogo sem apagar o estado, e REC/SAVE continua válido; “Ver endgame” reabre a tela.
- A área “O Mestre narra” mostra um resumo local determinístico da trajetória. “Ouvir o Mestre” e “Baixar troféu (MP3)” existem, ficam desabilitados e apontam para `src/narrador/narrador.ts`, que responde `unavailable` / “narração em breve”. Nenhuma chamada de rede.
- Troféus exclusivos nas casas 10, 20 e 30 e no endgame: o primeiro a entrar no ato (passar pela casa conta) leva o troféu com id, turno e caminho naquele instante. Quem chega depois não leva. O endgame pode ir para quem não tem nenhum troféu de ato. A casa 1 ficou, nesta etapa, marcada como troféu de abertura; a etapa seguinte retirou essa premiação.
- O painel GAME LOG ao lado do cassete lista todos os lances desde o início (turno, jogador, dados, origem→destino, casas passadas, efeito, delta de projeto, troféus, vitória), com a entrada mais nova visível, rolagem por mouse e teclado e uma marca na cor do jogador. Esse log é a fonte da verdade do Markdown: seção “Game Log” e uma trajetória por jogador, restauradas no setup e no PLAY. `getPlayerTrajectory(log, jogadorId)` devolve os lances daquele jogador, da casa 1 até agora, e é o que a narração futura do Mestre consome.
- O save também grava o cursor do RNG. Carregar a partida e continuar produz a mesma sequência de 2d6. O resumo do boot e o elenco saem da mesma lista de assentos confirmada na tela; “Ajustar jogadores” devolve essa lista.
- A casa 40 ganhou a ilustração `public/assets/casa-40-endgame.webp`, no mesmo encaixe das artes de ato (rótulo ENDGAME · PUBLICAÇÃO: prateleira de 1985, caixa, disquete e troféu). O Ato 4 permanece na casa 30. O caminho é relativo (`./`), como o restante do bundle.

**Validação:** `npm test` e `npm run build`.

### 27/10/2026 — Etapa 7: prólogo na tela de setup e troféus nos atos do tabuleiro

**Status:** concluída em implementação; validada com testes automatizados, build e navegador.

- A casa 1 é o prólogo, sem troféu, sem narração e sem popup. A história — desenvolvedor em 1985, projeto publicável, objetivo de chegar à casa 40, atos nas casas 10, 20 e 30 — vive num único texto em `src/data/intro.ts`, lido pela tela de escolha dos jogadores. INICIAR JORNADA confirma o elenco visível, fecha o setup e abre o tabuleiro com todos na casa 1 e o dado livre na vez humana. Não há diálogo de boot depois do setup.
- A casa 10 continua sendo o Ato 2 do tabuleiro (efeito da casa, banda e Einstein intactos) e também o portão do troféu do Ato 2. Casa 20 = Ato 3, casa 30 = Ato 4, casa 40 = Endgame. O primeiro a entrar em cada região (pousar na casa ou passar além dela) ganha o troféu. O endgame continua com quem chega primeiro à casa 40.
- Saves antigos que gravaram `act1` carregam; essa chave é descartada e não volta a ser gravada. O Markdown nomeia os troféus como Ato 2, Ato 3, Ato 4 e Endgame.
- A conquista abre um diálogo centrado: “Jogador X chegou ao Ato N”, a trajetória lida do game log (eventos positivos e negativos), a área “O Mestre narra” com esse texto como fallback, “Ouvir o Mestre” e “Baixar troféu (MP3)” desabilitados (“narração em breve”) e CONTINUAR. Enquanto ele está aberto o dado não rola e a CPU espera. Esc e CONTINUAR fecham o diálogo. Vale para humano e para CPU. Se a mesma rolagem também vence, o troféu de ato aparece antes do diálogo de endgame.

**Validação:** `npm test` e `npm run build`.

