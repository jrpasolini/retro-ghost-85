import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";

const TEXT_EXTENSIONS = new Set([".html", ".css", ".js", ".mjs", ".ts", ".svg", ".json"]);

/**
 * A root-absolute local asset is `/assets/...` or `/audio/...` that is not the
 * tail of a relative path (`./assets`) or of a full URL (`https://host/assets`).
 */
export const ROOT_LOCAL_ASSET = /(?<![\w.])\/(?:assets|audio)\//g;

export function assetViolations(text) {
  return [...text.matchAll(ROOT_LOCAL_ASSET)].map((match) => {
    const start = Math.max(0, match.index - 24);
    return text.slice(start, match.index + match[0].length + 48).replace(/\s+/g, " ");
  });
}

function scanFile(path, hits) {
  if (!TEXT_EXTENSIONS.has(extname(path))) return;
  const violations = assetViolations(readFileSync(path, "utf8"));
  for (const sample of violations) hits.push({ path, sample });
}

export function scanTree(root) {
  const hits = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
      if (entry === "node_modules" || entry === "dist") continue;
      const path = join(directory, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) walk(path);
      else scanFile(path, hits);
    }
  };
  if (!existsSync(root)) return hits;
  if (statSync(root).isDirectory()) walk(root);
  else scanFile(root, hits);
  return hits;
}

function report(label, hits) {
  if (hits.length === 0) {
    console.log(`${label}: no root-absolute local assets`);
    return;
  }
  for (const hit of hits) console.error(`${hit.path}: ${hit.sample}`);
  console.error(`${label}: ${hits.length} root-absolute local asset path(s)`);
  process.exitCode = 1;
}

const invokedDirectly = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const checkDist = process.argv.includes("--dist");
  const repo = new URL("..", import.meta.url).pathname;
  report("source", [...scanTree(join(repo, "src")), ...scanTree(join(repo, "index.html"))]);
  if (checkDist) {
    const dist = join(repo, "dist");
    if (!existsSync(dist)) {
      console.error("dist/ is missing");
      process.exit(1);
    }
    report("dist", scanTree(dist));
  }
  if (process.exitCode) process.exit(process.exitCode);
}
