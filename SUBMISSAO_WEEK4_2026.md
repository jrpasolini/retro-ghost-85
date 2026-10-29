# Hacktoberfest Open-Source AI Challenge — Week 4 / Ghost in the Machine

> Checklist de conformidade e plano de publicação em 29/10/2026. Não equivale à submissão feita; esta acontece no DEV.

## Regras oficiais

- Janela: **26/10/2026 às 09:00 PDT até 31/10/2026 às 23:59 PDT** (em Brasília, encerramento em **01/11/2026 às 03:59 BRT**).
- Projeto e repositório **novos, iniciados e concluídos dentro da janela**, com modelos de pesos abertos e/ou IA open-source no núcleo da proposta. Commits após o prazo devem ser informados no README.
- Uma submissão por desafio, mediante **artigo publicado no DEV usando o template e tags oficiais**, incluindo uma demonstração (link ou vídeo). Artigos em outros idiomas podem ganhar badge, mas **para concorrer a prêmio o texto precisa estar em inglês**.
- Demonstrar por que inovação aberta importa e qual a contribuição real do modelo; qualidade da escrita é o critério de maior peso.
- Categorias aderentes, se demonstradas: **Best Use of Gemma**, **Best Use of ElevenLabs**, **Best Use of Render** e possivelmente **Best Use of a .tech Domain**, conforme o domínio e a elegibilidade específica. Não alegar tecnologias que não integrem o projeto final.

Documentos oficiais:
- https://dev.to/challenges/hacktoberfest-week4-2026-10-26
- https://dev.to/page/hacktoberfest-week4-2026-10-26-contest-rules

## Evidências já disponíveis

- Repositório `jrpasolini/retro-ghost-85` criado em **26/10/2026, 21:23:48 UTC**, dentro da janela do desafio (ver página/repositório GitHub).
- Branch `master`: commit base da auditoria `a4f7998`.
- GitHub Actions, no commit base:
  - Build e testes: https://github.com/jrpasolini/retro-ghost-85/actions/runs/40814667120
  - Gameplay e resize: https://github.com/jrpasolini/retro-ghost-85/actions/runs/40814666929
- Regras do jogo, Gemma e TTS descritos em `STATUS_ATUAL.md`.
- Evidências de execução de inferência, TTS e demo aberta devem ser reunidas na validação final; CI não prova integração de produção.

## Último ato — ações que dependem da publicação

- [ ] Revisar e validar a origem e os direitos de redistribuição de cada mídia em `ASSETS_E_CREDITOS.md`.
- [ ] Conferir a licença MIT apenas para o código original, sem cobrir mídias/terceiros indevidamente.
- [ ] Executar `npm ci`, `npm test`, `npm run build`; testar nova partida e save/load, CPU, troféus e som em en-US e pt-BR.
- [ ] Testar `/health`, narrativas com resposta da IA real e fallback, PLAY/MP3 nos quatro momentos e ausência de chaves na UI; guardar captura de evidência sem segredos.
- [ ] Testar link da demonstração, site no .tech, Worker e acessibilidade básica no desktop e mobile.
- [ ] **Somente no dia do artigo:** tornar o repositório público, então validar em navegação anônima README, LICENSE, demo e links.
- [ ] Publicar **um artigo em inglês no DEV** com o template oficial e tags; incluir demonstração, repositório público, arquitetura, limitações, fotos/screenshots e diferença real que Gemma/ElevenLabs trazem.
- [ ] Indicar explicitamente no campo *Prize Categories* apenas categorias cujo uso é demonstrável.
- [ ] Submeter antes do prazo e verificar a entrada. Se houver commits após o encerramento, acrescentar nota datada ao README.

## Riscos aceitos e riscos de avaliação

- Worker sem autenticação/limite global customizado: **aceito pelo autor** para esta entrega, sem afirmação de proteção absoluta pela obscuridade da URL. Nenhuma alteração operacional planejada pela auditoria documental.
- Repositório privado **por enquanto**: comportamento intencional, não falha; precisa se tornar público no lançamento.
- Gemma produz **comentário curto** após texto humano pré-escrito. É um uso real do modelo, mas a centralidade da IA pode ser questionada na avaliação. Não maquiar, exagerar ou inventar funcionalidade; demonstrar resultado concreto no artigo.
- A categoria **Best Use of Gemma** não exige Gemma 4; a descrição oficial diz *Use Gemma*. O código define Gemma 7B por padrão e permite configuração. Validar no `/health` o modelo implantado antes de nomeá-lo como runtime real.
