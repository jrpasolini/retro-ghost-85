# Prompt para o Codex — inspeção visual da arte e auditoria textual completa

> Copie integralmente este documento para uma sessão Codex com acesso ao repositório privado `jrpasolini/retro-ghost-85`. Trabalhe em `audit/editorial-1985-casas`; a branch é proposta, o PR #5 é draft. **Não faça merge, não edite arte, layout ou lógica.**

## Objetivo

Inspecione visualmente **cada uma das 40 casas** da imagem definitiva `public/assets/board-reference-edited.webp` (inclusive áreas pequenas e rótulos rasterizados), além de `public/assets/casa-40-endgame.webp` se usado como sobreposição da casa 40. Faça a correspondência casa → número/posição → desenho/objeto/símbolo → título impresso → título e narrativa em `src/data/casas.ts`. Os marcos 10,20,30 são definidos em `src/data/atos.ts`.

**REGRA ABSOLUTA:** a imagem aprovada NÃO pode ser alterada. Não mudar coordenadas, CSS, layout, imagens, sprites, trilhas, mecânica, efeitos, títulos, nomes de atos ou numeração para ajustar texto. Quando detectar contradição, proponha corrigir só o texto e documente.

## Passo a passo

1. Confira checkout exato da branch `audit/editorial-1985-casas` e leia `AUDITORIA_EDITORIAL_1985.md`, `PROPOSTA_TEXTUAL_40_CASAS.md` e `MATRIZ_VALIDACAO_VISUAL.md`.
2. Abra a imagem WEBP original **como imagem**, não apenas como bytes, hashes ou texto alternativo. Leia a resolução real; amplie as 4 bordas e recorte por grupos de casas. Faça o mesmo com a imagem overlay da casa 40. **Proibido alegar validação visual sem ter de fato visto os pixels.** Se não conseguir abrir a imagem, devolva status bloqueado e nenhuma casa como validada.
3. Para cada número de 01 a 40, localize a casa na arte e identifique o objeto/ação/texto impresso exatos, mesmo que resumidos. Cruzar cada um com `titulo`, `narrativa`, `tipo`, `efeito` e `consequencia` do código. Quando o título do código não estiver impresso ou for ilegível, registre isso; nunca deduza o desenho exclusivamente pelo título.
4. Preencha cada linha da `MATRIZ_VALIDACAO_VISUAL.md` com `elemento visto`, `OK/AJUSTAR TEXTO/INDETERMINADO`, motivo e trecho revisado sugerido, **sem alterar a imagem**. Recomendações de texto devem manter tom nostálgico e divertido; fatalidades recebem suspense tecnológico leve, sem sobrenatural real nem anacronismos.
5. Confirme que a casa 2 é um disquete acessado por drive de um colega e que a casa 11 introduz o drive da bancada sem contrariar desenhos. Compare atenção especial a 13 (MSX-DOS 1; sem subdiretórios, demanda drive + >=64KiB), 16 (VRAM), 19 (rolagem simulada), 21–23 (BBS e linha telefônica), 37/39 (prévia/concurso) e 40 (catálogo). Em caso de conflito com a imagem, a arte vence.
6. Verifique se as fatalidades e eventos negativos realmente justificam os efeitos visíveis (+/- projeto, andar, turno) sem sugerir deslocamento por segunda casa, energia, inventário ou regras que não existem. Preserve os dados e o efeito literal.
7. Faça uma passagem textual completa do jogo: `src/data/intro.ts`, `src/data/atos.ts`, `src/data/casas.ts`, `src/main.ts` (texto exibido), `src/motor/log.ts`, `src/motor/gamelog.ts` e `src/motor/partida.ts`. A abertura deve apresentar uma vez 'Você é um desenvolvedor em 1985' e não repetir a premissa no parágrafo seguinte ou na casa 1. Separe textos UI modernos dos fatos narrados na época.
8. Inspecione a UI em tela 1920x1080 e viewport menor caso ambiente permita. Abra cenas com texto longo (casas 3,6,10,13,15,19,20,23,27,30,32,36,38,40). Verifique leitura no painel/inspetor, scroll, cortes, palavras longas, contraste. **Não altere layout**; apenas relate.
9. Rode os comandos de testes e build previstos no `package.json` se possível. Registre comandos/saídas reais. Não diga que executou caso não tenha executado. Não realize alterações em produção, deploy ou publicações.

## Entrega obrigatória ao autor e à Bruna

Publique um comentário no PR https://github.com/jrpasolini/retro-ghost-85/pull/5 (se tiver permissão) com:

- Resultado total **N/40 efetivamente vistas**, separando OK, revisão textual e ilegíveis.
- Tabela de 40 linhas: `Nº | ícone/desenho/rótulo VISÍVEL | correspondente no código | diagnóstico | correção textual sugerida`.
- A primeira citação gráfica precisa ser observação de pixels, não uma paráfrase do código.
- Um bloco com problemas históricos, um com repetições da abertura e um com possíveis falhas de legibilidade da UI.
- Resultados verificáveis de testes/build executados, com limitações.
- Conclusão: `PR APTO PARA REVISÃO EDITORIAL`, `PR COM AJUSTES PENDENTES` ou `INSPEÇÃO VISUAL BLOQUEADA`; **nunca autorizar merge unilateralmente**.

Se puder editar documentação, atualize exclusivamente `MATRIZ_VALIDACAO_VISUAL.md`, colocando observações reais da arte. **Não modifique código neste job**; Bruna e o autor usarão seu feedback para decidir o próximo commit.

## Fontes para verificação histórica

- https://direct.msx.org/wiki/MSX-DOS_1
- https://www.msx.org/wiki/The_History_of_MSX-DOS
- https://www.msxarchive.nl/pub/msx/docs/manuals/msxtech.pdf

Retorne comentário no PR. Se não puder, apresente o relatório na sessão, pronto para a Bruna revisar.