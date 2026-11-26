import { tileColors } from '../MapHelper';
import { tiles } from '../tiles';
import type { WorldData } from '../types/settings';
import type { PlayerMap } from './readPlayerMap';

export const PYLON_TILE_TYPE = 597;

// Pylons are 3x4 tiles; each kind's frame is 54 px (3 tiles x 18 px) wide in
// the tile sheet, in the order listed in tiles.ts.
const PYLON_FRAME_WIDTH = 54;

/**
 * A marker color for each kind of pylon, by frame index (see tiles.ts): the
 * same colors the map draws pylon tiles in.
 */
export const PYLON_COLORS = tileColors[PYLON_TILE_TYPE]
  .filter(Boolean)
  .map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

const PYLON_NAMES = tiles.find((t) => t.id === PYLON_TILE_TYPE)?.frames?.map((f) => f.name) ?? [];

/** The English name of a kind of pylon, e.g. "Forest Pylon" (translate with BlockNames.tile). */
export function pylonName(kind: number): string {
  return PYLON_NAMES[kind] ?? 'Pylon';
}

export interface Pylon {
  /** The pylon's top-left tile. */
  x: number;
  y: number;
  /** Which kind of pylon, as an index into tiles.ts' Pylons frames and PYLON_COLORS. */
  kind: number;
}

/**
 * The pylons in a world, found from their top-left tiles. With a player map,
 * only pylons on explored tiles are included, so the overlay doesn't spoil
 * unexplored areas.
 */
export function findPylons(world: WorldData, playerMap?: PlayerMap | null): Pylon[] {
  const indices = world.tileTypeIdx?.get(PYLON_TILE_TYPE);
  const u = world.rawTextureU;
  const v = world.rawTextureV;
  if (!indices || !u || !v) return [];

  const pylons: Pylon[] = [];
  for (const idx of indices) {
    if (v[idx] !== 0 || u[idx] % PYLON_FRAME_WIDTH !== 0) continue;
    if (playerMap && !playerMap.explored[idx]) continue;
    pylons.push({
      x: Math.floor(idx / world.height),
      y: idx % world.height,
      kind: u[idx] / PYLON_FRAME_WIDTH,
    });
  }
  return pylons;
}
