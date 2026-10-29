import { installOfflineNarrator } from "./offline-narrator.mjs";
/**
 * Auditoria de redimensionamento real: navegador permanece na MESMA página.
 * Compara cada casa com a projeção da arte, não somente peça ↔ hotspot.
 * Não altera o motor, coordenadas, CSS nem assets de produção.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
const output = "qa/output/resize";
await mkdir(output, { recursive: true });

const server = spawn(process.execPath, ["./node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, CI: "true" },
});
let stderr = "";
server.stderr.on("data", (v) => { stderr += String(v); });
let browser;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  let ready = false;
  for (let attempt = 0; attempt < 65; attempt++) {
    if (server.exitCode !== null) throw new Error("Vite terminou antes de ficar pronto: " + stderr);
    try {
      const response = await fetch(origin);
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(150);
  }
  if (!ready) throw new Error("Vite não iniciou: " + stderr);

  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await installOfflineNarrator(page);
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".house-hotspot");
  await page.addStyleTag({ content: "#opening-sequence, #intro-dialog { display: none !important; }" });
  await page.evaluate(async () => {
    const image = document.querySelector(".board-art");
    if (!image) throw new Error("Arte não encontrada");
    await image.decode();
  });

  const sizes = [
    [1440, 900], [1280, 800], [1051, 800], [1050, 800],
    [900, 700], [681, 800], [680, 800], [600, 800],
    [390, 844], [680, 800], [681, 800], [1050, 800],
    [1051, 800], [1440, 900],
  ];
  const measurements = [];
  for (let i = 0; i < sizes.length; i++) {
    const [width, height] = sizes[i];
    await page.setViewportSize({ width, height });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (width === 390) {
      await page.evaluate(() => {
        const stage = document.querySelector(".board-stage");
        stage.scrollLeft = Math.round((stage.scrollWidth - stage.clientWidth) / 2);
      });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    } else {
      await page.evaluate(() => { document.querySelector(".board-stage").scrollLeft = 0; });
    }

    const result = await page.evaluate(() => {
      const board = document.querySelector(".board-stage");
      const img = document.querySelector(".board-art");
      const layer = document.querySelector(".houses");
      const pieces = document.querySelector(".tokens");
      const hotspotNodes = [...document.querySelectorAll(".house-hotspot")];
      const tokenNodes = [...document.querySelectorAll(".player-token")];
      if (hotspotNodes.length !== 40 || tokenNodes.length < 1) throw new Error("Casas/peças não renderizadas");
      const imgRect = img.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      const layerRect = layer.getBoundingClientRect();
      const tokensRect = pieces.getBoundingClientRect();
      const natural = { width: img.naturalWidth, height: img.naturalHeight };
      const fit = getComputedStyle(img).objectFit;
      if (fit !== "cover") throw new Error("Object-fit mudou: " + fit);
      const coverScale = Math.max(imgRect.width / natural.width, imgRect.height / natural.height);
      const fullWidth = natural.width * coverScale;
      const fullHeight = natural.height * coverScale;
      const startX = imgRect.left + (imgRect.width - fullWidth) / 2;
      const startY = imgRect.top + (imgRect.height - fullHeight) / 2;
      const n = (value) => Number.parseFloat(value);
      let maxImageOffsetPx = 0;
      let worstHouse = 0;
      const houses = hotspotNodes.map((node) => {
        const style = node.style;
        const hx = n(style.getPropertyValue("--x"));
        const hy = n(style.getPropertyValue("--y"));
        const hw = n(style.getPropertyValue("--w"));
        const hh = n(style.getPropertyValue("--h"));
        const centerPcX = hx + hw / 2;
        const centerPcY = hy + hh / 2;
        const box = node.getBoundingClientRect();
        const center = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        const projectedArt = {
          x: startX + (centerPcX / 100) * fullWidth,
          y: startY + (centerPcY / 100) * fullHeight,
        };
        const offset = Math.hypot(center.x - projectedArt.x, center.y - projectedArt.y);
        if (offset > maxImageOffsetPx) { maxImageOffsetPx = offset; worstHouse = Number(node.dataset.house); }
        return { id: Number(node.dataset.house), center, box, centerPcX, centerPcY, projectedArt };
      });

      // P1 inicia na casa 1. Comparamos peça, hotspot E centro projetado na arte.
      const p1 = tokenNodes.find((x) => x.dataset.player === "1");
      const box = p1.getBoundingClientRect();
      const p1Center = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      const home = houses[0];
      const tokenVsHotspotPx = Math.hypot(p1Center.x - home.center.x, p1Center.y - home.center.y);
      const tokenVsImagePx = Math.hypot(p1Center.x - home.projectedArt.x, p1Center.y - home.projectedArt.y);
      const layerToArt = Math.max(
        Math.abs(layerRect.left - imgRect.left),
        Math.abs(layerRect.top - imgRect.top),
        Math.abs(layerRect.width - imgRect.width),
        Math.abs(layerRect.height - imgRect.height),
        Math.abs(tokensRect.left - imgRect.left),
        Math.abs(tokensRect.top - imgRect.top),
        Math.abs(tokensRect.width - imgRect.width),
        Math.abs(tokensRect.height - imgRect.height),
      );
      return {
        viewport: [innerWidth, innerHeight],
        board: [Math.round(boardRect.width * 100) / 100, Math.round(boardRect.height * 100) / 100],
        imgBox: [Math.round(imgRect.width * 100) / 100, Math.round(imgRect.height * 100) / 100],
        natural,
        scrollLeft: board.scrollLeft,
        scrollWidth: board.scrollWidth,
        clipped: board.scrollWidth > board.clientWidth + 1,
        maxImageOffsetPx: Math.round(maxImageOffsetPx * 1000) / 1000,
        worstHouse,
        tokenVsHotspotPx: Math.round(tokenVsHotspotPx * 1000) / 1000,
        tokenVsImagePx: Math.round(tokenVsImagePx * 1000) / 1000,
        layerToArtPx: Math.round(layerToArt * 1000) / 1000,
      };
    });
    measurements.push(result);

    if ([0, 5, 6, 8, 13].includes(i)) {
      await page.screenshot({ path: `${output}/step-${i}-${width}x${height}.png`, fullPage: false });
    }
  }

  // Um segundo cenário na mesma instância do navegador: quatro humanos
  // renderizados pelo jogo, todos na casa 1, antes e depois do resize.
  await page.evaluate(() => {
    for (let i = 1; i < 4; i++) document.querySelector("#btn-mais-player").click();
    // O botão + acrescenta CPUs por padrão. Transformar os quatro em humanos
    // para que a rotação seja controlada pelo próprio teste, não por timers da CPU.
    document.querySelectorAll(".player-config-row select").forEach((select) => {
      select.value = "humano";
    });
    document.querySelectorAll(".player-config-row input").forEach((input, index) => {
      input.disabled = false;
      input.value = `QA-P${index + 1}`;
    });
    document.querySelector("#btn-iniciar-jornada").click();
  });
  await page.waitForFunction(() => document.querySelectorAll(".player-token").length === 4);
  const fourPlayerMeasurements = [];
  for (let i = 0; i < 10; i++) {
    const dims = [[1440, 900], [1051, 800], [1050, 800], [681, 800], [680, 800], [390, 844], [680, 800], [681, 800], [1051, 800], [1440, 900]][i];
    await page.setViewportSize({ width: dims[0], height: dims[1] });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (dims[0] === 390) await page.evaluate(() => document.querySelector(".board-stage").scrollLeft = 160);
    else await page.evaluate(() => document.querySelector(".board-stage").scrollLeft = 0);

    const result = await page.evaluate(() => {
      const img = document.querySelector(".board-art");
      const ir = img.getBoundingClientRect();
      const house = document.querySelector('.house-hotspot[data-house="1"]');
      const hr = house.getBoundingClientRect();
      const style = house.style;
      const nx = Number.parseFloat(style.getPropertyValue("--x"));
      const ny = Number.parseFloat(style.getPropertyValue("--y"));
      const nw = Number.parseFloat(style.getPropertyValue("--w"));
      const nh = Number.parseFloat(style.getPropertyValue("--h"));
      const shifts = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      const items = [...document.querySelectorAll(".player-token")].map((el, idx) => {
        const token = el.getBoundingClientRect();
        const tx = Number.parseFloat(el.style.getPropertyValue("--tx"));
        const ty = Number.parseFloat(el.style.getPropertyValue("--ty"));
        const expectedPcX = nx + nw / 2 + shifts[idx][0] * Math.min(1, nw * .18);
        const expectedPcY = ny + nh / 2 + shifts[idx][1] * Math.min(1.35, nh * .18);
        const errorInCSSPc = Math.hypot(tx - expectedPcX, ty - expectedPcY);
        const visualCX = token.left + token.width / 2;
        const visualCY = token.top + token.height / 2;
        const expectedBrowserX = ir.left + ir.width * tx / 100;
        const expectedBrowserY = ir.top + ir.height * ty / 100;
        const visualErrorPx = Math.hypot(visualCX - expectedBrowserX, visualCY - expectedBrowserY);
        const insideHouse = visualCX >= hr.left && visualCX <= hr.right && visualCY >= hr.top && visualCY <= hr.bottom;
        return { player: idx + 1, errorInCSSPc, visualErrorPx, insideHouse, tx, ty };
      });
      return {
        viewport: [innerWidth, innerHeight],
        pieceCount: items.length,
        items,
        maxVisualErrorPx: Math.max(...items.map((x) => x.visualErrorPx)),
        maxCSSPositionErrorPc: Math.max(...items.map((x) => x.errorInCSSPc)),
      };
    });
    if (result.pieceCount !== 4) throw new Error("Participantes desaparecidos durante resize");
    if (result.items.some((item) => !item.insideHouse)) throw new Error("Uma das quatro peças ficou fora dos limites da casa 1");
    fourPlayerMeasurements.push(result);
    if ([0, 4, 5, 9].includes(i)) {
      await page.screenshot({ path: `${output}/four-player-${i}-${dims[0]}x${dims[1]}.png`, fullPage: false });
    }
  }
  const maxFourPlayerPixelError = Math.max(...fourPlayerMeasurements.map((m) => m.maxVisualErrorPx));
  const maxFourPlayerPositionError = Math.max(...fourPlayerMeasurements.map((m) => m.maxCSSPositionErrorPc));
  await writeFile(`${output}/four-player-measurements.json`, JSON.stringify({ maxFourPlayerPixelError, maxFourPlayerPositionError, fourPlayerMeasurements }, null, 2));
  console.log("4-player dynamic resize:", JSON.stringify({ maxFourPlayerPixelError, maxFourPlayerPositionError, fourPlayerMeasurements }, null, 2));
  if (maxFourPlayerPixelError > 1.25) throw new Error(`Peças x arte fora de sincronia: ${maxFourPlayerPixelError.toFixed(3)}px`);
  if (maxFourPlayerPositionError > 0.001) throw new Error("Algum jogador divergiu da formação prevista em posicaoDaPeca");


  // Cenário mais parecido com o relato: executar 4 rolagens REAIS (uma para
  // cada jogador), manter a sessão em andamento e redimensionar sem reload.
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Sem áudio no teste: dispensa desbloqueio multimídia e não altera regras.
  await page.evaluate(() => document.querySelector("#btn-audio").click());
  for (let turn = 0; turn < 4; turn++) {
    // The die is legitimately disabled while a milestone trophy dialog is open.
    // Dismiss the trophy before the next gameplay roll, just as a player would.
    await page.evaluate(() => {
      const popup = document.querySelector("#trophy-dialog");
      if (popup?.open) document.querySelector("#btn-continuar-trofeu").click();
    });
    await page.waitForFunction(() => {
      const b = document.querySelector("#btn-rolar-dado");
      return b && !b.disabled;
    }, undefined, { timeout: 12000 });
    const beforeCount = await page.locator("#game-log-list li").count();
    await page.evaluate(() => document.querySelector("#btn-rolar-dado").click());
    await page.waitForFunction((previous) => document.querySelectorAll("#game-log-list li").length > previous, beforeCount, { timeout: 12000 });
    await page.evaluate(() => {
      const popup = document.querySelector("#trophy-dialog");
      if (popup?.open) document.querySelector("#btn-continuar-trofeu").click();
    });
  }
  const afterMoves = [];
  for (const [width, height] of [[1440,900],[1051,800],[1050,800],[681,800],[680,800],[390,844],[680,800],[1440,900]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const measure = await page.evaluate(() => {
      const img = document.querySelector(".board-art");
      const ir = img.getBoundingClientRect();
      const scale = Math.max(ir.width / img.naturalWidth, ir.height / img.naturalHeight);
      const ow = img.naturalWidth * scale, oh = img.naturalHeight * scale;
      const imgL = ir.left + (ir.width - ow) / 2;
      const imgT = ir.top + (ir.height - oh) / 2;
      const all = [...document.querySelectorAll(".player-token")];
      const players = all.map(token => {
        const label = token.getAttribute("aria-label") ?? "";
        const id = Number(token.dataset.player);
        const match = label.match(/(?:casa|square) (\d+)/);
        if(!match) throw new Error("Peça sem casa em aria-label: " + label);
        const houseNumber=Number(match[1]);
        const house=document.querySelector(`.house-hotspot[data-house="${houseNumber}"]`);
        const tx=Number.parseFloat(token.style.getPropertyValue("--tx"));
        const ty=Number.parseFloat(token.style.getPropertyValue("--ty"));
        const rect=token.getBoundingClientRect();
        const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
        const visualError=Math.hypot(cx-(imgL+tx/100*ow),cy-(imgT+ty/100*oh));
        const hr=house.getBoundingClientRect();
        const housePc={
          x:Number.parseFloat(house.style.getPropertyValue("--x")),
          y:Number.parseFloat(house.style.getPropertyValue("--y")),
          w:Number.parseFloat(house.style.getPropertyValue("--w")),
          h:Number.parseFloat(house.style.getPropertyValue("--h")),
        };
        const same=all.filter(el=>(el.getAttribute("aria-label") ?? "").match(new RegExp(`(?:casa|square) ${houseNumber},`)));
        const ix=same.findIndex(el=>Number(el.dataset.player)===id);
        const form={
          1:[[0,0]],
          2:[[-1,0],[1,0]],
          3:[[-1,-1],[1,-1],[0,1]],
          4:[[-1,-1],[1,-1],[-1,1],[1,1]],
        }[same.length][ix];
        const expectedTx=housePc.x+housePc.w/2+form[0]*Math.min(1,housePc.w*.18);
        const expectedTy=housePc.y+housePc.h/2+form[1]*Math.min(1.35,housePc.h*.18);
        const formationError=Math.hypot(tx-expectedTx,ty-expectedTy);
        return {id,houseNumber,visualError,formationError,tokenPc:[tx,ty]};
      });
      return {viewport:[innerWidth,innerHeight],players,maxImageError:Math.max(...players.map(x=>x.visualError)),maxFormationError:Math.max(...players.map(x=>x.formationError))};
    });
    if (measure.players.length !== 4) throw new Error("Perdeu jogadores após rolagens");
    afterMoves.push(measure);
    if ([680,390,1440].includes(width)) await page.screenshot({path:`${output}/after-gameplay-${width}x${height}.png`});
  }
  const maxAfterMovesImageError=Math.max(...afterMoves.map(x=>x.maxImageError));
  const maxAfterMovesFormationError=Math.max(...afterMoves.map(x=>x.maxFormationError));
  console.log("Post-gameplay resize:",JSON.stringify({maxAfterMovesImageError,maxAfterMovesFormationError,afterMoves},null,2));
  await writeFile(`${output}/post-gameplay-measurements.json`,JSON.stringify({maxAfterMovesImageError,maxAfterMovesFormationError,afterMoves},null,2));
  if(maxAfterMovesImageError>2)throw new Error("Desalinhamento visual após jogadas: "+maxAfterMovesImageError);
  if(maxAfterMovesFormationError>.001)throw new Error("Desalinhamento do motor após jogadas: "+maxAfterMovesFormationError);

  const worst = Math.max(...measurements.map((x) => x.maxImageOffsetPx));
  const worstLayer = Math.max(...measurements.map((x) => x.layerToArtPx));
  const worstToken = Math.max(...measurements.map((x) => x.tokenVsHotspotPx));
  const summary = { worstImageOffsetPx: worst, worstLayerToArtPx: worstLayer, worstP1ToHotspotPx: worstToken, measurements, pageErrors };
  await writeFile(`${output}/measurements.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  if (pageErrors.length) throw new Error("Erros do navegador: " + pageErrors.join("; "));
  if (worstToken > 1.25) throw new Error(`P1 x hotspot desalinhados: ${worstToken.toFixed(3)}px`);
  if (worstLayer > 1.25) throw new Error(`Camada de peças/hotspots difere da imagem: ${worstLayer.toFixed(3)}px`);
  if (worst > 2) throw new Error(`Hotspots x arte projetada divergiram: ${worst.toFixed(3)}px`);
  console.log("PASS: resize dinâmico ida/volta e três camadas conferidas.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
