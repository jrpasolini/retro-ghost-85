# Mídias, atribuições e limites de licença — Retro-Ghost-85

> Registro para revisão antes de tornar público o repositório. Não presume titularidade ou licença que não tenha sido confirmada.

## Licenças: separação por tipo

- **Software original autoral** (código do jogo, Worker, scripts e testes): licença MIT no arquivo `LICENSE`.
- **Imagens, fotos, sprites, pôsteres, áudio, música, voz, obras derivadas, logotipos e outras mídias** em `public/`: **não abrangidos automaticamente pela licença MIT do código**. A distribuição e eventual reutilização devem respeitar as permissões específicas, termos das ferramentas de criação e direitos de terceiros.
- **Dependências e fontes** instaladas por NPM seguem licenças próprias. Conferir avisos das fontes Chakra Petch e Press Start 2P antes do pacote de distribuição; não mudar/atribuir licença de terceiros.
- Referências históricas a MSX e outras marcas são descritivas; este projeto é independente e não tem patrocínio, afiliação ou endosso de titulares. **Não inclui ROMs, BIOS ou emulador.**

## Inventário a conferir antes da publicação

| Arquivos | Atribuição/procedência documentada | Pendência |
|---|---|---|
| `public/audio/intro.mp3`, `act-1.mp3` … `act-4.mp3`, `endgame.mp3` | O projeto atribui seis trilhas à **ElevenLabs Music** | Conferir direitos de publicação/redistribuição aplicáveis à conta/plano e registrar crédito correto |
| Narração gerada sob demanda em `/tts` | **ElevenLabs API**, modelo `eleven_multilingual_v2`, voz configurada no Worker | Verificar direitos e permissão de uso da voz; manter API key fora da distribuição |
| `public/assets/antonio-pasolini-portrait.png` | Retrato identificado no projeto | Confirmar que o autor autorizou disponibilização no repositório público |
| `public/assets/board-reference-edited.webp`, demais imagens, sprites e abertura | Recursos visuais do projeto | Identificar as origens individuais e eventuais referências a obras de terceiros antes de redistribuir |
| `public/assets/einstein-smile.webp` | Referência visual ao personagem histórico | Conferir origem da imagem e restrições aplicáveis |
| Pacotes `@fontsource/chakra-petch` e `@fontsource/press-start-2p` | Fontes incluídas como dependências | Verificar arquivos de licença dos pacotes/fontes e os avisos exigidos |

## Créditos de tecnologia

- Jogo e código: Retro-Ghost-85, criado por Antonio Pasolini Junior.
- Open-weight AI: **Gemma 7B** no modelo padrão do Worker via **Cloudflare Workers AI** (modelo real implantado configurável).
- Áudio: **ElevenLabs Music** (trilhas descritas no projeto); **ElevenLabs API** (voz TTS sob demanda).
- Hospedagem frontend documentada: **Render** e domínio **jrpasolini.tech**.
- GitHub Actions executa os testes; o uso de ferramentas de IA auxiliares para desenvolvimento não deve ser confundido com a inferência do jogo.

## Regra editorial para o lançamento

**Não declarar "todos os recursos são MIT"** nem redistribuir mídia de origem incerta como se fosse pública. Separar autorização de exposição do repositório e licença de reutilização. Preservar esta lista até a conferência final.
