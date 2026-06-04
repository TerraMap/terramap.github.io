import { tiles } from '../tiles';
import type { ItemInfo, TileFrame, TileInfo, WallInfo, WorldTile } from '../types/settings';

export type SearchableInfo = TileFrame | TileInfo | ItemInfo | WallInfo;

export function isTileMatch(tile: WorldTile, selectedInfos: SearchableInfo[]): boolean {
  for (let j = 0; j < selectedInfos.length; j++) {
    const info = selectedInfos[j];

    if (tile.info && 'isTile' in info && info.isTile && (tile.info == info || (!('parent' in info) && 'id' in info && tile.Type == info.id)))
      return true;

    if ('isWall' in info && info.isWall && tile.WallType == info.id)
      return true;

    const chest = tile.chest;
    if (chest && 'isItem' in info && info.isItem) {
      for (let i = 0; i < chest.items.length; i++) {
        const item = chest.items[i];
        if (info.id == item.id) {
          return true;
        }
      }
    }

    const tileEntity = tile.tileEntity;
    if (tileEntity && 'isItem' in info && info.isItem) {
      switch (tileEntity.type) {
        case 1: // item frame
        case 4: // weapon rack
        case 6: // plate
          if (info.id == tileEntity.item?.id) {
            return true;
          }
          break;
        case 3: // mannequin
        case 5: // hat rack
          if (tileEntity.items && tileEntity.dyes) {
            for (let i = 0; i < tileEntity.items.length; i++) {
              if (info.id == tileEntity.items[i].id) {
                return true;
              }
              if (info.id == tileEntity.dyes[i].id) {
                return true;
              }
            }
          }
          break;
      }
    }
  }

  return false;
}

export function isTileOrigin(tile: WorldTile | null): boolean {
  if (!tile || !tile.info) return true;
  const info = tile.info;
  if ('parent' in info && info.parent) {
    return tile.TextureU === (info.u ?? 0) && tile.TextureV === (info.v ?? 0);
  }
  return (tile.TextureU ?? 0) <= 0 && (tile.TextureV ?? 0) <= 0;
}

export function getTileInfoFrom(id: string, u: string | undefined, v: string | undefined): TileFrame | TileInfo | undefined {
  const tileInfo = tiles.at(Number(id));

  if (tileInfo?.frames) {
    for (let frameIndex = 0; frameIndex < tileInfo.frames.length; frameIndex++) {
      const frame = tileInfo.frames[frameIndex];

      if (u != frame.u)
        continue;

      if (v != frame.v)
        continue;

      frame.parent = tileInfo;

      return frame;
    }
  }

  return tileInfo;
}
