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

// Gemma 4 é modelo de raciocínio: devolve content vazio e gasta o orçamento em reasoning_content.
// Por isso a lista: tenta o pedido, cai para um Gemma que responde direto, e só então para um genérico.
const NARRATION_MODELS = [
  "@cf/google/gemma-7b-it-lora",
  "@cf/google/gemma-2b-it-lora",
  "@cf/google/gemma-4-26b-a4b-it",
];
const TTS_MODEL = "eleven_multilingual_v2";
const PROMPT_VERSION = "v6";
const MAX_NAME = 24;
const MAX_SQUARES = 10;
const MAX_BEATS_ENDGAME = 5;
const MAX_BEATS_ACT = 2;
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
      if (url.pathname === "/selftest") return selftest(env);
      if (url.pathname === "/probe") return probe(env, url);
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
    models: NARRATION_MODELS,
    tts: TTS_MODEL,
    prompt: PROMPT_VERSION,
    bindings: { ai: Boolean(env.AI), cache: Boolean(env.CACHE), elevenlabs: Boolean(env.ELEVENLABS_API_KEY) },
    voiceConfigured: Boolean(env.ELEVENLABS_VOICE_ID),
  });
}

async function probe(env, url) {
  const tokens = Number(url.searchParams.get("tokens") || 500);
  const model = url.searchParams.get("model") || "@cf/google/gemma-7b-it-lora";
  const t0 = Date.now();
  try {
    const r = await env.AI.run(model, {
      messages: [
        { role: "system", content: PERSONA["pt-BR"] },
        { role: "user", content: "Melissa acaba de atravessar o Ato 2. Casas em que parou:\n1. A revista na banca (marco) — comprou a revista na banca e descobriu que podia criar a própria aventura.\n2. Salvar no cassete (evento) — gravou o programa numa fita, com etiqueta e contador, com medo de perder tudo.\nEscreva apenas a narração." },
      ],
      max_tokens: tokens,
      temperature: 0.75,
    });
    const msg = (r.choices && r.choices[0] && r.choices[0].message) || {};
    const text = extractText(r);
    return json({ model, ms: Date.now() - t0, tokens, text: text.slice(0, 900), len: text.length, violates: violates(text) });
  } catch (e) {
    return json({ ms: Date.now() - t0, error: String((e && e.message) || e) }, 500);
  }
}

async function selftest(env) {
  if (!env.AI) return json({ error: "sem_binding_ai" }, 503);
  const out = [];
  for (const model of NARRATION_MODELS) {
    try {
      const r = await env.AI.run(model, {
        messages: [{ role: "user", content: "Responda apenas: ok" }],
        max_tokens: 16,
      });
      out.push({ model, ok: true, sample: JSON.stringify(r).slice(0, 200) });
    } catch (e) {
      out.push({ model, ok: false, error: String((e && e.message) || e).slice(0, 200) });
    }
  }
  return json({ results: out });
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
- Não explique seu raciocínio. Não comente a tarefa. Responda apenas com a narração final.
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
- Do not explain your reasoning. Do not comment on the task. Answer only with the final narration.
- Natural English.`,
};

const ORDINAL = {
  "pt-BR": { 2: "segundo", 3: "terceiro", 4: "quarto" },
  en: { 2: "second", 3: "third", 4: "fourth" },
};

function buildPrompt({ player, lang, act, endgame, squares }) {
  const ptbr = lang !== "en";
  const ordinal = ORDINAL[ptbr ? "pt-BR" : "en"][act] || (ptbr ? "segundo" : "second");
  const linhas = squares
    .map((s, i) => `${i + 1}. ${s.titulo} (${s.tipo}) — ${s.descricao}`)
    .join("\n");

  const cabeca = endgame
    ? ptbr
      ? `${player} chegou ao fim do tabuleiro. Narre o fecho da trajetória, usando apenas as casas abaixo.`
      : `${player} reached the end of the board. Narrate the closing of the journey using only the squares below.`
    : ptbr
      ? `${player} acaba de atravessar o ${ordinal} ato. Narre a trajetória até aqui, usando apenas as casas abaixo.`
      : `${player} has just crossed the ${ordinal} act. Narrate the journey so far using only the squares below.`;

  const rodape = ptbr
    ? `Casas em que ele parou, na ordem em que aconteceram:\n${linhas}\n\nEscreva apenas a narração, sem título e sem comentário.`
    : `Squares where they stopped, in the order they happened:\n${linhas}\n\nWrite only the narration, with no title and no commentary.`;

  return `${cabeca}\n\n${rodape}`;
}

/* --------------------------------------------------------------- validação */

const FORBIDDEN = [
  /\bcasas?\s*\d+/i,
  /\bsquares?\s*\d+/i,
  /\+\s*\d+\s*(de\s*)?(progresso|progress)/i,
  /\b\d+\s*\/\s*100\b/,
  /\b(role|rolou|rolagem|roll)\b[^.]{0,20}\b(dado|dice|die)\b/i,
  /\bjogada extra\b/i,
  /\bextra roll\b/i,
];

// Algarismo é proibido, com uma exceção temática: o ano de 1985.
const NUM_PT = ["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze","treze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove","vinte"];
const NUM_EN = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];

function numberToWords(n, lang) {
  const table = lang === "en" ? NUM_EN : NUM_PT;
  if (n <= 20) return table[n];
  if (n < 100) {
    const tens = lang === "en" ? ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"] : ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
    const t = Math.floor(n / 10), r = n % 10;
    return tens[t] + (r ? (lang === "en" ? "-" : " e ") + table[r] : "");
  }
  return String(n);
}

// O modelo pequeno ignora "sem algarismos". Em vez de brigar com ele,
// normalizamos: "Ato 2" vira "segundo ato" e qualquer dígito vira palavra.
export function wordify(text, lang) {
  const ordinals = lang === "en"
    ? { 2: "second", 3: "third", 4: "fourth" }
    : { 2: "segundo", 3: "terceiro", 4: "quarto" };
  let out = text
    .replace(/\bAto\s*(\d+)\b/gi, (_, d) => (ordinals[d] ? (lang === "en" ? `the ${ordinals[d]} act` : `o ${ordinals[d]} ato`) : `ato`))
    .replace(/\bAct\s*(\d+)\b/gi, (_, d) => (ordinals[d] ? `the ${ordinals[d]} act` : "act"));
  out = out.replace(/\b(\d{1,3})\b/g, (m) => numberToWords(Number(m), lang));
  out = out.replace(/\b1985\b/g, lang === "en" ? "nineteen eighty-five" : "mil novecentos e oitenta e cinco");
  return out.replace(/\s+/g, " ").trim();
}

// Detecta cópia: se boa parte das sequências de seis palavras da saída já existe
// no material de entrada, o modelo colou a carta em vez de narrar.
export function copiedRatio(text, sources) {
  const words = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const out = words(text);
  if (out.length < 12) return 0;
  const hay = " " + sources.map(words).map((w) => w.join(" ")).join(" || ") + " ";
  let hits = 0, total = 0;
  for (let i = 0; i + 6 <= out.length; i++) {
    total++;
    if (hay.includes(out.slice(i, i + 6).join(" "))) hits++;
  }
  return total ? hits / total : 0;
}

export function violates(text) {
  if (FORBIDDEN.some((re) => re.test(text))) return true;
  const semAno = text.replace(/\b1985\b/g, "ano");
  return /\d/.test(semAno);
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

export function extractText(result) {
  if (!result) return "";
  if (typeof result === "string") return result.trim();
  const choice = result.choices && result.choices[0];
  const msg = choice && choice.message;
  if (msg && typeof msg.content === "string" && msg.content.trim()) return msg.content.trim();
  if (typeof result.response === "string" && result.response.trim()) return result.response.trim();
  if (typeof result.text === "string") return result.text.trim();
  return "";
}

// Seleção por saliência: o troféu não é o diário. Escolhe poucos momentos,
// sempre do próprio jogador, e devolve em ordem cronológica.
export function selectBeats(squares, endgame) {
  const limit = endgame ? MAX_BEATS_ENDGAME : MAX_BEATS_ACT;
  if (squares.length <= limit) return squares;

  const peso = (s) => {
    const tipo = String(s.tipo || "").toLowerCase();
    const base = tipo.includes("fatal") ? 30 : tipo === "marco" ? 20 : 10;
    const mag = Math.abs(Number(s.magnitude) || 0);
    return base + mag;
  };

  const escolhidos = new Set([0, squares.length - 1]);
  const rank = squares
    .map((s, i) => ({ i, score: peso(s) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.i);

  for (const i of rank) {
    if (escolhidos.size >= limit) break;
    escolhidos.add(i);
  }

  return [...escolhidos].sort((a, b) => a - b).map((i) => squares[i]);
}

// Passada 1: reduz cada casa a uma frase factual. O texto original NÃO segue
// para a narração — é o que impede o modelo pequeno de copiar a carta.
async function extractFacts(env, model, squares, lang) {
  const list = squares.map((s, i) => `${i + 1}. ${s.titulo} — ${s.descricao}`).join("\n");
  const ask = lang === "en"
    ? `Reduce each square below to ONE factual sentence, at most twelve words, no adjectives, no digits, third person, English. One line per square, starting with its number.\n\n${list}`
    : `Reduza cada casa abaixo a UMA frase factual, no máximo doze palavras, sem adjetivos, sem algarismos, terceira pessoa. Uma linha por casa, começando pelo número.\n\n${list}`;
  try {
    const r = await env.AI.run(model, { messages: [{ role: "user", content: ask }], max_tokens: 320, temperature: 0.2 });
    const raw = extractText(r);
    const facts = raw.split(/\n+/).map((l) => l.replace(/^\s*\d+[.)\]]\s*/, "").trim()).filter((l) => l.length > 8).slice(0, squares.length);
    if (facts.length) return facts;
  } catch (e) { /* cai no título */ }
  return squares.map((s) => s.titulo);
}

function joinBeats(beats, player) {
  return beats
    .map((b) => String(b.beat || "").replace(/\{nome\}/g, player).trim())
    .filter(Boolean)
    .join("\n\n");
}

async function masterLine(env, model, { player, lang, beats, endgame }) {
  const ptbr = lang !== "en";
  const resumo = beats.map((b) => "- " + String(b.beat || "").replace(/\{nome\}/g, player)).join("\n");
  const ask = ptbr
    ? `Você é o Mestre de Retro Ghost 85: sombrio, elegante, paciente. Escreva UMA frase curta (máximo vinte palavras) comentando a trajetória abaixo. Pode instigar e duvidar ("será que ele aguenta o que vem?"), mas NÃO revele o futuro, NÃO invente fato e NÃO use algarismos. Responda só a frase.\n\nTrajetória:\n${resumo}`
    : `You are the Master of Retro Ghost 85: grim, elegant, patient. Write ONE short sentence (twenty words maximum) commenting on the journey below. You may taunt and doubt, but do NOT reveal the future, do NOT invent facts and do NOT use digits. Answer with the sentence only.\n\nJourney:\n${resumo}`;
  try {
    const r = await env.AI.run(model, { messages: [{ role: "user", content: ask }], max_tokens: 120, temperature: 0.9 });
    const line = wordify(extractText(r), lang).replace(/\s+/g, " ").trim();
    if (line && !violates(line) && line.length > 20) return line;
  } catch (e) { /* sem fala do Mestre */ }
  return "";
}

async function narrate(request, env) {
  const body = await request.json();
  const debug = new URL(request.url).searchParams.get("debug") === "1";
  let lastRaw = "";
  const player = sanitizeName(body && body.player);
  const lang = body && body.lang === "en" ? "en" : "pt-BR";
  const squares = sanitizeSquares(body && body.squares);

  const beatsIn = Array.isArray(body && body.beats)
    ? body.beats.filter((b) => b && typeof b.beat === "string" && b.beat.trim()).slice(0, MAX_SQUARES)
    : [];

  // Caminho novo: o corpo é autoral (beats), o modelo só faz a fala do Mestre.
  if (beatsIn.length) {
    const endgameB = Boolean(body.endgame);
    const corpo = joinBeats(beatsIn, player);
    const fala = env.AI ? await masterLine(env, NARRATION_MODELS[0], { player, lang, beats: beatsIn, endgame: endgameB }) : "";
    const texto = fala ? fala + "\n\n" + corpo : corpo;
    return json({ text: texto, body: corpo, master: fala || null, chars: texto.length, lang });
  }

  if (!squares.length) return json({ error: "sem_casas", expected: "{ player, lang, beats[{id,titulo,beat}] }" }, 400);

  const endgame = Boolean(body.endgame);
  const escolhidas = selectBeats(squares, endgame);
  const facts = env.AI ? await extractFacts(env, NARRATION_MODELS[0], escolhidas, lang) : escolhidas.map((s) => s.titulo);
  const material = escolhidas.map((s, i) => ({ ...s, descricao: facts[i] || s.titulo }));
  const prompt = buildPrompt({ player, lang, act: Number(body.act) || 2, endgame, squares: material });
  const key = "narr:" + (await sha256([PROMPT_VERSION, lang, NARRATION_MODELS.join(','), prompt].join("|")));

  if (env.CACHE) {
    const hit = await env.CACHE.get(key);
    if (hit) return json({ text: hit, cached: true, key, lang });
  }

  if (!env.AI) return json({ error: "sem_binding_ai", fallback: fallbackNarration({ player, squares, lang }) }, 503);

  let text = "";
  let usedModel = null;
  outer: for (const model of NARRATION_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let result;
      try {
        result = await env.AI.run(model, {
          messages: [
            { role: "system", content: PERSONA[lang] + (attempt ? "\n\nAVISO: a tentativa anterior copiou o texto das cartas ou citou números. Narre com SUAS palavras, sem copiar frases do material." : "") },
            { role: "user", content: prompt },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        });
      } catch (e) {
        lastRaw = "AI_ERROR(" + model + "): " + String((e && e.message) || e);
        break;
      }
      const gotRaw = extractText(result);
      if (!gotRaw) {
        lastRaw = "AI_EMPTY(" + model + "): " + JSON.stringify(result).slice(0, 200);
        break; // este modelo não devolve content: passa para o próximo
      }
      const got = wordify(gotRaw, lang);
      const copy = copiedRatio(gotRaw, squares.map((s) => s.descricao));
      if (!violates(got) && copy < 0.45) {
        text = got;
        usedModel = model;
        break outer;
      }
      lastRaw = (copy >= 0.45 ? "COPIED(" : "VIOLATES(") + model + "): " + got.slice(0, 300);
    }
  }

  if (!text) {
    const out = { text: fallbackNarration({ player, squares, lang }), cached: false, fallback: true, key, lang };
    if (debug) out.raw = lastRaw.slice(0, 900);
    return json(out);
  }


  if (env.CACHE) await env.CACHE.put(key, text, { expirationTtl: 60 * 60 * 24 * 180 });
  return json({ text, cached: false, key, lang, model: usedModel, beats: material.length, chars: text.length });
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
