import { settings } from '../settings';
import type { TileFrame, TileInfo, WorldData, WorldItem, WorldTile } from '../types/settings';

export function getTileInfo(tile: WorldTile): TileFrame | TileInfo | undefined {
  const tileInfo = settings.Tiles[tile.Type!];

  if (!tileInfo) return tileInfo;

  if (!tileInfo.Frames)
    return tileInfo;

  let matchingFrame: TileFrame | undefined;

  for (let i = 0; i < tileInfo.Frames.length; i++) {
    const frame = tileInfo.Frames[i];

    if ((!frame.U && !tile.TextureU) || (frame.U ?? 0) <= (tile.TextureU ?? 0)) {
      if ((!frame.V && !tile.TextureV) || (frame.V ?? 0) <= (tile.TextureV ?? 0))
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

  if (item.prefixId > 0 && item.prefixId < settings.ItemPrefix.length)
    prefix = settings.ItemPrefix[item.prefixId].Name;

  let itemName: string | number = item.id;
  for (let itemIndex = 0; itemIndex < settings.Items.length; itemIndex++) {
    const itemSettings = settings.Items[itemIndex];
    if (Number(itemSettings.Id) === item.id) {
      itemName = itemSettings.Name;
      break;
    }
  }
  return `${prefix} ${itemName} (${item.count})`;
}

export function getTileText(tile: WorldTile | null): string {
  let text = "Nothing";

  if (!tile) {
    return text;
  }

  const tileInfo = tile.info;

  if (tileInfo) {
    const parent = 'parent' in tileInfo ? (tileInfo as TileFrame).parent : undefined;
    const variety = 'Variety' in tileInfo ? tileInfo.Variety : undefined;

    if (!parent || !parent.Name) {
      text = tileInfo.Name ?? text;
    }
    else {
      text = parent.Size
        ? `${tileInfo.Name ?? parent.Name} ${parent.Size.replace(',', 'x')}`
        : parent.Name;

      if (tileInfo.Name) {
        // text = `${text} - ${tileInfo.Name}`;

        if (variety)
          text = `${variety} - ${text}`;
      }
      else if (variety) {
        text = `${text} - ${variety}`;
      }
    }

    const u = tile.TextureU ?? 0;
    const v = tile.TextureV ?? 0;
    if (u > 0 || v > 0)
      text = `${text} (${tile.Type}, ${u}, ${v})`;
    else
      text = `${text} (${tile.Type})`;

    if (tile.tileEntity) {
      const tileEntity = tile.tileEntity;
      switch (tileEntity.type) {
        case 1: // item frame
        case 4: // weapon rack
        case 6: // plate
          {
            if (tileEntity.item) {
              const itemText = getItemText(tileEntity.item);
              text = `${text} - ${itemText}`;
            }
            break;
          }
        case 2: // logic sensor
          {
            const checkTypes = 'CheckTypes' in tileInfo ? tileInfo.CheckTypes : undefined;
            const checkType = checkTypes?.[tileEntity.logicCheckType!];
            const on = tileEntity.on ? "On" : "Off";
            text = `${text} - ${checkType}, ${on}`;
            break;
          }
      }
    }
  }
  else if (tile.WallType || tile.WallType === 0) {
    if (tile.WallType < settings.Walls.length) {
      text = `${settings.Walls[tile.WallType].Name} (${tile.WallType})`;
    }
    else {
      text = `Unknown Wall (${tile.WallType})`;
    }
  }

  const extra: string[] = [];

  if (tile.IsLiquidPresent) {
    if (text === "Nothing") text = "";

    if (tile.IsLiquidLava) {
      extra.push('Lava');
    }
    else if (tile.IsLiquidHoney) {
      extra.push("Honey");
    }
    else if (tile.Shimmer) {
      extra.push("Shimmer");
    }
    else {
      extra.push("Water");
    }
  }

  if (tile.IsRedWirePresent)
    extra.push("Red Wire");

  if (tile.IsGreenWirePresent)
    extra.push("Green Wire");

  if (tile.IsBlueWirePresent)
    extra.push("Blue Wire");

  if (tile.IsYellowWirePresent)
    extra.push("Yellow Wire");

  if (extra.length) {
    text = `${text} (${extra.join(', ')})`;
  }

  return text;
}
