// Localized tile, wall, item, prefix and NPC names, generated from Terraria's own
// localization by scripts/generate-block-names.ts. Walls, items, prefixes and NPCs are
// keyed by ID; tile, frame and variety names by their English name. Anything missing
// stays English.
export interface BlockNameTable {
  tiles: Record<string, string>;
  walls: Record<string, string>;
  items: Record<string, string>;
  prefixes: Record<string, string>;
  npcs: Record<string, string>;
  /** How the game puts a prefix on an item name, e.g. "{ItemName} {PrefixName}" in Spanish. */
  prefixFormat: string;
  /** Gendered prefix forms by prefix ID, e.g. { FeminineSingular: "Legendaria" }. */
  prefixVariants: Record<string, Record<string, string>>;
  /** Grammatical gender by item ID, which picks the prefix form, e.g. "FeminineSingular". */
  itemGenders: Record<string, string>;
}

export interface BlockNames {
  /** The language these names are in; English until a localized table has loaded. */
  language: string;
  tile(name: string): string;
  wall(id: number, name: string): string;
  item(id: number, name: string): string;
  /** The item's name with a prefix, combined the way the game does it in this language. */
  prefixedItem(itemId: number, itemName: string, prefixId: number, prefixName: string): string;
  npc(id: number, name: string): string;
}

export const englishBlockNames: BlockNames = {
  language: 'en',
  tile: name => name,
  wall: (_id, name) => name,
  item: (_id, name) => name,
  prefixedItem: (_itemId, itemName, _prefixId, prefixName) => `${prefixName} ${itemName}`,
  npc: (_id, name) => name,
};

export function createBlockNames(table: BlockNameTable, language: string): BlockNames {
  return {
    language,
    tile: name => table.tiles[name] ?? name,
    wall: (id, name) => table.walls[id] ?? name,
    item: (id, name) => table.items[id] ?? name,
    // Mirrors Lang.GetPrefixedItemName: the prefix takes the item's gender when it has that form.
    prefixedItem: (itemId, itemName, prefixId, prefixName) => {
      const gender = table.itemGenders[itemId];
      const prefix = (gender && table.prefixVariants[prefixId]?.[gender]) || (table.prefixes[prefixId] ?? prefixName);
      const item = table.items[itemId] ?? itemName;
      return table.prefixFormat.replace(/\{(PrefixName|ItemName)\}/g, (_, key) => (key === 'PrefixName' ? prefix : item));
    },
    npc: (id, name) => table.npcs[id] ?? name,
  };
}
