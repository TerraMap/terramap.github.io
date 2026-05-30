import { itemPrefixes } from '../itemPrefixes';
import { items } from '../items';
import { tiles } from '../tiles';
import type { TileFrame, TileInfo, WorldData, WorldItem, WorldTile } from '../types/settings';

export function getTileInfo(tile: WorldTile): TileFrame | TileInfo | undefined {
  const tileInfo = tiles[tile.Type!];

  if (!tileInfo) return tileInfo;

  if (!tileInfo.frames)
    return tileInfo;

  let matchingFrame: TileFrame | undefined;

  for (let i = 0; i < tileInfo.frames.length; i++) {
    const frame = tileInfo.frames[i];

    if ((!frame.u && !tile.TextureU) || (frame.u ?? 0) <= (tile.TextureU ?? 0)) {
      if ((!frame.v && !tile.TextureV) || (frame.v ?? 0) <= (tile.TextureV ?? 0))
        matchingFrame = frame;
    }
  }

  if (!matchingFrame)
    return tileInfo;

  matchingFrame.parent = tileInfo;

  return matchingFrame;
}

export function getTileAt(world: WorldData | null, x: number, y: number): WorldTile | null {
  if (!world) return null;

  const index = x * world.height + y;
  if (index >= 0 && index < world.tiles.length) {
    return world.tiles[index];
  }

  return null;
}

export function getItemText(item: WorldItem): string {
  let prefix = "";

  if (item.prefixId > 0 && item.prefixId < itemPrefixes.length)
    prefix = itemPrefixes[item.prefixId].name;

  let itemName: string | number = item.id;
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const itemSettings = items[itemIndex];
    if (itemSettings.id === item.id) {
      itemName = itemSettings.name;
      break;
    }
  }
  return `${prefix} ${itemName} ${item.count !== 1 ? `(${item.count})` : ''}`;
}
