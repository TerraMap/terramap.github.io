import { describe, expect, it } from 'vitest';
import { getTileColorRaw } from '../lib/mapRenderer';
import { getTileMapColor } from '../lib/tileMapColor';
import { tileColors } from '../MapHelper';
import type { WorldData } from '../types/settings';

const WIDTH = 1000; // wide enough to have a middle away from the beaches (380 tiles)
const HEIGHT = 40;

function makeWorld(): WorldData {
  const n = WIDTH * HEIGHT;
  return {
    width: WIDTH,
    height: HEIGHT,
    worldSurfaceY: 10,
    rockLayerY: 20,
    hellLayerY: 35,
    remixWorld: 0,
    version: 279,
    rawTypes: new Uint16Array(n),
    rawWallTypes: new Uint16Array(n),
    rawTextureU: new Int16Array(n),
    rawTextureV: new Int16Array(n),
    rawTileColors: new Uint8Array(n),
    rawWallColors: new Uint8Array(n),
    rawLiquidAmounts: new Uint8Array(n),
    rawFlags1: new Uint8Array(n),
    rawFlags2: new Uint8Array(n),
    rawFlags3: new Uint8Array(n),
  } as unknown as WorldData;
}

/** Places an active tile and returns its index. */
function place(world: WorldData, x: number, y: number, type: number, u = 0, v = 0): number {
  const idx = x * HEIGHT + y;
  world.rawTypes![idx] = type;
  world.rawTextureU![idx] = u;
  world.rawTextureV![idx] = v;
  world.rawFlags1![idx] |= 0x01;
  return idx;
}

const colorAt = (world: WorldData, x: number, y: number) => getTileMapColor(world, x * HEIGHT + y, y);

describe('getTileMapColor', () => {
  it('picks options from the frame', () => {
    const world = makeWorld();
    place(world, 500, 5, 21, 36 * 3);  // a chest style with option 2
    place(world, 500, 6, 28, 0, 260);  // a pot with option 2
    place(world, 500, 7, 82, 18 * 4);  // the fifth herb
    place(world, 500, 8, 597, 54 * 7); // a mushroom pylon
    expect(colorAt(world, 500, 5)).toEqual(tileColors[21][2]);
    expect(colorAt(world, 500, 6)).toEqual(tileColors[28][2]);
    expect(colorAt(world, 500, 7)).toEqual(tileColors[82][4]);
    expect(colorAt(world, 500, 8)).toEqual(tileColors[597][7]);
  });

  it('picks options from the position', () => {
    const world = makeWorld();
    place(world, 500, 4, 149);
    place(world, 500, 5, 160);
    expect(colorAt(world, 500, 4)).toEqual(tileColors[149][4 % 3]);
    expect(colorAt(world, 500, 5)).toEqual(tileColors[160][(500 + 5) % 9]);
  });

  it('draws lava moss with the colors of tile 627', () => {
    const world = makeWorld();
    place(world, 500, 5, 184, 22 * 10);
    expect(colorAt(world, 500, 5)).toEqual(tileColors[627][(500 + 5) % 9]);
  });

  it('shows what is behind every other cobweb tile and one platform frame', () => {
    const world = makeWorld();
    place(world, 500, 4, 51); // (500 + 4) is even: not drawn
    place(world, 500, 5, 51);
    place(world, 500, 6, 19, 0, 864);
    expect(colorAt(world, 500, 4)).toBeUndefined();
    expect(colorAt(world, 500, 5)).toEqual(tileColors[51][0]);
    expect(colorAt(world, 500, 6)).toBeUndefined();
  });

  it('falls back to the first color for an option the type does not have', () => {
    const world = makeWorld();
    place(world, 500, 5, 597, 54 * 20);
    expect(colorAt(world, 500, 5)).toEqual(tileColors[597][0]);
  });

  it('colors trees growing from mushroom grass as mushroom trees', () => {
    const world = makeWorld();
    for (const [x, ground] of [[100, 2], [200, 70]]) {
      for (let y = 10; y < 20; y++) place(world, x, y, 5);
      place(world, x, 20, ground);
    }
    expect(colorAt(world, 100, 12)).toEqual(tileColors[5][0]);
    expect(colorAt(world, 200, 12)).toEqual(tileColors[5][1]);
    expect(tileColors[5][1]).not.toEqual(tileColors[5][0]);
  });

  it('colors cactus by the sand it grows from', () => {
    const world = makeWorld();
    const sands = [[100, 53, 0], [200, 112, 1], [300, 116, 2], [400, 234, 3]];
    for (const [x, sand] of sands) {
      for (let y = 15; y < 20; y++) place(world, x, y, 80);
      place(world, x, 20, sand);
    }
    for (const [x, , option] of sands) {
      expect(colorAt(world, x, 16)).toEqual(tileColors[80][option]);
    }
  });

  it('colors sea oats by the biome of the ground, or the beach', () => {
    const world = makeWorld();
    for (const [x, ground] of [[10, 53], [500, 53], [510, 116], [520, 234], [530, 112]]) {
      place(world, x, 19, 529);
      place(world, x, 20, ground);
    }
    expect(colorAt(world, 10, 19)).toEqual(tileColors[529][1]);  // beach
    expect(colorAt(world, 500, 19)).toEqual(tileColors[529][0]); // inland
    expect(colorAt(world, 510, 19)).toEqual(tileColors[529][2]); // hallow
    expect(colorAt(world, 520, 19)).toEqual(tileColors[529][3]); // crimson
    expect(colorAt(world, 530, 19)).toEqual(tileColors[529][4]); // corruption
  });

  it('colors oasis plants by the biome of the ground under them', () => {
    const world = makeWorld();
    // A 3x2 plant's top-left tile; the ground row is 2 below it.
    place(world, 500, 18, 530);
    for (let x = 500; x <= 503; x++) place(world, x, 20, 116);
    expect(colorAt(world, 500, 18)).toEqual(tileColors[530][1]);
  });
});

describe('getTileColorRaw paint', () => {
  it('does not paint rainbow brick', () => {
    const world = makeWorld();
    const idx = place(world, 500, 5, 160);
    world.rawTileColors![idx] = 1; // red paint
    expect(getTileColorRaw(5, idx, world)).toEqual(tileColors[160][(500 + 5) % 9]);
  });
});
