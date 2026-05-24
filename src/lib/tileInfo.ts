import { settings } from '../settings';

export function getTileInfo(tile: any): any {
  const tileInfo = settings.Tiles[tile.Type];

  if (!tileInfo) return tileInfo;

  if (!tileInfo.Frames)
    return tileInfo;

  let matchingFrame: any;

  for (let i = 0; i < tileInfo.Frames.length; i++) {
    const frame = tileInfo.Frames[i];

    if ((!frame.U && !tile.TextureU) || (frame.U ?? 0) <= tile.TextureU) {
      if ((!frame.V && !tile.TextureV) || (frame.V ?? 0) <= tile.TextureV)
        matchingFrame = frame;
    }
  }

  if (!matchingFrame)
    return tileInfo;

  matchingFrame.parent = tileInfo;

  return matchingFrame;
}

export function getTileAt(world: any, x: number, y: number): any {
  if (!world) return null;

  const index = x * world.height + y;
  if (index >= 0 && index < world.tiles.length) {
    return world.tiles[index];
  }

  return null;
}

export function getItemText(item: any): string {
  let prefix = "";

  if (item.prefixId > 0 && item.prefixId < settings.ItemPrefix.length)
    prefix = settings.ItemPrefix[item.prefixId].Name;

  let itemName = item.id;
  for (let itemIndex = 0; itemIndex < settings.Items.length; itemIndex++) {
    const itemSettings = settings.Items[itemIndex];
    if (Number(itemSettings.Id) === item.id) {
      itemName = itemSettings.Name;
      break;
    }
  }
  return `${prefix} ${itemName} (${item.count})`;
}

export function getTileText(tile: any): string {
  let text = "Nothing";

  if (!tile) {
    return text;
  }

  const tileInfo = tile.info;

  if (tileInfo) {
    if (!tileInfo.parent || !tileInfo.parent.Name) {
      text = tileInfo.Name;
    }
    else if (tileInfo.parent && tileInfo.parent.Name) {
      text = tileInfo.parent.Name;

      if (tileInfo.Name) {
        text = `${text} - ${tileInfo.Name}`;

        if (tileInfo.Variety)
          text = `${text} - ${tileInfo.Variety}`;
      }
      else if (tileInfo.Variety) {
        text = `${text} - ${tileInfo.Variety}`;
      }
    }

    if (tile.TextureU > 0 && tile.TextureV > 0)
      text = `${text} (${tile.Type}, ${tile.TextureU}, ${tile.TextureV})`;
    else if (tile.TextureU > 0)
      text = `${text} (${tile.Type}, ${tile.TextureU})`;
    else
      text = `${text} (${tile.Type})`;

    if (tile.tileEntity) {
      const tileEntity = tile.tileEntity;
      switch (tileEntity.type) {
        case 1: // item frame
        case 4: // weapon rack
        case 6: // plate
          const item = tileEntity.item;
          const itemText = getItemText(item);
          text = `${text} - ${itemText}`;
          break;
        case 2: // logic sensor
          const checkType = tile.info.CheckTypes[tileEntity.logicCheckType];
          const on = tileEntity.on ? "On" : "Off";
          text = `${text} - ${checkType}, ${on}`;
          break;
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

  if (tile.IsLiquidPresent) {
    if (text === "Nothing") text = "";

    if (tile.IsLiquidLava) {
      text += text ? " Lava" : "Lava";
    }
    else if (tile.IsLiquidHoney) {
      text += text ? " Honey" : "Honey";
    }
    else if (tile.Shimmer) {
      text += text ? " Shimmer" : "Shimmer";
    }
    else {
      text += text ? " Water" : "Water";
    }
  }

  if (tile.IsRedWirePresent)
    text += " (Red Wire)";

  if (tile.IsGreenWirePresent)
    text += " (Green Wire)";

  if (tile.IsBlueWirePresent)
    text += " (Blue Wire)";

  if (tile.IsYellowWirePresent)
    text += " (Yellow Wire)";

  return text;
}
