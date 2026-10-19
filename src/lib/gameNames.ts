import zhCN from '../i18n/gameNames.zh-CN.json';

// English tile/item/wall/NPC names -> in-game names, keyed by UI language.
// Generated from Terraria's own localization by scripts/build-game-names-zh.py.
const gameNameTables: Record<string, Record<string, string>> = {
  'zh-CN': zhCN,
};

/** Translates an English game name; composite labels like "Tile - Frame - Variety" are translated part by part. */
export function localizeGameName(name: string, language: string | undefined): string {
  const table = language ? gameNameTables[language] : undefined;
  if (!table || !name) return name;
  return table[name] ?? name.split(' - ').map(part => table[part] ?? part).join(' - ');
}
