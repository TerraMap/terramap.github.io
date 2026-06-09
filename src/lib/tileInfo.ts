import { itemPrefixes } from '../itemPrefixes';
import { items } from '../items';
import { tiles } from '../tiles';
import type { TileFrame, TileInfo, WorldData, WorldItem, WorldTile } from '../types/settings';

export function fillTileFromRaw(tile: WorldTile, world: WorldData, idx: number, x: number, y: number): void {
  const f1 = world.rawFlags1![idx], f2 = world.rawFlags2![idx], f3 = world.rawFlags3![idx];
  tile.x = x;
  tile.y = y;
  tile.IsActive =           (f1 & 0x01) ? true : undefined;
  tile.Type =               (f1 & 0x01) ? world.rawTypes![idx] : undefined;
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

  const idx = x * world.height + y;
  if (idx < 0 || idx >= world.width * world.height) return null;

  if (world.rawFlags1) {
    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, x, y);
    tile.info = getTileInfo(tile);
    tile.chest = world.chestByIdx?.get(idx);
    tile.sign = world.signByIdx?.get(idx);
    tile.tileEntity = world.entityByIdx?.get(idx);
    return tile;
  }

  if (idx < world.tiles.length) {
    return world.tiles[idx] ?? null;
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
