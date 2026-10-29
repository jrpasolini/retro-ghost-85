# Retro-Ghost-85 — direção editorial e revisão histórica (1985) · arquivo histórico
 
 > **Arquivo de decisões da revisão original.** As instruções de não fazer merge e o plano de implantar Gemma 4/voz "depois" foram superados. Código vigente: [STATUS_ATUAL.md](STATUS_ATUAL.md); preservar observações históricas sobre 1985 e a arte. Nenhuma reedição da geometria do tabuleiro está autorizada por este registro.

> Revisão de conteúdo aplicada originalmente somente na branch `audit/editorial-1985-casas`. Preservar a aparência e a geometria do tabuleiro. Texto ficcional, com vocabulário e tecnologias plausíveis para o período; o clima de suspense é literário, não alegação de sobrenatural. Não fazer merge sem revisão do autor.

## Identidade do texto

O leitor acompanha uma pessoa que tenta criar e publicar um jogo em 1985. A aventura deve soar como memória afetiva de um micro de 8 bits: teclado aquecido, monitor de fósforo, revistas impressas, fitas, disquetes, noites de tentativa e erro, clube de usuários e BBS. Fatalidades devem parecer pequenos episódios de horror técnico: a fita que não carrega, a página que falta, o disquete que não responde, o cursor que não oferece explicações. Falar do **problema real**, não apenas do efeito mecânico.

### Cadência das quatro etapas

- **Prólogo e casas 1–9:** descoberta do BASIC, listagens, primeiro RUN, cassete, cartucho e controle; a primeira visita à casa 1 não dá prêmio.
- **Ato 2 · BBS, casas 10–19:** o clube fornece um contato futuro de BBS; antes da primeira conexão, ferramentas, disquetes, rotinas em assembler e depuração técnica tornam o jogo demonstrável. O título do ato **não é renomeado**.
- **Ato 3 · DEBUG, casas 20–29:** investigação com a ajuda da comunidade, modem, BBS, cópia demonstrativa, revistas técnicas e concurso; a fase de depuração se amplia para além da bancada.
- **Ato 4 · FINAL, casas 30–40:** usabilidade, mestre, capa, impressão, duplicação, crítica da **demonstração**, votação da **prévia** e publicação no catálogo somente na 40.

## Verificação histórica e seus limites

| Tema | Uso no jogo | Comprovação e cautela |
|---|---|---|
| Revista e listagem em BASIC (1,3,25,28,29) | Início do projeto, erro de transcrição, folha incompleta, dica editorial, concurso | A revista brasileira *Micro Sistemas* teve edições em 1985. Enredos e concursos são episódios ficcionais, não relato de uma edição específica. https://datassette.org/es/revistas/informatica/br-brasil/micro-sistemas |
| Fita cassete (5,6,7) | Salvar/recuperar, diferença entre backup e leitura, limpar o gravador | MSX-BASIC tinha `CSAVE` para gravar programas em fita e `CLOAD` para carregar. https://www.msx.org/wiki/CSAVE |
| Disquete e DOS (2,11–13,27,33,35) | A casa 2 utiliza drive de um amigo; a 11 traz o drive próprio; a 13 é **um PC do clube** com MS-DOS e `C:\>` | MS-DOS 2.0 já suportava disco rígido em março de 1983; `C:\>` é plausível num PC com unidade C em 1985. MSX-DOS 1 também existia em 1985, mas é outro sistema: não atribuir ao MSX o prompt `C:\>`. https://mitchwaite.com/wp-content/uploads/2023/11/Tricks-of-the-MS-DOS-Masters-2.pdf ; https://direct.msx.org/wiki/MSX-DOS_1 |
| Chips, sprites e VRAM (14–17,19) | Código de máquina em micro 8-bit, bugs de coordenada, RAM/VRAM distintas e scroll **simulado por software** | Conservar linguagem de máquina de 8 bits e limitações de vídeo. Não insinuar rolagem suave por hardware de sistemas posteriores. https://manuals.plus/m/a455b4ed860592adacd0d99eebbf03ce3696eeb2d567f65e883669f0c97d142f |
| PSG e joystick (8,18,31) | Música de três canais, parâmetros de duração, jogo testado por outra pessoa | O PSG AY-3-8910 dos MSX era de três vozes e também participava da interface de joystick. Não tratar áudio moderno/MP3 como recurso do micro de 1985. https://direct.msx.org/wiki/PSG |
| Modem, BBS, linha telefônica (10,20–24) | A ligação ocupa uma linha real; estar ocupado provoca espera; a BBS é usada como troca de mensagens e dicas | Práticas plausíveis de microinformática e comunicação da época, não Internet comercial nem web. Referência contemporânea: https://www.worldradiohistory.com/UK/Practical-Computing/80s/Practical-Computing-1984-12-S-OCR.pdf |
| Trabalho editorial (30–40) | Mestre, duplicação manual, impressão matricial, recorte da revista, revisão e edição de catálogo | Cenário ficcional plausível; a crítica e a votação antes da 40 são da demonstração. A **publicação comercial** só acontece na casa 40. |

## Regras narrativas e mecânicas

1. Os títulos, os efeitos e as consequências são contratos do motor; o texto os dramatiza, mas nunca muda resultado do dado, ganho de pontos, recuo, jogada extra ou turno perdido.
2. A imagem é a âncora: toda explicação deve levar a pessoa a reconhecer o desenho da casa, seja literalmente ou por metáfora natural.
3. Evitar mais de uma explicação da premissa “você é um desenvolvedor em 1985”: ela já está no título da tela inicial. As casas começam pelo **acontecimento**.
4. Não atribuir ao personagem conhecimento ou equipamentos modernos. `save .md`, Gemma 4, MP3 e ElevenLabs são recursos **da interface atual**, não do universo da história.
5. A casa 13 usa o ícone e a frase `C:\>` já presentes na arte; **não** substituí-la por uma tela minúscula com `A>DIR`.
6. Para fatalidades, dar corpo ao obstáculo técnico e ao custo emocional; para eventos positivos, mostrar descoberta concreta e sensação de progresso.
7. Quanto à casa 19, a auditoria visual externa não encontrou seu número/ícone discernível, mas o hotspot existe e a narrativa permanece válida. Não mover a 19 nem a 20.
8. Evitar reescrever o passado: MS-DOS 1 já existia desde 1981, MS-DOS 2 desde 1983 e MSX-DOS 1 tornou-se disponível em 1985, cada qual em contexto de máquina diferente.

## Escopo atual: tabuleiro original congelado

**Decisão do autor em 27/10/2026:** interromper o redesenho das casas. A experiência com pictogramas e novas imagens teve custo técnico/artístico desproporcional ao valor para o challenge. Esta etapa é **exclusivamente histórica e editorial**, não gráfica.

- Fonte visual definitiva: `public/assets/board-reference-edited.webp`, **sem alterações** (Git blob SHA-1 `9207fc16a5bf28e2dbdba298090375986f7b3afe`).
- A sobreposição SVG experimental foi **retirada** do renderizador e da branch. Não gerar, substituir ou recortar imagens de casas nesta etapa.
- Preservar inalterados `caixas` em `src/data/casas.ts`, hotspots, `posicaoDaPeca`, 1–4 peças em uma casa, layout e imagens existentes.
- Priorizar **conteúdo textual**: cada história deve ser interessante por si, dar contexto ao símbolo mesmo quando ele é abstrato, explicar naturalmente ganhos/perdas/turnos, evitar anacronismos e fortalecer a progressão entre os quatro atos.
- Ambiguidades dos símbolos (inclusive casa 19) são limitações gráficas aceitas e **não bloqueiam o fechamento editorial**.
- O `C:\\>` da casa 13 permanece exatamente como está; sua narrativa indica um PC com MS-DOS da época, sem precisar redesenhar o terminal.
- `src/motor/editorial-1985.test.ts` verifica a geometria original e o blob da arte, além de posições de até quatro personagens. Reexecutar `npm test` e `npm run build` antes do merge.
- Conservar a análise histórica da auditoria visual externa em `MATRIZ_VALIDACAO_VISUAL.md` como evidência editorial; ela **não** é autorização para voltar a editar os ícones.

## Etapas posteriores (fora deste PR)

Aprovar PT-BR → tradução EN → seletor de idioma → narrador Gemma 4 → ouvir/guardar trajetória pela ElevenLabs. Não antecipar a IA nesta auditoria editorial.
