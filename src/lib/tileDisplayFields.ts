import { settings } from '../settings';
import type { TileFrame, WorldTile } from '../types/settings';
import { paintNames } from './paintColors';
import { slopeLabels } from './slopeLabels';

export interface TileDisplayField {
  label: string;
  value: string;
}

export function getTileDisplayFields(tile: WorldTile): TileDisplayField[] {
  const parent = tile.info && 'parent' in tile.info ? (tile.info as TileFrame).parent : undefined;
  const fields: TileDisplayField[] = [];

  fields.push({ label: 'Location', value: `${tile.x}, ${tile.y}` });

  if (tile.info?.Name) {
    fields.push({ label: 'Tile', value: tile.info.Name });
  }

  if (typeof tile.info?.Variety === 'string') {
    fields.push({ label: 'Variety', value: tile.info.Variety });
  }

  if (parent?.Size) {
    fields.push({ label: 'Size', value: parent.Size.replace(',', ' x ') });
  }

  if (tile.Type) {
    fields.push({ label: 'Type', value: String(tile.Type) });
  }

  if (tile.WallType) {
    const wallName = settings.Walls[tile.WallType]?.Name;
    fields.push({ label: 'Wall', value: wallName ? `${wallName} (${tile.WallType})` : String(tile.WallType) });
  }

  if ((tile.TextureU ?? -1) > -1 || (tile.TextureV ?? -1) > -1) {
    fields.push({ label: 'UV', value: `${tile.TextureU}, ${tile.TextureV}` });
  }

  if (parent) {
    fields.push({ label: 'Parent', value: parent.Name ?? '' });
  }

  if (tile.slope) {
    fields.push({ label: 'Slope', value: slopeLabels[tile.slope] ?? String(tile.slope) });
  }

  if (tile.tileColor) {
    fields.push({ label: 'Paint (Block)', value: paintNames[tile.tileColor] ?? String(tile.tileColor) });
  }

  if (tile.WallColor) {
    fields.push({ label: 'Paint (Wall)', value: paintNames[tile.WallColor] ?? String(tile.WallColor) });
  }

  if (tile.echoBlock) fields.push({ label: 'Echo', value: 'Block' });
  if (tile.echoWall) fields.push({ label: 'Echo', value: 'Wall' });
  if (tile.illuminantBlock) fields.push({ label: 'Illuminant', value: 'Block' });
  if (tile.illuminantWall) fields.push({ label: 'Illuminant', value: 'Wall' });

  const wires: string[] = [];
  if (tile.IsRedWirePresent) wires.push('Red');
  if (tile.IsGreenWirePresent) wires.push('Green');
  if (tile.IsBlueWirePresent) wires.push('Blue');
  if (tile.IsYellowWirePresent) wires.push('Yellow');
  if (wires.length) {
    fields.push({ label: 'Wires', value: wires.join(' ') });
  }

  if (tile.IsActuatorPresent) {
    fields.push({ label: 'Actuator', value: tile.IsActive === false ? 'Actuated' : 'Present' });
  } else if (tile.IsActive === false) {
    fields.push({ label: 'Actuated', value: 'No Actuator' });
  }

  if (tile.IsLiquidPresent) {
    const type = tile.IsLiquidHoney ? 'Honey'
      : tile.IsLiquidLava ? 'Lava'
        : tile.Shimmer ? 'Shimmer'
          : 'Water';
    const amount = tile.LiquidAmount ? ` (${tile.LiquidAmount})` : '';
    fields.push({ label: 'Liquid', value: `${type}${amount}` });
  }

  if (tile.sign?.text) {
    fields.push({ label: 'Sign', value: tile.sign.text });
  }

  if (tile.chest?.name) {
    fields.push({ label: 'Chest', value: tile.chest.name });
  }

  return fields;
}
