# MATRIZ DE VALIDAÇÃO VISUAL — TABULEIRO IMUTÁVEL

> Status: **PENDENTE de inspeção visual verificável**. A screenshot compartilhada na conversa não ficou disponível para leitura ampliada pelas ferramentas desta execução. Foi possível consultar os arquivos de código pelo GitHub; a imagem raster binária do repositório não foi disponibilizada pelo conector de texto. **Nenhuma das 40 casas foi certificada visualmente neste documento.**

## Fonte de verdade visual

- Arte do tabuleiro: `public/assets/board-reference-edited.webp` (não alterar).
- Imagem especial final: `public/assets/casa-40-endgame.webp` (não alterar).
- Hotspots: `src/data/casas.ts` → `caixas` (não alterar).
- Campos narrativos: `src/data/casas.ts`, `src/data/atos.ts` e `src/data/intro.ts`, modificados nesta branch.
- Comparação anterior/revisado: `PROPOSTA_TEXTUAL_40_CASAS.md`.

**Critério de aprovação:** cada frase nova precisa combinar com o desenho, ícone ou texto impresso da casa correspondente. Narrativas podem enriquecer o acontecimento, nunca substituí-lo. Preservar arte, numeração, nomes impressos, hotspot, ordem de casas, títulos e regras.

| Casa | Título no código | Tipo | Elemento gráfico observado | Resultado visual |
|---:|---|---|---|---|
| 01 | A revista na banca | marco | A verificar na imagem | PENDENTE |
| 02 | Disquete de trabalho | evento | A verificar na imagem | PENDENTE |
| 03 | Erro na listagem | fatalidade | A verificar na imagem | PENDENTE |
| 04 | RUN e a tela azul | marco | A verificar na imagem | PENDENTE |
| 05 | Salvar no cassete | evento | A verificar na imagem | PENDENTE |
| 06 | O cassete que não carrega | fatalidade | A verificar na imagem | PENDENTE |
| 07 | Fitas virgens | evento | A verificar na imagem | PENDENTE |
| 08 | Joystick emprestado | evento | A verificar na imagem | PENDENTE |
| 09 | O cartucho do amigo | evento | A verificar na imagem | PENDENTE |
| 10 | Ato 2 · BBS | marco | A verificar na imagem | PENDENTE |
| 11 | O drive de disquete | marco | A verificar na imagem | PENDENTE |
| 12 | Formatar o disco | evento | A verificar na imagem | PENDENTE |
| 13 | Prompt do DOS | marco | A verificar na imagem | PENDENTE |
| 14 | O assembler | evento | A verificar na imagem | PENDENTE |
| 15 | Sprite fora do lugar | fatalidade | A verificar na imagem | PENDENTE |
| 16 | Mapa de memória e VRAM | evento | A verificar na imagem | PENDENTE |
| 17 | Colisão que não colide | fatalidade | A verificar na imagem | PENDENTE |
| 18 | Música em PSG | evento | A verificar na imagem | PENDENTE |
| 19 | O bug de scroll | fatalidade | A verificar na imagem | PENDENTE |
| 20 | Ato 3 · DEBUG | marco | A verificar na imagem | PENDENTE |
| 21 | Modem emprestado | evento | A verificar na imagem | PENDENTE |
| 22 | Discar para a BBS | evento | A verificar na imagem | PENDENTE |
| 23 | Linha ocupada | fatalidade | A verificar na imagem | PENDENTE |
| 24 | O grupo de usuários | marco | A verificar na imagem | PENDENTE |
| 25 | Listagem truncada | fatalidade | A verificar na imagem | PENDENTE |
| 26 | Cópia autorizada | evento | A verificar na imagem | PENDENTE |
| 27 | Disquete com erro | fatalidade | A verificar na imagem | PENDENTE |
| 28 | Revista especializada | evento | A verificar na imagem | PENDENTE |
| 29 | Concurso de programas | evento | A verificar na imagem | PENDENTE |
| 30 | Ato 4 · FINAL | marco | A verificar na imagem | PENDENTE |
| 31 | Teste do controle | evento | A verificar na imagem | PENDENTE |
| 32 | Impressora emperrada | fatalidade | A verificar na imagem | PENDENTE |
| 33 | Disquetes mestres | evento | A verificar na imagem | PENDENTE |
| 34 | A capa | evento | A verificar na imagem | PENDENTE |
| 35 | Duplicação em série | evento | A verificar na imagem | PENDENTE |
| 36 | Caixas trocadas | fatalidade | A verificar na imagem | PENDENTE |
| 37 | Crítica na revista | evento | A verificar na imagem | PENDENTE |
| 38 | A errata grave | fatalidade | A verificar na imagem | PENDENTE |
| 39 | Prêmio dos leitores | marco | A verificar na imagem | PENDENTE |
| 40 | Seu nome no catálogo | final | A verificar na imagem | PENDENTE |

## Questões que exigem atenção especial na imagem

1. **Casa 2 / casa 11:** a nova história diferencia uso do drive de um amigo e aquisição do drive próprio; confirmar se a imagem não comunica uma posse diferente.
2. **Casa 13:** conferir exatamente o que está impresso e ilustrado na casa. MSX-DOS 1 já era possível em 1985, mas não em qualquer configuração. Evitar combinar comandos exclusivos do PC e do MSX.
3. **Casa 19:** a rolagem do cenário é simulada por software; não sugerir tecnologia posterior.
4. **Atos 10 e 20:** títulos `BBS` e `DEBUG` não podem ser renomeados. As transições ampliam o tema sem contrariar as casas que vêm depois.
5. **Casas 37, 39, 40:** distinguir resenha/votação de versão demonstrativa e publicação comercial ao final; conferir se a arte da casa 40 significa catálogo/lançamento.
6. **Fatalidades 3, 6, 15, 17, 19, 23, 25, 27, 32, 36, 38:** suspense tecnológico deve representar o problema da arte e corresponder às perdas de pontuação, recuos ou turnos.
7. **Capa / impressora / distribuição:** checar que as imagens e as histórias correspondam aos objetos de cada casa, sem trocar eventos.

## Procedimento para fechar a pendência

Fazer inspeção nativa e por recortes ampliados de cada casa do WEBP, preencher o campo 'Elemento gráfico observado' e marcar **OK**, **AJUSTAR TEXTO** ou **ILEGÍVEL/INDETERMINADO**. Registrar evidência e proposta de correção textual para divergências. Enviar relatório consolidado ao PR #5 e ao autor; **sem alterar arte ou fazer merge**.

Prompt detalhado para o Codex: `PROMPT_CODEX_VALIDACAO_VISUAL.md`.