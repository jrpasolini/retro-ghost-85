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
8. **Infraestrutura mínima.** Render Static serve o frontend; um Cloudflare Worker invoca Workers AI com controle de acesso/abuso, orçamento e fallback. **Sem Durable Objects, banco ou WebSockets na v1.** Google Antigravity/Gemini podem desenvolver o projeto após auditoria da elegibilidade dos créditos Google.
9. **Identidade original e precisão histórica.** Referências ao MSX somente na ambientação, sem ROMs/BIOS/logos oficiais sem licença. Conteúdo das 40 casas ainda é proposta, não requisito fechado.
10. **Etapas obrigatórias.** Validar o uso dos créditos de desenvolvimento e realizar prova de inferência mínima antes de fixar mecânicas e arte finais.

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
Antigravity/Gemini (DESENVOLVIMENTO; cobertura do crédito Google a verificar)
```

**Sem multiplayer em rede na v1:** eliminar sala, WebSocket, Durable Objects, sincronização de turnos, login e banco de estado. Caso um dia haja multiplayer remoto, criar documento e orçamento próprios. A restrição não impede 4 jogadores locais.

**Responsabilidades:** o frontend é autoritativo para sorteios, posições, eventos, inventário, turnos e save; o Worker só controla e limita chamadas de IA, sem chaves expostas no cliente. CORS por origem ajuda, mas **não autentica requisições nem impede abuso**: combinar proteção de endpoint, validação de payload, tamanho, rate limit e orçamento.

**Hospedagem e domínio:** Render Static é a escolha. O caminho `jrpasolini.tech/retro-ghost-85` é intenção sujeita a confirmação do roteamento da subpasta. Ajustar `base` e URLs de assets conforme URL efetivamente servida. GitHub Pages poderá ser espelho **apenas após autorização explícita de publicação**.

**Créditos Google Cloud:** o benefício informado como *Trial credit for GenAI App Builder* (R$ 5.677,28 disponíveis, validade 27/05/2027) destina-se potencialmente ao fluxo de **construção por agentes**, não à inferência do jogo. A elegibilidade de Antigravity empresarial/AI Studio Build/SKUs ainda precisa ser comprovada antes de qualquer gasto.

**Cloudflare Free (fontes oficiais consultadas em 26/10/2026):** Workers Free tem 100.000 requisições/dia; Workers AI oferece 10.000 Neurons/dia grátis (orçamento distinto de requisições e **diferente** de tokens). Modelo catalogado: `@cf/google/gemma-4-26b-a4b-it`. Medir consumo real no painel e confirmar acesso da conta. Fontes: https://developers.cloudflare.com/workers/platform/limits/ ; https://developers.cloudflare.com/workers-ai/platform/pricing/ ; https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/ .

**Ordem técnica:** auditoria dos créditos Google -> esqueleto Vite privado -> motor local com testes -> save/load .md -> Worker/Gemma com quotas e fallback -> integração visual -> deploy e auditoria.

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

**Vitória:** chegar à casa 40 com `projeto ≥ 100`. Quem chega sem projeto suficiente
fica preso na 39 e precisa de mais uma volta (reviravolta, não derrota).

**Energia:** 0 = volta 3 casas e recupera 1. Nunca elimina jogador.

---

## 10. Roteiro por etapas (gates) — semana 4

| Etapa | Entrega / critério de saída |
|---|---|
| G0 — FinOps e agentes | Auditar elegibilidade do crédito Google para construir código via Antigravity/Gemini; sem gasto não aprovado |
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
| Crédito Google | pendente | verificar SKU/uso com agentes, não presumir elegibilidade |
| Repositório GitHub | privado | não publicar sem aprovação |
| Multiplayer remoto | **fora do escopo v1** | repensar em versão futura, se houver demanda |

---

## 12. Registro de decisões

- **26/10/2026 — Render entra.** Não como backend, mas como hospedagem estática sob
  `jrpasolini.tech`. Decisão do Junior; corrige a recomendação anterior de cortar.
- **26/10/2026 — o modelo não raciocina.** Ele narra template pronto. Decisão do Junior.
- **26/10/2026 — simplificação consolidada.** Junior ratificou 1–4 jogadores locais, sem multiplayer remoto; dado e efeitos 100% locais; Gemma 4 só para apresentação eventual de templates e nunca para controle de regras. Limites Free e resiliência priorizados.
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
- **Google Antigravity + Gemini:** implementação incremental sob tarefas pequenas, preferencialmente em branches/PRs; devem respeitar esta estrutura e não assumir elegibilidade do crédito.
- **Bruna:** direção visual, revisão de arquitetura, coerência dos requisitos e auditoria de UX, segurança e entregas antes da aprovação do Junior.
- **Codex / Grok Bot / Cursor Pro:** apoio opcional em revisão independente, testes e auditoria; evitar agentes sobrescrevendo os mesmos arquivos simultaneamente.
- **GitHub:** fonte canônica; `master` protegida por revisão humana quando possível; segredos e dados privados fora do código/commits.

## 15. Decisões pendentes de aprovação

1. Verificação do escopo do crédito promocional de desenvolvimento agêntico e o primeiro teste controlado.
2. Política de economia da Gemma (quais marcos acionam IA, limites por partida, cache, métricas de Neurons).
3. Teste real do contrato de narração da Gemma 4 no Workers AI; sem ferramentas de jogo.
4. Regras de cooperação/competição **local**, condições de vitória, conteúdo das 40 casas e progressão.
5. Endereço público, espelhamento GitHub Pages e estratégia de lançamento ao final do desafio.
6. Aprovação dos wireframes e da identidade visual.

> **26/10/2026 — revisão anterior Bruna (SUPERADA):** foi considerada uma arquitetura com mestre agêntico e multiplayer online via Durable Objects. **26/10/2026 — decisão posterior do Junior (VIGENTE):** retomar a solução enxuta da Melissa: pass-and-play local, Gemma apenas como apresentadora narrativa de conteúdos prontos em ocasiões econômicas, RNG e regras no navegador. Sem Durable Objects no MVP.
