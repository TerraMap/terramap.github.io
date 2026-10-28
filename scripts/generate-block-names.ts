#!/usr/bin/env node

// Generates src/i18n/blockNames/<language>.json: localized tile, wall, item, prefix and NPC
// names for each TerraMap language that Terraria is also translated into.
//
// Translations come from Terraria's own localization files, matched by game ID rather than
// by English text. Walls, items, prefixes and NPCs are keyed by ID. Tile, frame and variety
// names have no ID of their own, so they are keyed by TerraMap's English name. Names with no
// in-game equivalent (e.g. TEdit tile group and variety names) are left out and stay English.
//
// Each table also carries what the game needs to put a prefix on an item name: the language's
// format (prefix before or after the name, and any separator), the prefix's gendered forms and
// each item's gender, which picks among them.
//
// Input is a decompiled copy of Terraria (e.g. from ILSpy), which contains
// Terraria.Localization.Content.<culture>.*.json and Terraria.ID/*.cs.
//
// Usage: node scripts/generate-block-names.ts <decompiled Terraria dir> [--verbose]

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { itemPrefixes } from "../src/itemPrefixes.ts";
import { items } from "../src/items.ts";
import { npcs } from "../src/npcs.ts";
import { tiles } from "../src/tiles.ts";
import { walls } from "../src/walls.ts";

// TerraMap language -> Terraria culture
const languages: Record<string, string> = {
  es: "es-ES",
  "pt-BR": "pt-BR",
  ru: "ru-RU",
  "zh-CN": "zh-Hans",
};

type Section = Record<string, string>;
type Category = "tiles" | "walls" | "items" | "prefixes" | "npcs";
type BlockNameTable = Record<Category, Section> & {
  prefixFormat: string;
  prefixVariants: Record<string, Section>;
  itemGenders: Section;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const sourceDir = args.find(a => !a.startsWith("--")) ?? "";

if (!sourceDir) {
  console.error("Usage: node scripts/generate-block-names.ts <decompiled Terraria dir> [--verbose]");
  process.exit(1);
}

// Terraria's localization files have a BOM and trailing commas.
function loadLocalization(culture: string, file: string): Record<string, Section> {
  const text = readFileSync(resolve(sourceDir, `Terraria.Localization.Content.${culture}.${file}.json`), "utf8");
  return JSON.parse(text.replace(/^\uFEFF/, "").replace(/,(\s*[}\]])/g, "$1"));
}

// Reads `public const short DirtBlock = 2;` declarations from Terraria.ID/<name>.cs into id -> name.
function loadIds(name: string): Map<number, string> {
  const text = readFileSync(resolve(sourceDir, "Terraria.ID", `${name}.cs`), "utf8");
  const ids = new Map<number, string>();
  for (const [, key, id] of text.matchAll(/^\tpublic const \w+ (\w+) = (-?\d+);/gm)) {
    if (!ids.has(Number(id))) ids.set(Number(id), key);
  }
  return ids;
}

const itemIds = loadIds("ItemID");
const npcIds = loadIds("NPCID");
const prefixIds = loadIds("PrefixID");

// Items that place each tile / wall, from TEdit's data.
const teditItems: { id: number; createTile?: number; createWall?: number }[] =
  JSON.parse(readFileSync(resolve(root, "scripts/tedit/items.json"), "utf8"));
const itemsPlacingTile = new Map<number, number[]>();
const itemsPlacingWall = new Map<number, number[]>();
for (const item of teditItems) {
  if (item.createTile !== undefined) push(itemsPlacingTile, item.createTile, item.id);
  if (item.createWall !== undefined) push(itemsPlacingWall, item.createWall, item.id);
}
const itemNamesById = new Map(items.map(item => [item.id, item.name]));

const englishMapObjects = invert(loadLocalization("en-US", "Game").MapObject);

for (const [language, culture] of Object.entries(languages)) {
  const conflicts: string[] = [];
  const itemLocalization = loadLocalization(culture, "Items");
  const itemNames = itemLocalization.ItemName;
  const prefixNames = itemLocalization.Prefix;
  const npcNames = loadLocalization(culture, "NPCs").NPCName;
  const mapObjectNames = loadLocalization(culture, "Game").MapObject;
  const naturalWall: string = JSON.parse(readFileSync(resolve(root, `src/i18n/${language}.json`), "utf8")).game_names.natural_wall;

  const table: BlockNameTable = {
    tiles: {}, walls: {}, items: {}, prefixes: {}, npcs: {},
    prefixFormat: itemLocalization.CombineFormat.Prefix,
    prefixVariants: {},
    itemGenders: {},
  };
  // key is an ID, except for tiles where it is the English name.
  const add = (category: Category, key: string | number, english: string | undefined, localized: string | undefined) => {
    if (!english || !localized || localized === english || localized.includes("{")) return;
    const existing = table[category][key];
    if (existing && existing !== localized) {
      conflicts.push(`${category}: "${key}" -> "${existing}" (kept), "${localized}"`);
      return;
    }
    table[category][key] = localized;
  };
  const itemName = (id: number) => itemNames[itemIds.get(id) ?? ""];

  for (const item of items) add("items", item.id, item.name, itemName(item.id));
  for (const npc of npcs) add("npcs", npc.id, npc.name, npcNames[npcIds.get(npc.id) ?? ""]);
  itemPrefixes.forEach((prefix, id) => add("prefixes", id, prefix.name, prefixNames[prefixIds.get(id) ?? ""]));

  // Gendered prefix forms ("Legendary$FeminineSingular") and item genders ("TerraBlade$Gender"),
  // as Lang.GetPrefixedItemName uses them. Forms that match the plain prefix are left out.
  itemPrefixes.forEach((prefix, id) => {
    const key = prefixIds.get(id);
    if (!prefix.name || !key) return;
    const forms = Object.entries(prefixNames)
      .filter(([variantKey, value]) => variantKey.startsWith(`${key}$`) && value !== prefixNames[key])
      .map(([variantKey, value]) => [variantKey.slice(key.length + 1), value]);
    if (forms.length) table.prefixVariants[id] = Object.fromEntries(forms);
  });
  for (const item of items) {
    const gender = itemNames[`${itemIds.get(item.id)}$Gender`];
    if (gender) table.itemGenders[item.id] = gender;
  }

  // Tile, frame and variety names: use an item that places this tile and has the same English
  // name, otherwise a map object with the same English name.
  for (const tile of tiles) {
    const placing = itemsPlacingTile.get(tile.id) ?? [];
    const names = [tile.name, ...(tile.frames ?? []).flatMap(frame => [frame.name, frame.variety])];
    for (const name of names) {
      if (!name) continue;
      const itemId = placing.find(id => itemNamesById.get(id) === name);
      if (itemId !== undefined) add("tiles", name, name, itemName(itemId));
      else if (englishMapObjects[name]) add("tiles", name, name, mapObjectNames[englishMapObjects[name]]);
    }
  }

  // Wall names: use an item that places this wall and has the same English name.
  // "X (natural)" walls have no item, so they reuse the translation of wall X.
  for (const wall of walls) {
    const itemId = (itemsPlacingWall.get(wall.id) ?? []).find(id => itemNamesById.get(id) === wall.name);
    if (itemId !== undefined) add("walls", wall.id, wall.name, itemName(itemId));
  }
  for (const wall of walls) {
    const baseName = /^(.*) \(natural\)$/.exec(wall.name)?.[1];
    const base = table.walls[walls.find(w => w.name === baseName && table.walls[w.id])?.id ?? -1];
    if (base) add("walls", wall.id, wall.name, naturalWall.replace("{{name}}", base));
  }

  // Tiles sort by name; the ID-keyed sections are already in ID order.
  const sorted = { ...table, tiles: Object.fromEntries(Object.entries(table.tiles).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) };
  const dest = resolve(root, `src/i18n/blockNames/${language}.json`);
  writeFileSync(dest, JSON.stringify(sorted, null, 2) + "\n");

  console.log(`${language} (${culture}): ${coverage(table)} -> ${dest}`);
  if (conflicts.length) console.log(`  ${conflicts.length} conflicts${verbose ? `:\n    ${conflicts.join("\n    ")}` : " (--verbose to list)"}`);
  if (verbose) console.log(`  untranslated tiles/walls:\n    ${untranslated(table).join("\n    ")}`);
}

// Counts translated entries against all names, including ones whose translation is the same as
// the English and so are left out of the table.
function coverage(table: BlockNameTable): string {
  const total: Record<Category, number> = {
    tiles: new Set(tileNames()).size,
    walls: walls.length,
    items: items.length,
    prefixes: itemPrefixes.filter(prefix => prefix.name).length,
    npcs: npcs.length,
  };
  return (Object.keys(total) as Category[])
    .map(category => `${category} ${Object.keys(table[category]).length}/${total[category]}`)
    .join(", ");
}

function untranslated(table: BlockNameTable): string[] {
  return [
    ...new Set(tileNames().filter(name => !table.tiles[name]).map(name => `tile: ${name}`)),
    ...walls.filter(wall => !table.walls[wall.id]).map(wall => `wall ${wall.id}: ${wall.name}`),
  ];
}

function tileNames(): string[] {
  return tiles
    .flatMap(tile => [tile.name, ...(tile.frames ?? []).flatMap(frame => [frame.name, frame.variety])])
    .filter((name): name is string => !!name && name !== "Default");
}

function invert(section: Section): Section {
  return Object.fromEntries(Object.entries(section).map(([key, value]) => [value, key]));
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}
