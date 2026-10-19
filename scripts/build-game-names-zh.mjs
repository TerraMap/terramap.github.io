#!/usr/bin/env node

// Builds src/i18n/gameNames.zh-CN.json: an English -> Simplified Chinese map for
// tile, item, wall, NPC and prefix names, using Terraria's own localization files.
//
// The localization JSON is embedded in Terraria.exe. Extract it (Windows PowerShell 5.1) with:
//
//   $a = [Reflection.Assembly]::ReflectionOnlyLoadFrom("<Terraria dir>\Terraria.exe")
//   foreach ($n in $a.GetManifestResourceNames() | ? { $_ -match 'Localization\.Content\.(en-US|zh-Hans)' }) {
//     $s = $a.GetManifestResourceStream($n)
//     $f = [IO.File]::Create("<out dir>\$($n -replace 'Terraria.Localization.Content.', '')")
//     $s.CopyTo($f); $f.Close(); $s.Close()
//   }
//
// Usage: node scripts/build-game-names-zh.mjs <out dir>

import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import process from "process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const locDir = process.argv[2];

if (!locDir) {
  console.error("Usage: node scripts/build-game-names-zh.mjs <localization dir>");
  process.exit(1);
}

// Names TerraMap uses that have no exact in-game equivalent (mostly tile groups and set names).
const manual = JSON.parse(readFileSync(resolve(__dirname, "game-names-zh-manual.json"), "utf8"));

const suffixes = {
  " (natural)": "（天然）", " (unused)": "（未使用）", " (Offline)": "（关闭）", " (Legacy)": "（旧版）",
  " (Closed)": "（关闭）", " (Open)": "（打开）", " (Hardmode)": "（困难模式）",
};

// Terraria's localization files use trailing commas, so strip them before parsing.
function load(name) {
  const text = readFileSync(resolve(locDir, name), "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(text.replace(/,(\s*[}\]])/g, "$1"));
}

function buildBase() {
  const base = new Map();
  const sources = [
    ["Items.json", "ItemName"], ["NPCs.json", "NPCName"], ["Game.json", "MapObject"],
    ["Items.json", "Prefix"], ["Game.json", "BuffName"], ["Projectiles.json", "ProjectileName"],
  ];
  for (const [file, section] of sources) {
    const en = load(`en-US.${file}`)[section];
    const zh = load(`zh-Hans.${file}`)[section];
    for (const [key, value] of Object.entries(en)) {
      if (typeof value === "string" && typeof zh[key] === "string" && !value.includes("{") && !base.has(value)) {
        base.set(value, zh[key]);
      }
    }
  }
  return base;
}

function translate(name, base) {
  if (name in manual) return manual[name];
  if (base.has(name)) return base.get(name);

  const group = /^(.*) \(Group (\d+)\)$/.exec(name);
  if (group) {
    const inner = translate(group[1], base);
    return inner && `${inner}（组 ${group[2]}）`;
  }
  for (const [suffix, zh] of Object.entries(suffixes)) {
    if (name.endsWith(suffix)) {
      const inner = translate(name.slice(0, -suffix.length), base);
      return inner && inner + zh;
    }
  }
  for (const suffix of [" Block", " Ore"]) {
    if (name.endsWith(suffix) && base.has(name.slice(0, -suffix.length))) {
      return base.get(name.slice(0, -suffix.length));
    }
  }
  for (const [plural, singular] of [["ies", "y"], ["es", ""], ["s", ""]]) {
    const candidate = name.slice(0, -plural.length) + singular;
    if (name.endsWith(plural) && base.has(candidate)) return base.get(candidate);
  }
  return undefined;
}

const base = buildBase();
const nameRe = /(?:name|variety): "([^"]*)"/g;
const names = new Set();
for (const source of ["tiles", "items", "walls", "npcs", "itemPrefixes", "sets"]) {
  for (const match of readFileSync(resolve(root, "src", `${source}.ts`), "utf8").matchAll(nameRe)) {
    names.add(match[1]);
  }
}

const out = {};
for (const name of [...names].sort()) {
  const zh = name ? translate(name, base) : undefined;
  if (zh && zh !== name) out[name] = zh;
}

const dest = resolve(root, "src/i18n/gameNames.zh-CN.json");
writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log(`${Object.keys(out).length} of ${names.size} names translated -> ${dest}`);
