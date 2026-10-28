/**
 * retro-ghost-85 — Worker do Mestre (narração + voz)
 *
 * Princípio: o dado decide, a IA narra.
 * O Worker NÃO conhece regra de jogo: recebe as casas em que o jogador PAROU,
 * com a descrição original de cada uma, e devolve uma narração curta.
 *
 * Regras rígidas (ver README):
 *  - nunca inventa fato: só o que está nas descrições recebidas;
 *  - nunca cita número de casa, progresso ou dado;
 *  - pode instigar ("será que ele aguenta?"), não pode prever nem julgar.
 *
 * Rotas:
 *   GET  /health
 *   POST /narrate  { player, lang, act?, endgame?, squares:[{id,titulo,tipo,descricao}] }
 *   POST /tts      { text, lang?, voiceId? }
 */

const NARRATION_MODEL = "@cf/google/gemma-4-26b-a4b-it"; // confirmado em /health do worker anterior
const TTS_MODEL = "eleven_multilingual_v2";
const PROMPT_VERSION = "v1";
const MAX_NAME = 24;
const MAX_SQUARES = 10;
const MAX_DESC = 700;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    try {
      if (url.pathname === "/health") return health(env);
      if (url.pathname === "/narrate" && request.method === "POST") return await narrate(request, env);
      if (url.pathname === "/tts" && request.method === "POST") return await tts(request, env);
      return json({ error: "not_found" }, 404);
    } catch (err) {
      return json({ error: "worker_error", detail: String((err && err.message) || err) }, 500);
    }
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });
}

function health(env) {
  return json({
    ok: true,
    model: NARRATION_MODEL,
    tts: TTS_MODEL,
    prompt: PROMPT_VERSION,
    bindings: { ai: Boolean(env.AI), cache: Boolean(env.CACHE), elevenlabs: Boolean(env.ELEVENLABS_API_KEY) },
    voiceConfigured: Boolean(env.ELEVENLABS_VOICE_ID),
  });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* -------------------------------------------------------------- sanitização */

export function sanitizeName(raw) {
  const clean = String(raw || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/["'<>{}\[\]\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return clean.slice(0, MAX_NAME) || "o jogador";
}

function sanitizeSquares(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s) => s && (s.titulo || s.descricao))
    .slice(0, MAX_SQUARES)
    .map((s, i) => ({
      id: Number.isFinite(Number(s.id)) ? Number(s.id) : null,
      titulo: String(s.titulo || "").slice(0, 120),
      tipo: String(s.tipo || "").slice(0, 24),
      descricao: String(s.descricao || "").slice(0, MAX_DESC),
      ordem: i,
    }))
    .filter((s) => s.descricao.length > 40 || s.titulo);
}

/* ------------------------------------------------------------------ prompt */

const PERSONA = {
  "pt-BR": `Você é o Mestre de Retro Ghost 85: um narrador de tabuleiro com atmosfera de Halloween, ambientado na microinformática de 1985.

PERSONA
- Sombrio, elegante, paciente. Fala como quem já viu muitos terminarem mal.
- Terceira pessoa, tratando o jogador pelo nome.
- Observa e duvida: pode instigar ("será que ele aguenta o que vem depois?"), provocar, insinuar.
- Nunca faz piada, nunca consola, nunca comemora pelo jogador.

LIMITES ABSOLUTOS
- Narre APENAS o que está nas descrições das casas recebidas. Não invente acontecimento, personagem ou consequência.
- NÃO mencione número de casa, dado, progresso, pontos, placar ou "jogada extra".
- NÃO revele o que ainda não aconteceu nem antecipe o final. Instigar não é prever.
- NÃO dê conselho, NÃO comande o jogador, NÃO comente regras.

FORMA
- De três a cinco frases. Entre 300 e 600 caracteres.
- Escreva para ser ouvido em voz alta: frases curtas, sem parênteses, sem abreviações, sem algarismos (escreva números por extenso apenas se indispensável — de preferência não use nenhum).
- Sem exclamações, sem markdown, sem listas.
- Português do Brasil.`,
  en: `You are the Master of Retro Ghost 85: a board-game narrator with a Halloween atmosphere, set in the microcomputing world of 1985.

PERSONA
- Grim, elegant, patient. Speaks like someone who has watched many players end badly.
- Third person, addressing the player by name.
- Watches and doubts: may taunt ("can he really survive what comes next?"), provoke, insinuate.
- Never jokes, never comforts, never celebrates on the player's behalf.

ABSOLUTE LIMITS
- Narrate ONLY what is in the descriptions of the squares you receive. Do not invent events, characters or consequences.
- Do NOT mention square numbers, dice, progress, points, score or "extra roll".
- Do NOT reveal what has not happened yet. Taunting is not foretelling.
- Do NOT advise, command the player, or comment on rules.

FORM
- Three to five sentences. Between 300 and 600 characters.
- Written to be heard aloud: short sentences, no parentheses, no abbreviations, no digits.
- No exclamation marks, no markdown, no lists.
- Natural English.`,
};

function buildPrompt({ player, lang, act, endgame, squares }) {
  const ptbr = lang !== "en";
  const linhas = squares
    .map((s, i) => `${i + 1}. ${s.titulo} (${s.tipo}) — ${s.descricao}`)
    .join("\n");

  const cabeca = endgame
    ? ptbr
      ? `${player} chegou ao fim do tabuleiro. Narre o fecho da trajetória, usando apenas as casas abaixo.`
      : `${player} reached the end of the board. Narrate the closing of the journey using only the squares below.`
    : ptbr
      ? `${player} acaba de atravessar o Ato ${act}. Narre a trajetória até aqui, usando apenas as casas abaixo.`
      : `${player} has just crossed Act ${act}. Narrate the journey so far using only the squares below.`;

  const rodape = ptbr
    ? `Casas em que ele parou, na ordem em que aconteceram:\n${linhas}\n\nEscreva apenas a narração, sem título e sem comentário.`
    : `Squares where they stopped, in the order they happened:\n${linhas}\n\nWrite only the narration, with no title and no commentary.`;

  return `${cabeca}\n\n${rodape}`;
}

/* --------------------------------------------------------------- validação */

const FORBIDDEN = [
  /\bcasa\s*\d+/i,
  /\bsquare\s*\d+/i,
  /\+\s*\d+\s*(de )?(progresso|progress)/i,
  /\b\d+\s*\/\s*100\b/,
  /\brole\s*(o\s*)?(dado|dice)\b/i,
  /\bjogada extra\b/i,
];

export function violates(text) {
  return FORBIDDEN.some((re) => re.test(text)) || /\d/.test(text);
}

function fallbackNarration({ player, squares, lang }) {
  const titulos = squares.map((s) => s.titulo).filter(Boolean);
  if (!titulos.length) return lang === "en" ? `${player} stands where the board left them.` : `${player} segue onde o tabuleiro o deixou.`;
  const lista = titulos.join(lang === "en" ? ", then " : ", depois ");
  return lang === "en"
    ? `${player}: ${lista}. The board keeps the rest to itself.`
    : `${player}: ${lista}. O tabuleiro guarda o resto para si.`;
}

/* ---------------------------------------------------------------- narração */

async function narrate(request, env) {
  const body = await request.json();
  const player = sanitizeName(body && body.player);
  const lang = body && body.lang === "en" ? "en" : "pt-BR";
  const squares = sanitizeSquares(body && body.squares);

  if (!squares.length) return json({ error: "sem_casas", expected: "{ player, lang, squares[] }" }, 400);

  const prompt = buildPrompt({ player, lang, act: Number(body.act) || 2, endgame: Boolean(body.endgame), squares });
  const key = "narr:" + (await sha256([PROMPT_VERSION, lang, NARRATION_MODEL, prompt].join("|")));

  if (env.CACHE) {
    const hit = await env.CACHE.get(key);
    if (hit) return json({ text: hit, cached: true, key, lang });
  }

  if (!env.AI) return json({ error: "sem_binding_ai", fallback: fallbackNarration({ player, squares, lang }) }, 503);

  let text = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await env.AI.run(NARRATION_MODEL, {
      messages: [
        { role: "system", content: PERSONA[lang] + (attempt ? "\n\nAVISO: a tentativa anterior citou números ou mecânica. Reescreva sem nenhum algarismo." : "") },
        { role: "user", content: prompt },
      ],
      max_tokens: 320,
      temperature: 0.85,
    });
    text = String((result && (result.response || result.text)) || "").trim();
    if (text && !violates(text)) break;
    text = "";
  }

  if (!text) {
    return json({ text: fallbackNarration({ player, squares, lang }), cached: false, fallback: true, key, lang });
  }

  if (env.CACHE) await env.CACHE.put(key, text, { expirationTtl: 60 * 60 * 24 * 180 });
  return json({ text, cached: false, key, lang });
}

/* --------------------------------------------------------------------- voz */

async function tts(request, env) {
  const { text, lang, voiceId } = await request.json();
  if (!text) return json({ error: "texto_obrigatorio" }, 400);
  if (!env.ELEVENLABS_API_KEY) return json({ error: "tts_indisponivel" }, 503);

  const voice = voiceId || env.ELEVENLABS_VOICE_ID;
  if (!voice) return json({ error: "voice_id_ausente", hint: "defina ELEVENLABS_VOICE_ID no Worker" }, 400);

  const key = "tts:" + (await sha256([TTS_MODEL, voice, lang || "pt-BR", text].join("|")));
  if (env.CACHE) {
    const audio = await env.CACHE.get(key, "arrayBuffer");
    if (audio) return audioResponse(audio, key, true);
  }

  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: TTS_MODEL,
      voice_settings: { stability: 0.75, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
    }),
  });

  if (!resp.ok) return json({ error: "elevenlabs_falhou", status: resp.status, detail: (await resp.text()).slice(0, 300) }, 502);

  const audio = await resp.arrayBuffer();
  if (env.CACHE) await env.CACHE.put(key, audio, { expirationTtl: 60 * 60 * 24 * 180 });
  return audioResponse(audio, key, false);
}

function audioResponse(audio, key, cached) {
  return new Response(audio, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "public, max-age=31536000, immutable",
      "x-cache": cached ? "hit" : "miss",
      "x-narration-key": key,
      ...CORS,
    },
  });
}
