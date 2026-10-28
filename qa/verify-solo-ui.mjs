import assert from "node:assert/strict";
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { casas } from "../src/data/casas.ts";
import { novoEstadoRng } from "../src/motor/dado.ts";
import { consumirTurnoPerdidoSolo, iniciarPartida, paraEstadoSalvo, registrarJogada } from "../src/motor/partida.ts";
import { serializarSave } from "../src/estado/save.ts";

const origin = "http://127.0.0.1:4180";
const out = "qa/output/resize";
await mkdir(out, { recursive: true });
const server = spawn(process.execPath, ["./node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4180", "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, CI: "true" },
});
let stderr = "";
server.stderr.on("data", (data) => stderr += String(data));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let browser;
try {
  let ready = false;
  for (let i = 0; i < 70; i++) {
    if (server.exitCode !== null) throw new Error("Vite não iniciou: " + stderr);
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await sleep(150);
  }
  if (!ready) throw new Error("Vite indisponível: " + stderr);
  browser = await chromium.launch({channel: "chrome", headless: true, args: ["--no-sandbox"]});
  const page = await browser.newPage({viewport:{width:1280,height:800}, deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror", err => errors.push(err.message));
  await page.goto(origin, {waitUntil:"domcontentloaded"});
  await page.addStyleTag({content:"#opening-sequence, #intro-dialog, #trophy-dialog {display:none!important}"});
  // O input file é oculto por design: exigir só presença no DOM.
  await page.waitForSelector("#input-load", { state: "attached" });

  const fresh = iniciarPartida([{controle:"humano",nome:"QA-Solo"}], novoEstadoRng(1985));
  const setup = {...fresh,jogadores:[{...fresh.jogadores[0],casa:16,projeto:50}]};
  const penalizada = registrarJogada(setup,{dado:1},casas).estado;
  assert.equal(penalizada.jogadores[0].turnosPerdidos,1);
  const upload = async (name,estado) => {
    const markdown=serializarSave(paraEstadoSalvo(estado));
    await page.locator("#input-load").setInputFiles({name,mimeType:"text/markdown",buffer:Buffer.from(markdown,"utf8")});
    await page.waitForFunction(() => document.querySelector("#tape-feedback")?.textContent?.includes("PARTIDA CARREGADA"));
  };

  await upload("pendente.md",penalizada);
  await page.waitForFunction(() => document.querySelector("#btn-rolar-dado")?.textContent?.trim()==="PASSAR TURNO");
  const label = await page.locator("#btn-rolar-dado").textContent();
  assert.equal(label.trim(),"PASSAR TURNO");
  assert.match(await page.locator(".dice-status").textContent(),/perdeu uma jogada/);
  assert.match(await page.locator("#game-log-list").textContent(),/perde turno/);
  const initialLog = await page.locator("#game-log-list li").count();
  const oldPosition = await page.locator(".player-token").first().getAttribute("style");
  await page.screenshot({path:`${out}/solo-penalty-pending.png`});

  await page.evaluate(() => document.querySelector("#btn-rolar-dado").click());
  await page.waitForFunction(() => document.querySelector("#btn-rolar-dado")?.textContent?.trim()==="ROLAR DADO");
  assert.equal(await page.locator("#game-log-list li").count(),initialLog+1);
  assert.match(await page.locator("#game-log-list li").last().textContent(),/TURNO PERDIDO · sem rolagem/);
  assert.match(await page.locator(".dice-status").textContent(),/sem rolar o dado nem avançar/);
  assert.match(await page.locator(".dice-sub").textContent(),/SEM ROLAGEM/);
  assert.equal(await page.locator(".player-token").first().getAttribute("style"),oldPosition);
  await page.screenshot({path:`${out}/solo-penalty-completed.png`});

  // Cadastrar um endgame já concluído com 1 turno pulado no histórico:
  // o placar precisa mostrar nome sem número duplicado, e apenas 2 dados.
  const cumprida=consumirTurnoPerdidoSolo(penalizada);
  const ultima={...cumprida,jogadores:[{...cumprida.jogadores[0],casa:39}]};
  const terminou=registrarJogada(ultima,{dado:1},casas).estado;
  assert.equal(terminou.partidaEncerrada,true);
  await upload("terminou.md",terminou);
  await page.waitForFunction(() => document.querySelector("#endgame-dialog")?.open === true);
  assert.equal((await page.locator("#endgame-ranking li").count()),1);
  assert.equal((await page.locator("#endgame-ranking li b").first().textContent()),"QA-Solo");
  const score = await page.locator("#endgame-score").textContent();
  assert.match(score,/Rolagens de QA-Solo: 2/);
  assert.match(score,/Rolagens da mesa: 2/);
  assert.doesNotMatch(await page.locator("#endgame-narration").textContent(),/tirou null/);
  await page.screenshot({path:`${out}/solo-endgame-ranking.png`});
  assert.deepEqual(errors,[]);
  const summary={
    skippedTurnCount:1,
    tokenUnchangedAfterSkipping:true,
    rankingNumberDuplicated:false,
    score,
    screenshotPaths:["solo-penalty-pending.png","solo-penalty-completed.png","solo-endgame-ranking.png"],
    errors,
  };
  await writeFile(`${out}/solo-ui-results.json`,JSON.stringify(summary,null,2));
  console.log("PASS: solo penalty click/load, log, token and endgame ranking in real Chrome browser");
  console.log(JSON.stringify(summary,null,2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
