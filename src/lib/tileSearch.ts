import { tiles } from '../tiles';
import type { TileFrame, TileInfo, ItemInfo, WallInfo, WorldTile } from '../types/settings';

export type SearchableInfo = TileFrame | TileInfo | ItemInfo | WallInfo;

export function isTileMatch(tile: WorldTile, selectedInfos: SearchableInfo[]): boolean {
  if (!tile) return false;
  for (let j = 0; j < selectedInfos.length; j++) {
    const info = selectedInfos[j];

    if (tile.info && 'isTile' in info && info.isTile && (tile.info == info || (!('parent' in info) && 'Id' in info && tile.Type == Number(info.Id))))
      return true;

    if ('isWall' in info && info.isWall && tile.WallType == Number(info.Id))
      return true;

    const chest = tile.chest;
    if (chest && 'isItem' in info && info.isItem) {
      for (let i = 0; i < chest.items.length; i++) {
        const item = chest.items[i];
        if (Number(info.Id) == item.id) {
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
          if (Number(info.Id) == tileEntity.item?.id) {
            return true;
          }
          break;
        case 3: // mannequin
        case 5: // hat rack
          if (tileEntity.items && tileEntity.dyes) {
            for (let i = 0; i < tileEntity.items.length; i++) {
              if (Number(info.Id) == tileEntity.items[i].id) {
                return true;
              }
              if (Number(info.Id) == tileEntity.dyes[i].id) {
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
    return tile.TextureU === (info.U ?? 0) && tile.TextureV === (info.V ?? 0);
  }
  return (tile.TextureU ?? 0) <= 0 && (tile.TextureV ?? 0) <= 0;
}

export function getTileInfoFrom(id: string, u: string | undefined, v: string | undefined): TileFrame | TileInfo | undefined {
  const tileInfo = tiles[Number(id)];

  if (tileInfo && tileInfo.Frames) {
    for (let frameIndex = 0; frameIndex < tileInfo.Frames.length; frameIndex++) {
      const frame = tileInfo.Frames[frameIndex];

      if (u != frame.U)
        continue;

      if (v != frame.V)
        continue;

      frame.parent = tileInfo;

      return frame;
    }
  }

  return tileInfo;
}
