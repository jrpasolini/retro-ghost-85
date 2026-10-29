# Plano histórico — internacionalização en-US por padrão (etapa concluída)

> **ARQUIVO HISTÓRICO.** O plano abaixo registrou a etapa anterior à localização. **A alternância en-US/pt-BR já está incorporada à `master`**, assim como a interface de troféus e TTS. Manter este checklist como memória do processo, não como lista de implementação ainda pendente. Estado vigente: [STATUS_ATUAL.md](STATUS_ATUAL.md).

## Diretriz de produto

- Idioma padrão da próxima versão: **English (`en`)**, inclusive no primeiro acesso, sem depender do idioma do navegador. Português brasileiro (`pt-BR`) como segunda opção.
- Adicionar seletor EN / PT-BR visível e acessível; persistir preferência do usuário somente quando selecionada, sem alterar o padrão global.
- **Inglês é a língua padrão da experiência entregue ao desafio**, não apenas uma opção secundária.
- Manter consistência da narrativa em 1985, as datas, as siglas (MS-DOS, BASIC, BBS, PSG, VRAM), nomes próprios do projeto e mecânicas inalteradas.
- Traduzir expressões idiomáticas, humor, suspense e nostalgia; nunca realizar substituição automática palavra por palavra sem revisão.

## Inventário obrigatório — conteúdo estático e dinâmico

| Local do código / ativo | O que precisa ser localizado |
|---|---|
| `src/data/casas.ts` | 40 títulos, descrições, efeitos curtos (+/- pontos, movimento, turno, vitória) |
| `src/data/atos.ts` | Prólogo e as três narrativas de transição; nomes dos marcos como chave estável, rótulo localizado na interface |
| `src/data/intro.ts` | Título, abertura em três parágrafos, etiquetas e explicação da corrida |
| `src/main.ts` | Texto cinematográfico, botões, labels, tooltips, mensagens de rolagem, console dos jogadores, inspetor, informações de efeito, instruções, troféus, endgame, placar, alertas, seleção de CPU, carregamento/salvamento e erros |
| `src/motor/gamelog.ts` e `src/motor/log.ts` | Registros detalhados e compactos, mensagens de vitória, consequências, trajetórias e exportação legível |
| `src/motor/setup.ts`, `src/motor/partida.ts`, `src/motor/jogadores.ts` | Resumos de participantes, nome padrão de jogadores e descrições de efeitos de partida |
| `src/estado/save.ts` | Explicação e cabeçalhos Markdown, mensagens de validação, erro e recuperação, sem modificar o JSON do save |
| `src/audio.ts` e `src/narrador/narrador.ts` | Nomes exibidos das faixas, rótulos da narração, indisponibilidade do serviço, futuras mensagens Gemma/ElevenLabs |
| `index.html` | `lang="en"`, meta description, título, link de pular navegação e demais textos de acessibilidade |
| `src/style.css` | Pseudoelementos e `content:` com texto, se houver; conferir truncamentos após expansão/contração da língua |
| `public/assets/` | Examinar **texto embutido em imagens**, especialmente `casa-40-endgame.webp` com “PUBLICAÇÃO” e outras instruções rasterizadas; só criar variantes mínimas localizadas preservando 100% da geometria do tabuleiro |
| `README.md` e créditos expostos | Documentação e informações públicas para avaliadores, observando licenças e marcas sem divulgar segredos |

### Não esquecer os textos invisíveis

`aria-label`, `alt`, `title`, `placeholder`, mensagens de leitores de tela, estados de áudio ON/OFF, textos exibidos em erros, botões disabled, nomes de faixas, game log, tooltips, avisos de privacidade, atalhos e diálogos.

### Regras de implementação

1. Centralizar todas as strings em catálogo tipado, com chaves estáveis e `en`/ `pt-BR`. Preferir formatação por placeholders nomeados, sem interpolar HTML não confiável.
2. Não colocar cópias traduzidas duplicadas da **lógica**; traduzir somente a exibição.
3. Manter `Casa.id`, `consequencia`, `tipo`, coordenadas, taxas de RNG, saves e estrutura dos eventos independentes do idioma.
4. Preserve campos técnicos do JSON exportado e a versão de schema; arquivos salvos em português precisam importar e funcionar em inglês. Exibir logs antigos em EN quando a localização puder ser reconstruída com segurança, preservando original caso contrário.
5. Aplicar `document.documentElement.lang` e `lang` de descrições conforme seleção; rótulos de acessibilidade também devem mudar.
6. O arquivo `board-reference-edited.webp` é imutável. Se algum texto em português **impresso em bitmap** impedir o inglês integral, listar explicitamente a ocorrência e solicitar uma solução localizada, sem refazer ou deslocar o tabuleiro.
7. A futura narração Gemma 4 recebe a língua selecionada, regras de 1985, a trajetória estável e o canon; ElevenLabs usa o mesmo idioma para síntese. Não traduzir texto narrado depois da geração de voz.
8. Testar alternância de idioma antes e no decorrer da partida, save/load entre línguas, 1–4 participantes, CPU, fatalidades, troféus, endgame e leitura por screen reader.

## Critério de aceite para a tradução do challenge

- `en` em todo primeiro carregamento, mesmo em navegador configurado para português.
- Nenhuma string da interface, narrativa, mensagens, acessibilidade ou documentação de demonstração aparece inadvertidamente em português em modo inglês.
- `pt-BR` completo e funcional como alternativa.
- Todos os 40 episódios e quatro momentos da história conferidos por revisão humana, não apenas substituição literal.
- O tabuleiro, suas 40 coordenadas e o posicionamento de quatro personagens idênticos ao PR #5.
- Save em `.md` compatível entre idiomas; lógica matemática e trajeto intocados.
- `npm test`, `npm run build` e revisão do frontend em FullHD e mobile aprovados.
- Gemini/Gemma e ElevenLabs ficam para as etapas seguintes conforme o roadmap, sem mistura prematura.

**Sequência autorizada:** fechar PR #5 PT-BR → traduzir integralmente EN como padrão → seletor de linguagem → Gemma 4 → experiência da trajetória em áudio ElevenLabs.
