#!/usr/bin/env node

// Updates src/tiles.ts, src/walls.ts, and src/items.ts from TEdit JSON data.
//
// Usage: node scripts/update-settings-from-tedit.mjs

import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const srcDir = resolve(root, "src");

const teditTiles = JSON.parse(readFileSync(resolve(root, "scripts/tedit/tiles.json"), "utf8"));
const teditWalls = JSON.parse(readFileSync(resolve(root, "scripts/tedit/walls.json"), "utf8"));
const teditItems = JSON.parse(readFileSync(resolve(root, "scripts/tedit/items.json"), "utf8"));

// --- Tiles ---

const mergedTiles = [];

for (const tedit of teditTiles.sort((a, b) => a.id - b.id)) {
  const tile = { id: tedit.id, name: tedit.name };

  if (tedit.frameSize) {
    const [w, h] = tedit.frameSize[0];
    if (w > 1 || h > 1) {
      tile.size = `${w},${h}`;
    }
  }

  if (tedit.frames && tedit.frames.length > 0) {
    tile.frames = tedit.frames.map((f) => {
      const frame = {};
      if (f.uv) {
        frame.u = f.uv[0];
        frame.v = f.uv[1];
      }
      if (f.name) frame.name = f.name;
      if (f.variety) frame.variety = f.variety;
      return frame;
    });
  }

  mergedTiles.push(tile);
}

writeFile("tiles.ts", "TileInfo", "tiles", mergedTiles);

// --- Walls ---

const mergedWalls = [];
for (const tedit of teditWalls.sort((a, b) => a.id - b.id)) {
  const wall = { id: tedit.id, name: tedit.name };
  if (tedit.color) wall.color = tedit.color;
  mergedWalls.push(wall);
}

writeFile("walls.ts", "WallInfo", "walls", mergedWalls, `
function hexToRgb(hex: string) {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[2], 16),
    g: parseInt(result[3], 16),
    b: parseInt(result[4], 16)
  } : null;
}

for (const wall of walls) {
  if (wall.color) {
    wall.color = hexToRgb(wall.color as string);
  }
}
`);

// --- Items ---

// Preserve negative-ID items from current data (TEdit doesn't have them)
const currentItemsPath = resolve(srcDir, "items.ts");
let negativeItems = [];
try {
  const currentSrc = readFileSync(currentItemsPath, "utf8");
  const match = currentSrc.match(/export const items: ItemInfo\[\] = (\[[\s\S]*\]);/);
  if (match) {
    negativeItems = JSON.parse(match[1]).filter((i) => i.id < 0);
  }
} catch {
  // No existing file; skip negative-ID preservation
}

const mergedItems = [...negativeItems];
for (const tedit of teditItems.sort((a, b) => a.id - b.id)) {
  mergedItems.push({ name: tedit.name, id: tedit.id });
}

writeFile("items.ts", "ItemInfo", "items", mergedItems);

// --- Output ---

console.log(`Tiles: ${mergedTiles.length} entries`);
console.log(`Walls: ${mergedWalls.length} entries`);
console.log(`Items: ${mergedItems.length} entries (${negativeItems.length} negative-ID preserved)`);

function writeFile(filename, typeName, varName, data, suffix = "") {
  const path = resolve(srcDir, filename);
  const json = JSON.stringify(data, null, 2);
  const content = `import type { ${typeName} } from './types/settings';\n\nexport const ${varName}: ${typeName}[] = ${json};\n${suffix}`;
  writeFileSync(path, content);
  console.log(`Wrote ${path}`);
}
