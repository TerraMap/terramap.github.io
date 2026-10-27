// Localized tile, wall, item, prefix and NPC names, generated from Terraria's own
// localization by scripts/generate-game-names.ts. Walls, items, prefixes and NPCs are
// keyed by ID; tile, frame and variety names by their English name. Anything missing
// stays English.
export interface BlockNameTable {
  tiles: Record<string, string>;
  walls: Record<string, string>;
  items: Record<string, string>;
  prefixes: Record<string, string>;
  npcs: Record<string, string>;
}

export interface BlockNames {
  /** The language these names are in; English until a localized table has loaded. */
  language: string;
  tile(name: string): string;
  wall(id: number, name: string): string;
  item(id: number, name: string): string;
  prefix(id: number, name: string): string;
  npc(id: number, name: string): string;
}

export const englishBlockNames: BlockNames = {
  language: 'en',
  tile: name => name,
  wall: (_id, name) => name,
  item: (_id, name) => name,
  prefix: (_id, name) => name,
  npc: (_id, name) => name,
};

export function createBlockNames(table: BlockNameTable, language: string): BlockNames {
  return {
    language,
    tile: name => table.tiles[name] ?? name,
    wall: (id, name) => table.walls[id] ?? name,
    item: (id, name) => table.items[id] ?? name,
    prefix: (id, name) => table.prefixes[id] ?? name,
    npc: (id, name) => table.npcs[id] ?? name,
  };
}
