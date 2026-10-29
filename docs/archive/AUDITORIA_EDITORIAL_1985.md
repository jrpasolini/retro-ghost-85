> **Historical archive.** This document records earlier planning or QA and may describe superseded behavior. Use the [current documentation](../README.md) and [project README](../../README.md) for the implemented version.

# AUDITORIA EDITORIAL E HISTÓRICA — RETRO-GHOST-85

> 27/10/2026 · Status: REDAÇÃO IMPLEMENTADA APENAS NA BRANCH, conferência visual pendente e revisão do autor obrigatória. Código narrativo alterado (`src/data/casas.ts`, `src/data/atos.ts`, `src/data/intro.ts`, texto de vitória em `src/main.ts`). Sem mudanças na arte, rótulos, posições, regras ou layout. Não fazer merge antes da validação.

## Regra de ouro: tabuleiro congelado

- A arte do tabuleiro e as coordenadas das 40 casas são **imutáveis nesta etapa**. Não tentar corrigir texto impresso criando novas imagens, sobrepondo rótulos, mudando zonas clicáveis ou remapeando casas.
- Os títulos das 40 casas e as denominações **Ato 2 · BBS**, **Ato 3 · DEBUG**, **Ato 4 · FINAL** permanecem. Não mudar títulos no código sem confirmar que são idênticos à arte aprovada.
- Propor somente enriquecimento dos campos narrativos das casas, do prólogo, das narrações-base dos atos e do endgame, sem tocar em efeitos, dados, probabilidade, pontos, turnos, save, música, CPU, Gemma ou interface.
- Onde o texto da arte não puder ser conciliado, registrar **licença poética conhecida** em vez de reabrir projeto gráfico.
- O texto aplicado casa a casa nesta branch está em [PROPOSTA_TEXTUAL_40_CASAS.md](PROPOSTA_TEXTUAL_40_CASAS.md), lado a lado com a versão `master`. **Ainda não está aprovado para merge.**

## Achados de maior impacto

| # | Casas / trecho | Diagnóstico | Solução que não mexe no tabuleiro |
|---|---|---|---|
| 1 | 13, 'Prompt do DOS' | **DOS não é anacronismo**: MS-DOS 1.0 data de 1981, e MSX-DOS 1 tornou-se disponível em 1985. Há, contudo, risco de confundir PC com MSX e usar comandos/recursos posteriores. | Especificar MSX-DOS 1 na descrição; micro com drive e 64 KiB; listar arquivos por DIR, sem hierarquia de diretórios. Título preservado. |
| 2 | 2 e 11 | Na casa 2 o personagem já grava em disquete; só na 11 chega o drive. | Tornar a gravação da casa 2 um empréstimo/visita ao micro de um amigo; o drive próprio chega na 11. |
| 3 | 10–19 (Ato 2 · BBS) | O título antecipa a BBS, mas a conexão ocorre nas casas 21–23. | Tratar BBS no ato 2 como promessa/contato futuro, enquanto a segunda dezena aprimora o motor do jogo. **Sem renomear o ato**. |
| 4 | 20–29 (Ato 3 · DEBUG) | Bugs visuais já aparecem nas casas 15–19. | Apresentar o DEBUG da terceira dezena como testes de terceiros e correções descobertas via clube/revista/BBS. **Sem renomear**. |
| 5 | 37–40 | Crítica publicada e prêmio dos leitores aparecem antes do catálogo/publicação na casa 40. | Casa 37: crítica de **cópia de demonstração** enviada previamente à imprensa; casa 39: prêmio por protótipo/demonstração em concurso; casa 40: lançamento comercial/catalogação. |
| 6 | 16 | A descrição mistura 'memória de vídeo' e 'memória do programa', como se ambas fossem a mesma área sujeita a corrupção direta. | Explicar que o programador corrige endereços/transferências para **VRAM**, evitando erros gráficos, não 'salvando dados do programa' por separação casual. |
| 7 | 19 | Scroll pode soar como recurso de hardware nativo. | Esclarecer **rolagem simulada por software**: redesenho de blocos/colunas ou tiles em VRAM; não insinuar scroll por hardware de máquinas futuras. |
| 8 | 1, 3, 25, 28 | Revista/listagem aparece de forma semelhante. | Diferenciar inspiração (1), erro de transcrição (3), página incompleta (25) e técnica de refatoração/otimização (28). |
| 9 | 5, 6, 7, 27, 33, 35 | Cassete, cópias e discos podem parecer repetição. | Diferenciar primeiro SAVE em fita (5), falha de leitura (6), redundância do backup (7), erro de disco (27), mestre validado (33) e duplicação/distribuição (35). |
| 10 | 8 e 31 | Dois testes com joystick repetem a mesma descoberta. | Casa 8: primeiro contato e sensação física dos controles; 31: teste de usabilidade com outro jogador antes do envio. |
| 11 | 38 | 'Errata' emitida antes do lançamento pode parecer reação a cópias comercializadas. | Tratar como correção de **provas do manual**, da demonstração ou da prévia editorial antes do lote definitivo. |
| 12 | 40 | A narrativa atual menciona regra de vitória, pontuação e impossibilidade de retorno: informação extradiégetica. | Preservar o efeito mecânico fora da narrativa; finalizar com a emoção do primeiro anúncio em catálogo. |
| 13 | Introdução | A frase 'Você é um desenvolvedor em 1985' aparece no título e no primeiro parágrafo. | Tirar repetição e manter prólogo mais sensorial e conciso. |
| 14 | DOCUMENTAÇÃO | 'HISTORICO_NARRATIVO.md', 'ESTRUTURA.md' e 'estrategia.md' misturam rascunhos obsoletos e regras vigentes; são fontes de falsas inconsistências. | Em etapa posterior, marcar trechos históricos como arquivados; **não alterar nesta branch de auditoria**. Ex.: 1d6 vigente, propostas antigas de energia/inventário não se aplicam. |
| 15 | Gemma e áudio | Textos de UI mencionam o Mestre e MP3 apesar do serviço narrador estar indisponível. | Manter placeholders enquanto a próxima etapa não estiver pronta; não prometer IA ativa nos créditos/artigo. |

## Referência de plataforma histórica (sem impor marca ao título)

O conjunto de comandos e recursos descritos — BASIC, RUN, CLOAD, CSAVE, sprites, VRAM, PSG, drive, MSX-DOS — é coerente com uma máquina **compatível com o padrão MSX 1**, equipada com periféricos progressivamente; a família de equipamentos pode variar conforme o mercado e a disponibilidade. O roteiro não precisa revelar marca, fabricante, modelo ou local específico. Em 1985, MSX-DOS 1 estava surgindo comercialmente, e não era recurso obrigatório de todo MSX; exigia drive e pelo menos 64 KiB de RAM.

Nota: O **MS-DOS do IBM PC** também já existia, mas a coexistência temporal **não** significa compatibilidade de executáveis ou comandos/periféricos entre PC e MSX. Referências tecnológicas modernas como Internet comercial, download via web, IDEs gráficas, pendrive, MP3, ROMs 'abandonware' ou chat em rede moderna não devem aparecer **na voz do personagem**. O arquivo Markdown exportável, o botão MP3 e o uso do Gemma pertencem à interface moderna, e podem coexistir sem anacronismo narrativo se distinguidos do universo ficcional.

## Princípios de revisão

1. Preservar título e efeito de toda casa, inclusive o texto curto de efeito e posições; as alterações de código nesta branch revisam somente narrativas e uma frase de endgame.
2. Cada casa precisa de causa própria, obstáculo ou descoberta concreta; evitar começar com 'você' em todas.
3. Tornar a narrativa progressiva: inspiração → protótipo → ferramentas → comunicação/testes → edição/lançamento.
4. Não transformar fatos que *podiam ocorrer* em práticas universais de 1985. BBS, drive e modem eram possíveis, mas não gratuitos nem onipresentes.
5. Evitar 'publicação' prematura antes da casa 40: versões preliminares podem ser mostradas, testadas e julgadas.
6. A linguagem dos diálogos do personagem deve ser histórica; o texto da interface moderna pode usar 'game log', 'CPU', 'save' e 'endgame'.
7. Textos de ato **não podem contradizer a arte impressa**: no Ato 2 já se conhece a futura BBS, no Ato 3 acontece o DEBUG coletivo, no Ato 4 finaliza-se a edição.
8. Se uma diferença com a arte permanecer incontornável, documentar como licença poética aceita, sem reabrir layout.

## Critérios de aceite para eventual merge

- Conferir os rótulos, ícones e textos efetivamente *impressos na imagem* antes de aprovar a integração do conteúdo de produção. A auditoria do código **não substitui** essa inspeção; aqui os textos já foram alterados apenas na branch.
- Aprovar ou rejeitar cada sugestão; comparar conteúdo atual ↔ proposto.
- Manter estrutura `DetalheCasa` (40 entradas) e os mesmos campos `titulo`, `tipo`, `efeito`, `consequencia`, posições e dimensões.
- Rodar testes e build após qualquer integração ao código; nenhuma verificação de build foi necessária nesta branch de documentação.
- Validar narrativa-base dos atos, resumo do endgame, instruções e save; conferir se o narrador futuro recebe o texto correto.
- Tradução **somente depois** de fechar o cânone em PT-BR; depois seletor de idioma; depois Gemma 4; por último ElevenLabs TTS/troféu falado.

## Bibliografia / verificação

- Microsoft, 'The History of Microsoft — 1981' (MS-DOS 1.0 no lançamento do IBM PC, agosto de 1981): https://learn.microsoft.com/en-us/shows/history/history-of-microsoft-1981
- MSX Resource Center, 'MSX-DOS 1' (disponibilidade comercial em 1985, requisitos e limites): https://direct.msx.org/wiki/MSX-DOS_1
- MSX Technical Data Book (documentação de época, DOS, VRAM, periféricos): https://map.grauw.nl/resources/system/msxtech.pdf
- MSX Resource Center, 'CSAVE' (salvamento de BASIC em fita): https://www.msx.org/wiki/CSAVE
- MSX FAQ (comandos de DOS 1 e limitações de diretórios): https://www.faq.msxnet.org/suffix.html
- Artigo histórico sobre programas impressos para digitação: https://code198x.com/vault/distribution/type-in-listings/

## Situação

**Branch com conteúdo narrativo atualizado**, sem alterações de funcionalidade ou arte. Comparação dos textos em `PROPOSTA_TEXTUAL_40_CASAS.md`; o prompt externo de validação visual foi arquivado fora do repositório. Não efetuar merge sem aprovação editorial e checagem visual final.

## Decisão do autor: abandonar experimentação gráfica nesta etapa

Após comparar as propostas gráficas, o autor optou por **preservar inteiramente a arte atual**, por risco desnecessário de desalinhamento e por não ser prioridade do desafio. A camada v2 foi retirada e não consta mais na versão executada; a imagem WebP original permanece intacta.

A auditoria visual externa foi útil para orientar **apenas a contextualização dos textos** das 40 casas. As 15 narrativas previamente apontadas como divergentes foram harmonizadas com seus símbolos, sem alterar títulos, efeitos ou mecânicas. A casa 19 permanece como exceção visual conhecida, aceita sem modificação de layout. O prompt antigo de validação visual é histórico e não deve ser reexecutado como tarefa de desenho.

**Escopo para a aprovação do PR #5:** precisão e plausibilidade histórica de 1985, unidade de voz, suspense divertido nas fatalidades, variedade e continuidade da narrativa, legibilidade, compatibilidade com efeitos e testes. A sequência futura segue inglês → seletor de idioma → Gemma 4 → áudio ElevenLabs.

Consulte [DIRECAO_EDITORIAL_1985.md](DIRECAO_EDITORIAL_1985.md) para as regras revisadas.
