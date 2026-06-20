import { describe, expect, it } from 'vitest';
import { fillTileFromRaw, getTileAt, getTileInfo } from '../lib/tileInfo';
import type { WorldData, WorldTile } from '../types/settings';

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
    chestByIdx: new Map(),
    signByIdx:  new Map(),
    entityByIdx: new Map(),
    ...overrides,
  };
}

describe('fillTileFromRaw', () => {
  it('sets IsActive and Type when flags1 bit 0 is set', () => {
    const world = makeWorld();
    const idx = 2;
    world.rawFlags1![idx] = 0x01;
    world.rawTypes![idx] = 42;

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 2);

    expect(tile.IsActive).toBe(true);
    expect(tile.Type).toBe(42);
  });

  it('leaves IsActive and Type undefined when tile is inactive', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags1![idx] = 0x00;

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 0);

    expect(tile.IsActive).toBeUndefined();
    expect(tile.Type).toBeUndefined();
  });

  it('keeps Type and sets IsActive=false for actuated tiles (flags3 bit 0x08)', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags1![idx] = 0x00; // cleared by actuation
    world.rawFlags3![idx] = 0x08; // IsActuated: a real tile is still here
    world.rawTypes![idx] = 42;

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 0);

    expect(tile.IsActive).toBe(false);
    expect(tile.Type).toBe(42);
  });

  it('sets wall fields when flags1 bit 1 is set', () => {
    const world = makeWorld();
    const idx = 1;
    world.rawFlags1![idx] = 0x02;
    world.rawWallTypes![idx] = 7;

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 1);

    expect(tile.IsWallPresent).toBe(true);
    expect(tile.WallType).toBe(7);
  });

  it('leaves WallType undefined when wall value is 0', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags1![idx] = 0x00;
    world.rawWallTypes![idx] = 0;

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 0);

    expect(tile.WallType).toBeUndefined();
  });

  it('sets liquid fields from flags1', () => {
    const world = makeWorld();
    const idx = 3;
    world.rawFlags1![idx] = 0x08 | 0x10; // IsLiquidPresent + IsLiquidLava
    world.rawLiquidAmounts![idx] = 200;

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 3);

    expect(tile.IsLiquidPresent).toBe(true);
    expect(tile.IsLiquidLava).toBe(true);
    expect(tile.LiquidAmount).toBe(200);
  });

  it('sets wire flags from flags2', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags2![idx] = 0x08 | 0x20; // red + blue wire

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 0);

    expect(tile.IsRedWirePresent).toBe(true);
    expect(tile.IsBlueWirePresent).toBe(true);
    expect(tile.IsGreenWirePresent).toBeUndefined();
  });

  it('sets echo/illuminant flags from flags2 and flags3', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags2![idx] = 0x80; // echoBlock
    world.rawFlags3![idx] = 0x01 | 0x02 | 0x04; // echoWall + illuminantBlock + illuminantWall

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 0);

    expect(tile.echoBlock).toBe(true);
    expect(tile.echoWall).toBe(true);
    expect(tile.illuminantBlock).toBe(true);
    expect(tile.illuminantWall).toBe(true);
  });

  it('sets x and y coordinates', () => {
    const world = makeWorld();
    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, 0, 3, 1);

    expect(tile.x).toBe(3);
    expect(tile.y).toBe(1);
  });

  it('sets slope from flags2 bits 0-2', () => {
    const world = makeWorld();
    const idx = 0;
    world.rawFlags2![idx] = 0x03; // slope = 3

    const tile: WorldTile = {};
    fillTileFromRaw(tile, world, idx, 0, 0);

    expect(tile.slope).toBe(3);
  });
});

describe('getTileAt', () => {
  it('returns null when world is null', () => {
    expect(getTileAt(null, 0, 0)).toBeNull();
  });

  it('returns null when rawFlags1 is not set', () => {
    const world = makeWorld();
    delete (world as Record<string, unknown>).rawFlags1;
    expect(getTileAt(world, 0, 0)).toBeNull();
  });

  it('returns null for out-of-bounds coordinates', () => {
    const world = makeWorld();
    expect(getTileAt(world, 100, 100)).toBeNull();
    expect(getTileAt(world, -1, 0)).toBeNull();
  });

  it('returns a tile with correct x/y and populates info', () => {
    const world = makeWorld();
    const x = 1, y = 2;
    const idx = x * world.height + y;
    world.rawFlags1![idx] = 0x01; // active
    world.rawTypes![idx] = 1;     // dirt

    const tile = getTileAt(world, x, y);
    expect(tile).not.toBeNull();
    expect(tile!.x).toBe(x);
    expect(tile!.y).toBe(y);
    expect(tile!.Type).toBe(1);
    expect(tile!.IsActive).toBe(true);
  });

  it('attaches chest from chestByIdx', () => {
    const world = makeWorld();
    const x = 0, y = 0;
    const idx = x * world.height + y;
    const chest = { x: 0, y: 0, name: '', maxItems: 40, items: [] };
    world.chestByIdx!.set(idx, chest);

    const tile = getTileAt(world, x, y);
    expect(tile!.chest).toBe(chest);
  });

  it('attaches sign from signByIdx', () => {
    const world = makeWorld();
    const x = 0, y = 1;
    const idx = x * world.height + y;
    const sign = { x: 0, y: 1, text: 'hello' };
    world.signByIdx!.set(idx, sign);

    const tile = getTileAt(world, x, y);
    expect(tile!.sign).toBe(sign);
  });
});

describe('getTileInfo', () => {
  it('returns undefined for a tile with no type', () => {
    const tile: WorldTile = { IsActive: false };
    expect(getTileInfo(tile)).toBeUndefined();
  });

  it('returns tile info for a valid tile type (type 0 = dirt)', () => {
    const tile: WorldTile = { IsActive: true, Type: 0 };
    const info = getTileInfo(tile);
    expect(info).toBeDefined();
  });
});
