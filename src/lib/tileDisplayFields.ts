import type { TFunction } from 'i18next';
import type { TileFrame, WorldData, WorldTile } from '../types/settings';
import { walls } from '../walls';
import { paintNames } from './paintColors';
import { slopeLabels } from './slopeLabels';

export interface TileDisplayField {
  id?: string;
  label: string;
  value: string;
}

// Only the handful of scalar fields getPositionText needs -- deliberately not
// WorldData itself, which also carries several multi-megabyte raw TypedArrays
// that shouldn't be handed to UI components that don't render tiles directly.
export type WorldPosition = Pick<WorldData, 'width' | 'worldSurfaceY' | 'rockLayerY' | 'hellLayerY'>;

export function toWorldPosition(world: WorldData): WorldPosition {
  return { width: world.width, worldSurfaceY: world.worldSurfaceY, rockLayerY: world.rockLayerY, hellLayerY: world.hellLayerY };
}

// 1 tile = 2 ft, matching Terraria's Compass/Depth Meter/GPS accessories.
const FEET_PER_TILE = 2;

// Terraria has no stored boundary between the Space and Surface layers; this
// mirrors the ~0.35 * worldSurfaceY split the game itself uses for that transition.
const SPACE_SURFACE_RATIO = 0.35;

function getPositionText(tile: WorldTile, world: WorldPosition, t: TFunction): string {
  const x = tile.x ?? 0;
  const y = tile.y ?? 0;

  const centerX = world.width / 2;
  const horizontalFeet = Math.round(Math.abs(x - centerX) * FEET_PER_TILE);
  const direction = x >= centerX ? t('tile_fields.values.east') : t('tile_fields.values.west');
  const horizontal = `${horizontalFeet} ${direction}`;

  const depthTiles = y - world.worldSurfaceY;
  const depthFeet = Math.round(Math.abs(depthTiles) * FEET_PER_TILE);
  let depth: string;
  if (depthFeet === 0) {
    depth = t('tile_fields.values.level');
  } else if (depthTiles < 0) {
    const layer = y < world.worldSurfaceY * SPACE_SURFACE_RATIO
      ? t('tile_fields.values.layer_space')
      : t('tile_fields.values.layer_surface');
    depth = `${depthFeet} ft ${layer}`;
  } else {
    const layer = y < world.rockLayerY ? t('tile_fields.values.layer_underground')
      : y < world.hellLayerY ? t('tile_fields.values.layer_cavern')
        : t('tile_fields.values.layer_underworld');
    depth = `${depthFeet} ft ${layer}`;
  }

  return `${horizontal}, ${depth}`;
}

export function getTileDisplayFields(tile: WorldTile, t: TFunction, world?: WorldPosition): TileDisplayField[] {
  const parent = tile.info && 'parent' in tile.info ? (tile.info as TileFrame).parent : undefined;
  const fields: TileDisplayField[] = [];

  const location = world ? getPositionText(tile, world, t) : `${tile.x}, ${tile.y}`;
  fields.push({ id: 'location', label: t('tile_fields.location'), value: location });

  if (tile.info?.name) {
    fields.push({ id: 'tile', label: t('tile_fields.tile'), value: tile.info.name });
  }

  if (typeof tile.info?.variety === 'string') {
    fields.push({ id: 'variety', label: t('tile_fields.variety'), value: tile.info.variety });
  }

  if (parent?.size) {
    fields.push({ id: 'size', label: t('tile_fields.size'), value: parent.size.replace(',', ' x ') });
  }

  if (tile.Type) {
    fields.push({ id: 'type', label: t('tile_fields.type'), value: String(tile.Type) });
  }

  if (tile.WallType) {
    const wallName = walls[tile.WallType]?.name;
    fields.push({ id: 'wall', label: t('tile_fields.wall'), value: wallName ? `${wallName} (${tile.WallType})` : String(tile.WallType) });
  }

  if ((tile.TextureU ?? -1) > -1 || (tile.TextureV ?? -1) > -1) {
    fields.push({ id: 'uv', label: t('tile_fields.uv'), value: `${tile.TextureU}, ${tile.TextureV}` });
  }

  if (parent) {
    fields.push({ id: 'parent', label: t('tile_fields.parent'), value: parent.name });
  }

  if (tile.slope) {
    const slopeKey = slopeLabels[tile.slope];
    fields.push({ id: 'slope', label: t('tile_fields.slope'), value: slopeKey ? t(slopeKey) : String(tile.slope) });
  }

  if (tile.tileColor) {
    fields.push({ id: 'paint_block', label: t('tile_fields.paint_block'), value: paintNames[tile.tileColor] ?? String(tile.tileColor) });
  }

  if (tile.WallColor) {
    fields.push({ id: 'paint_wall', label: t('tile_fields.paint_wall'), value: paintNames[tile.WallColor] ?? String(tile.WallColor) });
  }

  if (tile.echoBlock) fields.push({ id: 'echo', label: t('tile_fields.echo'), value: t('tile_fields.values.block') });
  if (tile.echoWall) fields.push({ id: 'echo', label: t('tile_fields.echo'), value: t('tile_fields.values.wall') });
  if (tile.illuminantBlock) fields.push({ id: 'illuminant', label: t('tile_fields.illuminant'), value: t('tile_fields.values.block') });
  if (tile.illuminantWall) fields.push({ id: 'illuminant', label: t('tile_fields.illuminant'), value: t('tile_fields.values.wall') });

  const wires: string[] = [];
  if (tile.IsRedWirePresent) wires.push(t('tile_fields.values.red'));
  if (tile.IsGreenWirePresent) wires.push(t('tile_fields.values.green'));
  if (tile.IsBlueWirePresent) wires.push(t('tile_fields.values.blue'));
  if (tile.IsYellowWirePresent) wires.push(t('tile_fields.values.yellow'));
  if (wires.length) {
    fields.push({ id: 'wires', label: t('tile_fields.wires'), value: wires.join(' ') });
  }

  if (tile.IsActuatorPresent) {
    fields.push({ id: 'actuator', label: t('tile_fields.actuator'), value: tile.IsActive === false ? t('tile_fields.values.actuated') : t('tile_fields.values.present') });
  } else if (tile.IsActive === false) {
    fields.push({ id: 'actuated', label: t('tile_fields.actuated'), value: t('tile_fields.values.no_actuator') });
  }

  if (tile.IsLiquidPresent) {
    const type = tile.IsLiquidHoney ? t('tile_fields.values.honey')
      : tile.IsLiquidLava ? t('tile_fields.values.lava')
        : tile.Shimmer ? t('tile_fields.values.shimmer')
          : t('tile_fields.values.water');
    const amount = tile.LiquidAmount ? ` (${tile.LiquidAmount})` : '';
    fields.push({ id: 'liquid', label: t('tile_fields.liquid'), value: `${type}${amount}` });
  }

  if (tile.sign?.text) {
    fields.push({ id: 'sign', label: t('tile_fields.sign'), value: tile.sign.text });
  }

  if (tile.chest?.name) {
    fields.push({ id: 'chest', label: t('tile_fields.chest'), value: tile.chest.name });
  }

  return fields;
}
