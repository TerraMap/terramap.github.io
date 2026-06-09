import { describe, expect, it } from 'vitest';
import { getTileColorRaw } from '../lib/mapRenderer';
import type { WorldData } from '../types/settings';

function makeWorld(overrides: Partial<WorldData> = {}): WorldData {
  const width = 10;
  const height = 10;
  const n = width * height;
  return {
    width,
    height,
    worldSurfaceY: 5,
    rockLayerY: 7,
    hellLayerY: 9,
    name: 'Test',
    version: 279,
    remixWorld: 0,
    chests: [],
    signs: [],
    npcs: [],
    tileEntities: new Map(),
    rawTypes:         new Uint16Array(n),
    rawWallTypes:     new Uint16Array(n),
    rawTextureU:      new Int16Array(n),
    rawTextureV:      new Int16Array(n),
    rawTileColors:    new Uint8Array(n),
    rawWallColors:    new Uint8Array(n),
    rawLiquidAmounts: new Uint8Array(n),
    rawFlags1:        new Uint8Array(n),
    rawFlags2:        new Uint8Array(n),
    rawFlags3:        new Uint8Array(n),
    ...overrides,
  };
}

describe('getTileColorRaw', () => {
  it('returns a layer background color when tile has no block, wall, or liquid', () => {
    const world = makeWorld();
    const idx = 0;
    // all flags zero: empty tile above surface → sky color
    const color = getTileColorRaw(0, idx, world);
    expect(color).toBeDefined();
    expect(color.r).toBeGreaterThanOrEqual(0);
    expect(color.g).toBeGreaterThanOrEqual(0);
    expect(color.b).toBeGreaterThanOrEqual(0);
  });

  it('returns a non-zero color for an active tile with a known type', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags1![idx] = 0x01; // IsActive
    world.rawTypes![idx] = 1;     // dirt — has a known tileColor entry

    const color = getTileColorRaw(6, idx, world); // y=6 (cavern layer)
    // Dirt should produce a non-black color
    const nonZero = color.r > 0 || color.g > 0 || color.b > 0;
    expect(nonZero).toBe(true);
  });

  it('returns lava color for lava tiles', () => {
    const world = makeWorld();
    const idx = 5;
    world.rawFlags1![idx] = 0x08 | 0x10; // IsLiquidPresent + IsLiquidLava

    const lava = getTileColorRaw(6, idx, world);
    // Lava is orange-red: high R, moderate G, low B
    expect(lava.r).toBeGreaterThan(lava.b);
  });

  it('returns water color for water tiles', () => {
    const world = makeWorld();
    const idx = 5;
    world.rawFlags1![idx] = 0x08; // IsLiquidPresent only (water)

    const water = getTileColorRaw(6, idx, world);
    expect(water).toBeDefined();
  });

  it('returns a blended echo-block color (dimmed into background)', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags1![idx] = 0x01;  // IsActive
    world.rawTypes![idx] = 1;      // dirt
    world.rawFlags2![idx] = 0x80;  // echoBlock

    const echoed = getTileColorRaw(6, idx, world);
    const normal = (() => {
      world.rawFlags2![idx] = 0x00;
      const c = getTileColorRaw(6, idx, world);
      world.rawFlags2![idx] = 0x80;
      return c;
    })();

    // Echo-coated block blends with background so colors differ
    const differs = echoed.r !== normal.r || echoed.g !== normal.g || echoed.b !== normal.b;
    expect(differs).toBe(true);
  });

  it('returns underground layer color for empty tile below surface', () => {
    const world = makeWorld();
    const idx = 0;
    // y = 6 is in cavern layer (rockLayerY=7 so 5<y<7 → underground)
    const underground = getTileColorRaw(6, idx, world);
    // y = 8 is in cavern (rockLayerY <= y < hellLayerY)
    const cavern = getTileColorRaw(8, idx, world);
    // different depths → different background shades
    expect(underground.r !== cavern.r || underground.g !== cavern.g || underground.b !== cavern.b).toBe(true);
  });
});
