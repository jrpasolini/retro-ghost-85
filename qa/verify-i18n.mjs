import assert from "node:assert/strict";
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { casas } from "../src/data/casas.ts";
import { casasEn, localizarCasa, prologoEn, atosEn } from "../src/i18n/content.ts";
import { desserializarSave } from "../src/estado/save.ts";

const origin = "http://127.0.0.1:4190";
const output = "qa/output/i18n";
await mkdir(output, { recursive: true });
const server = spawn(process.execPath,
  ["./node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4190", "--strictPort"],
  { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, CI: "true" } }
);
let stderr = "";
server.stderr.on("data", b => { stderr += String(b); });
let browser;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

try {
  assert.equal(casasEn.length, 40, "All 40 English narratives must exist");
  for (const orig of casas) {
    const en = localizarCasa(orig, "en-US");
    const pt = localizarCasa(orig, "pt-BR");
    assert.equal(pt, orig, "PT-BR must keep original data unchanged");
    assert.deepEqual([en.id, en.tipo, en.consequencia, en.x, en.y, en.width, en.height],
      [orig.id, orig.tipo, orig.consequencia, orig.x, orig.y, orig.width, orig.height]);
    assert.ok(en.titulo.length > 4 && en.narrativa.length > 65, `Square ${orig.id} missing English`);
    assert.notEqual(en.titulo, orig.titulo);
    assert.notEqual(en.narrativa, orig.narrativa);
    assert.ok(!en.efeito.includes("projeto") && !en.efeito.includes("jogada"), `Non-localized effect ${orig.id}`);
  }
  assert.equal(Object.keys(atosEn).length, 4);
  assert.equal(prologoEn.paragrafos.length, 3);

  let ready = false;
  for (let i = 0; i < 75; i++) {
    if (server.exitCode !== null) throw new Error("Vite exited: " + stderr);
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await sleep(160);
  }
  assert.ok(ready,"Vite is not running: "+stderr);
  browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.querySelector("#opening-sequence").hidden = true;
    document.querySelector("#intro-dialog").showModal();
  });
  await page.waitForFunction(() => document.querySelector("#intro-title")?.textContent === "You are a developer in 1985");
  assert.equal(await page.locator("html").getAttribute("lang"), "en-US");
  assert.match(await page.locator("#intro-copy").textContent(),/Every square on the board/);
  assert.match(await page.locator(".setup-heading").textContent(),/Who will write the code/);
  assert.equal(await page.locator(".language-switch-popup button[data-language]").count(),2);
  assert.equal(await page.locator(".language-switch-top button[data-language]").count(),2);
  assert.equal(await page.locator(".language-switch-popup [data-language='en-US']").getAttribute("aria-pressed"),"true");
  const control=page.locator(".language-switch-popup");
  const controlBox=await control.boundingBox();
  const dialogBox=await page.locator("#intro-dialog").boundingBox();
  assert.ok(controlBox && dialogBox && controlBox.x > dialogBox.x + dialogBox.width*.56);
  assert.ok(controlBox.y < dialogBox.y+130,"flags must be in upper-right of popup");
  await page.screenshot({path:`${output}/en-prologue-desktop.png`});

  // User interaction switches the popup language immediately, with no reload.
  await page.locator(".language-switch-popup [data-language='pt-BR']").click();
  await page.waitForFunction(() => document.querySelector("#intro-title")?.textContent === "Você é um desenvolvedor em 1985");
  assert.equal(await page.locator("html").getAttribute("lang"), "pt-BR");
  assert.match(await page.locator(".setup-heading").textContent(),/Quem vai programar/);
  assert.equal(await page.locator(".language-switch-popup [data-language='pt-BR']").getAttribute("aria-pressed"),"true");
  await page.screenshot({path:`${output}/pt-prologue-desktop.png`});

  await page.locator(".player-config-row input").first().fill("Echo");
  // Keep this scenario solo: no CPU timers.
  await page.locator("#btn-iniciar-jornada").click();
  await page.waitForFunction(() => document.querySelector("#intro-dialog")?.open === false);
  const before = await page.locator("#game-log-list li").count();
  await page.evaluate(() => document.querySelector("#btn-rolar-dado").click());
  await page.waitForFunction(count => document.querySelectorAll("#game-log-list li").length > count, before, { timeout: 12000 });
  await page.waitForFunction(() => document.querySelector("#btn-rolar-dado")?.disabled === false);
  assert.match(await page.locator("#game-log-list").textContent(),/DADO /);
  const boardBefore = await page.locator(".player-token").first().getAttribute("style");
  const [ptDownload] = await Promise.all([
    page.waitForEvent("download"), page.locator("#btn-save").evaluate(el => el.click())
  ]);
  const ptMd = await readFile(await ptDownload.path(), "utf8");
  assert.match(ptMd,/save da partida/);
  const ptState = desserializarSave(ptMd);
  assert.equal(ptState.schema,1);
  assert.equal(ptState.jogadores[0].nome,"Echo");

  await page.locator(".language-switch-top [data-language='en-US']").click();
  await page.waitForFunction(() => document.documentElement.lang === "en-US");
  await page.waitForFunction(() => document.querySelector("#game-log-list")?.textContent?.includes("DIE "));
  assert.match(await page.locator(".narrative").textContent(),/[A-Za-z]{5}/);
  assert.match(await page.locator("#game-log-list").textContent(),/square|progress|DIE/);
  assert.equal(await page.locator(".player-token").first().getAttribute("style"),boardBefore,"Switching language moved the token");
  const [enDownload] = await Promise.all([
    page.waitForEvent("download"), page.locator("#btn-save").evaluate(el => el.click())
  ]);
  const enMd = await readFile(await enDownload.path(), "utf8");
  assert.match(enMd,/match save/);
  assert.match(enMd,/The JSON block is the source of truth/);
  const enState = desserializarSave(enMd);
  assert.deepEqual(enState,ptState,"JSON save data changed with language");

  await page.locator("#input-load").setInputFiles({
    name:"pt-export.md",mimeType:"text/markdown",buffer:Buffer.from(ptMd,"utf8")
  });
  await page.waitForFunction(() => document.querySelector("#tape-feedback")?.textContent?.includes("MATCH LOADED"));
  assert.equal(await page.locator("html").getAttribute("lang"),"en-US");
  assert.match(await page.locator("#game-log-list").textContent(),/DIE /,"PT log entries must render in English");
  assert.equal(await page.locator(".player-token").first().getAttribute("style"),boardBefore);
  await page.screenshot({path:`${output}/en-midgame.png`});

  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:`${output}/en-mobile.png`});
  await page.locator(".language-switch-top [data-language='pt-BR']").click();
  await page.waitForFunction(() => document.documentElement.lang === "pt-BR");
  assert.match(await page.locator("#game-log-list").textContent(),/DADO /);
  assert.equal(await page.locator(".player-token").first().getAttribute("style"),boardBefore);
  await page.screenshot({path:`${output}/pt-mobile.png`});

  // A new load in the same context must remember explicit language choice.
  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal(await page.locator("html").getAttribute("lang"),"pt-BR");
  await page.locator(".language-switch-top [data-language='en-US']").click();
  await page.waitForFunction(() => document.documentElement.lang === "en-US");
  await page.reload({waitUntil:"domcontentloaded"});
  assert.equal(await page.locator("html").getAttribute("lang"),"en-US");
  assert.deepEqual(errors,[],"Unhandled browser errors");
  const result={default:"en-US",alternate:"pt-BR",squareTranslations:casasEn.length,actTranslations:Object.keys(atosEn).length,saveCompatibility:true,midgameSwitch:true,restoresLanguage:true,errors};
  await writeFile(`${output}/results.json`,JSON.stringify(result,null,2));
  console.log("PASS: EN default, BR switch, 40 squares, four acts, 1-player match, mid-game state, save roundtrip, persistence, mobile");
  console.log(JSON.stringify(result,null,2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
