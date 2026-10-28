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

  browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
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
