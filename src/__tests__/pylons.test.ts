import { describe, expect, it } from 'vitest';
import { findPylons, PYLON_COLORS, PYLON_TILE_TYPE, pylonName } from '../lib/pylons';
import type { PlayerMap } from '../lib/readPlayerMap';
import { tiles } from '../tiles';
import type { WorldData } from '../types/settings';

const WIDTH = 20;
const HEIGHT = 10;

/** A world with a 3x4 pylon of the given kind at each (x, y), framed like the game does. */
function makeWorld(pylons: { x: number; y: number; kind: number }[]): WorldData {
  const n = WIDTH * HEIGHT;
  const rawTextureU = new Int16Array(n);
  const rawTextureV = new Int16Array(n);
  const indices: number[] = [];
  for (const { x, y, kind } of pylons) {
    for (let dx = 0; dx < 3; dx++) {
      for (let dy = 0; dy < 4; dy++) {
        const idx = (x + dx) * HEIGHT + y + dy;
        rawTextureU[idx] = kind * 54 + dx * 18;
        rawTextureV[idx] = dy * 18;
        indices.push(idx);
      }
    }
  }
  return {
    width: WIDTH,
    height: HEIGHT,
    rawTextureU,
    rawTextureV,
    tileTypeIdx: new Map([[PYLON_TILE_TYPE, new Uint32Array(indices.sort((a, b) => a - b))]]),
  } as unknown as WorldData;
}

describe('findPylons', () => {
  it('finds each pylon once, at its top-left tile, with its kind', () => {
    const world = makeWorld([{ x: 2, y: 1, kind: 0 }, { x: 10, y: 5, kind: 9 }]);
    expect(findPylons(world)).toEqual([
      { x: 2, y: 1, kind: 0 },
      { x: 10, y: 5, kind: 9 },
    ]);
  });

  it('returns nothing for a world without pylons or tile data', () => {
    expect(findPylons(makeWorld([]))).toEqual([]);
    expect(findPylons({ width: WIDTH, height: HEIGHT } as unknown as WorldData)).toEqual([]);
  });

  it('skips pylons on unexplored tiles when there is a player map', () => {
    const world = makeWorld([{ x: 2, y: 1, kind: 0 }, { x: 10, y: 5, kind: 3 }]);
    const explored = new Uint8Array(WIDTH * HEIGHT);
    explored[10 * HEIGHT + 5] = 1;
    const playerMap: PlayerMap = { width: WIDTH, height: HEIGHT, explored, count: 1, total: WIDTH * HEIGHT, percent: 0 };
    expect(findPylons(world, playerMap)).toEqual([{ x: 10, y: 5, kind: 3 }]);
  });

  it('names each kind of pylon', () => {
    expect(pylonName(0)).toBe('Forest Pylon');
    expect(pylonName(10)).toBe('Aether Pylon');
    expect(pylonName(99)).toBe('Pylon');
  });

  it('has a marker color for every kind of pylon', () => {
    const pylonTile = tiles.find((t) => t.id === PYLON_TILE_TYPE);
    expect(pylonTile?.frames?.length).toBe(PYLON_COLORS.length);
    pylonTile?.frames?.forEach((frame, i) => expect(frame.u).toBe(i * 54));
  });
});
