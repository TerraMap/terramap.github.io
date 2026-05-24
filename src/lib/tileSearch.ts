import { settings } from '../settings';

export function isTileMatch(tile: any, selectedInfos: any[]): boolean {
  for (let j = 0; j < selectedInfos.length; j++) {
    const info = selectedInfos[j];

    if (tile.info && info.isTile && (tile.info == info || (!info.parent && tile.Type == info.Id)))
      return true;

    if (info.isWall && tile.WallType == info.Id)
      return true;

    const chest = tile.chest;
    if (chest && info.isItem) {
      for (let i = 0; i < chest.items.length; i++) {
        const item = chest.items[i];
        if (info.Id == item.id) {
          return true;
        }
      }
    }

    const tileEntity = tile.tileEntity;
    if (tileEntity && info.isItem) {
      switch (tileEntity.type) {
        case 1: // item frame
        case 4: // weapon rack
        case 6: // plate
          if (info.Id == tileEntity.item.id) {
            return true;
          }
          break;
        case 3: // mannequin
        case 5: // hat rack
          for (let i = 0; i < tileEntity.items.length; i++) {
            if (info.Id == tileEntity.items[i].id) {
              return true;
            }
            if (info.Id == tileEntity.dyes[i].id) {
              return true;
            }
          }
          break;
      }
    }
  }

  return false;
}

export function getTileInfoFrom(id: any, u: any, v: any): any {
  const tileInfo = settings.Tiles[id];

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
