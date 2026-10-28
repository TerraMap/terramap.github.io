import { itemPrefixes } from '../itemPrefixes';
import { items } from '../items';
import { tiles } from '../tiles';
import type { TileFrame, TileInfo, WorldData, WorldItem, WorldTile } from '../types/settings';
import { englishBlockNames, type BlockNames } from './blockNames';

export function fillTileFromRaw(tile: WorldTile, world: WorldData, idx: number, x: number, y: number): void {
  const f1 = world.rawFlags1![idx], f2 = world.rawFlags2![idx], f3 = world.rawFlags3![idx];
  // A tile can be present but actuated off (IsActive cleared) — flags3 0x08
  // records that case so the tile's type isn't lost just because it's intangible.
  const hasTile = (f1 & 0x01) !== 0 || (f3 & 0x08) !== 0;
  tile.x = x;
  tile.y = y;
  tile.IsActive =           hasTile ? (f1 & 0x01) !== 0 : undefined;
  tile.Type =               hasTile ? world.rawTypes![idx] : undefined;
  tile.TextureU =           world.rawTextureU![idx];
  tile.TextureV =           world.rawTextureV![idx];
  tile.tileColor =          world.rawTileColors![idx] || undefined;
  tile.WallType =           world.rawWallTypes![idx] || undefined;
  tile.IsWallPresent =      (f1 & 0x02) ? true : undefined;
  tile.WallColor =          world.rawWallColors![idx] || undefined;
  tile.IsWallColorPresent = (f1 & 0x04) ? true : undefined;
  tile.IsLiquidPresent =    (f1 & 0x08) ? true : undefined;
  tile.LiquidAmount =       world.rawLiquidAmounts![idx] || undefined;
  tile.IsLiquidLava =       (f1 & 0x10) ? true : undefined;
  tile.IsLiquidHoney =      (f1 & 0x20) ? true : undefined;
  tile.Shimmer =            (f1 & 0x40) ? true : undefined;
  tile.IsActuatorPresent =  (f1 & 0x80) ? true : undefined;
  tile.slope =              (f2 & 0x07) || undefined;
  tile.IsRedWirePresent =   (f2 & 0x08) ? true : undefined;
  tile.IsGreenWirePresent = (f2 & 0x10) ? true : undefined;
  tile.IsBlueWirePresent =  (f2 & 0x20) ? true : undefined;
  tile.IsYellowWirePresent =(f2 & 0x40) ? true : undefined;
  tile.echoBlock =          (f2 & 0x80) ? true : undefined;
  tile.echoWall =           (f3 & 0x01) ? true : undefined;
  tile.illuminantBlock =    (f3 & 0x02) ? true : undefined;
  tile.illuminantWall =     (f3 & 0x04) ? true : undefined;
}

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

  if (!world.rawFlags1) return null;

  const idx = x * world.height + y;
  if (idx < 0 || idx >= world.width * world.height) return null;

  const tile: WorldTile = {};
  fillTileFromRaw(tile, world, idx, x, y);
  tile.info = getTileInfo(tile);
  tile.chest = world.chestByIdx?.get(idx);
  tile.sign = world.signByIdx?.get(idx);
  tile.tileEntity = world.entityByIdx?.get(idx);
  return tile;
}

export const itemsById = new Map(items.map(it => [it.id, it]));

/** The item's name without prefix or count, or undefined for an unknown item ID. */
export function getItemName(id: number, names: BlockNames = englishBlockNames): string | undefined {
  const itemSettings = itemsById.get(id);
  return itemSettings && names.item(id, itemSettings.name);
}

/** The item's name with its prefix and count, as the game shows it, e.g. "Legendary Terra Blade" or "Torch (20)". */
export function getItemText(item: WorldItem, names: BlockNames = englishBlockNames): string {
  const englishName = itemsById.get(item.id)?.name ?? String(item.id);
  const name = item.prefixId > 0 && item.prefixId < itemPrefixes.length
    ? names.prefixedItem(item.id, englishName, item.prefixId, itemPrefixes[item.prefixId].name)
    : names.item(item.id, englishName);
  return item.count !== 1 ? `${name} (${item.count})` : name;
}
