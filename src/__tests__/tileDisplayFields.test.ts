import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import { getTileDisplayFields } from '../lib/tileDisplayFields';
import type { WorldData, WorldTile } from '../types/settings';

// Real English strings, so these tests double as a check that the keys exist.
const t = ((key: string) => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], en) as string) as unknown as Parameters<typeof getTileDisplayFields>[1];

function makeWorld(overrides: Partial<WorldData> = {}): WorldData {
  const width = 4;
  const height = 4;
  const n = width * height;
  return {
    width,
    height,
    worldSurfaceY: 1,
    rockLayerY: 2,
    hellLayerY: 3,
    name: 'Test',
    version: 279,
    remixWorld: 0,
    chests: [],
    signs: [],
    npcs: [],
    tileEntities: new Map(),
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
    chestByIdx: new Map(),
    signByIdx: new Map(),
    entityByIdx: new Map(),
    ...overrides,
  };
}

function location(tile: WorldTile, world?: WorldData): string {
  return getTileDisplayFields(tile, t, world).find((f) => f.id === 'location')!.value;
}

describe('getTileDisplayFields location field', () => {
  it('falls back to raw x, y when no world is given', () => {
    expect(location({ x: 10, y: 20 })).toBe('10, 20');
  });

  it('shows West of center and Underground below the surface', () => {
    const world = makeWorld({ width: 2000, worldSurfaceY: 400, rockLayerY: 800, hellLayerY: 1900 });
    // centerX = 1000; x=900 is 100 tiles = 200ft west of center.
    // y=500 is 100 tiles = 200ft below the surface, above the rock layer -> Underground.
    expect(location({ x: 900, y: 500 }, world)).toBe('200 West, 200 ft Underground');
  });

  it('shows East of center and Cavern between the rock and hell layers', () => {
    const world = makeWorld({ width: 2000, worldSurfaceY: 400, rockLayerY: 800, hellLayerY: 1900 });
    expect(location({ x: 1100, y: 1000 }, world)).toBe('200 East, 1200 ft Cavern');
  });

  it('shows Underworld at and below the hell layer', () => {
    const world = makeWorld({ width: 2000, worldSurfaceY: 400, rockLayerY: 800, hellLayerY: 1900 });
    expect(location({ x: 1000, y: 1950 }, world)).toBe('0 East, 3100 ft Underworld');
  });

  it('shows Level at the surface boundary', () => {
    const world = makeWorld({ width: 2000, worldSurfaceY: 400, rockLayerY: 800, hellLayerY: 1900 });
    expect(location({ x: 1000, y: 400 }, world)).toBe('0 East, Level');
  });

  it('shows Surface above the boundary but below the space cutoff', () => {
    const world = makeWorld({ width: 2000, worldSurfaceY: 400, rockLayerY: 800, hellLayerY: 1900 });
    // 0.35 * 400 = 140, so y=300 (> 140) is Surface, 100 tiles = 200ft above Level.
    expect(location({ x: 1000, y: 300 }, world)).toBe('0 East, 200 ft Surface');
  });

  it('shows Space above the space cutoff', () => {
    const world = makeWorld({ width: 2000, worldSurfaceY: 400, rockLayerY: 800, hellLayerY: 1900 });
    // 0.35 * 400 = 140, so y=100 (< 140) is Space.
    expect(location({ x: 1000, y: 100 }, world)).toBe('0 East, 600 ft Space');
  });
});
