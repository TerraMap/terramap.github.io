import { describe, expect, it } from 'vitest';
import { buildHighlightEntries, buildSearchEntries, findNextByIndex } from '../lib/tileSearch';
import type { WorldData } from '../types/settings';

function makeWorld(overrides: Partial<WorldData> = {}): WorldData {
  const width = 10;
  const height = 10;
  const n = width * height;
  return {
    width,
    height,
    worldSurfaceY: 3,
    rockLayerY: 6,
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
    chestByIdx: new Map(),
    signByIdx:  new Map(),
    entityByIdx: new Map(),
    ...overrides,
  };
}

// ── findNextByIndex ──────────────────────────────────────────────────────────

describe('findNextByIndex', () => {
  const sorted = new Uint32Array([2, 5, 10, 20, 50]);
  const total = 100;

  it('finds the next index after current in forward direction', () => {
    expect(findNextByIndex([{ indices: sorted }], 5, 1, total)).toBe(10);
  });

  it('wraps around to the start when past the last element (forward)', () => {
    expect(findNextByIndex([{ indices: sorted }], 50, 1, total)).toBe(2);
  });

  it('finds the previous index before current in backward direction', () => {
    expect(findNextByIndex([{ indices: sorted }], 10, -1, total)).toBe(5);
  });

  it('wraps around to the end when before the first element (backward)', () => {
    expect(findNextByIndex([{ indices: sorted }], 2, -1, total)).toBe(50);
  });

  it('returns null for an empty index array', () => {
    expect(findNextByIndex([{ indices: new Uint32Array(0) }], 5, 1, total)).toBeNull();
  });

  it('returns null when filter rejects all entries', () => {
    const result = findNextByIndex(
      [{ indices: sorted, filter: () => false }],
      5, 1, total
    );
    expect(result).toBeNull();
  });

  it('respects filter — skips entries that do not pass', () => {
    // only allow idx === 20
    const result = findNextByIndex(
      [{ indices: sorted, filter: (idx) => idx === 20 }],
      5, 1, total
    );
    expect(result).toBe(20);
  });

  it('picks the closest candidate across multiple entries (forward)', () => {
    const a = new Uint32Array([15, 40]);
    const b = new Uint32Array([12, 30]);
    // from currentIdx=10, forward: closest next is 12 (from b), not 15 (from a)
    expect(findNextByIndex([{ indices: a }, { indices: b }], 10, 1, total)).toBe(12);
  });

  it('picks the closest candidate across multiple entries (backward)', () => {
    const a = new Uint32Array([5, 15]);
    const b = new Uint32Array([8, 18]);
    // from currentIdx=10, backward: closest prev is 8 (from b), not 5 (from a)
    expect(findNextByIndex([{ indices: a }, { indices: b }], 10, -1, total)).toBe(8);
  });

  it('respects explored mask — skips unexplored indices', () => {
    const explored = new Uint8Array(total);
    explored[20] = 1; // only idx 20 is explored
    const result = findNextByIndex([{ indices: sorted }], 5, 1, total, explored);
    expect(result).toBe(20);
  });

  it('returns null when all indices are unexplored', () => {
    const explored = new Uint8Array(total); // all zero
    expect(findNextByIndex([{ indices: sorted }], 5, 1, total, explored)).toBeNull();
  });

  it('does not return currentIdx itself when it is the only forward match', () => {
    const only = new Uint32Array([5]);
    expect(findNextByIndex([{ indices: only }], 5, 1, total)).toBeNull();
  });

  it('does not return currentIdx itself when it is the only backward match', () => {
    const only = new Uint32Array([5]);
    expect(findNextByIndex([{ indices: only }], 5, -1, total)).toBeNull();
  });

  it('multi-entry: entry that only wraps to currentIdx does not beat a valid forward candidate', () => {
    // Simulates the Locked Chests bug: all entries share one indices array,
    // one variant has a single match at currentIdx (wraps to distance 0),
    // another variant has a real forward match.
    const shared = new Uint32Array([5, 20, 30]);
    const onlyAtCurrent = (idx: number) => idx === 5;  // wraps back to currentIdx
    const otherVariant  = (idx: number) => idx === 20; // genuine next match
    expect(findNextByIndex(
      [{ indices: shared, filter: onlyAtCurrent }, { indices: shared, filter: otherVariant }],
      5, 1, total
    )).toBe(20);
  });

  it('multi-entry: entry that only wraps to currentIdx does not beat a valid backward candidate', () => {
    const shared = new Uint32Array([5, 20, 30]);
    const onlyAtCurrent = (idx: number) => idx === 30; // wraps back to currentIdx
    const otherVariant  = (idx: number) => idx === 20; // genuine prev match
    expect(findNextByIndex(
      [{ indices: shared, filter: onlyAtCurrent }, { indices: shared, filter: otherVariant }],
      30, -1, total
    )).toBe(20);
  });
});

// ── buildSearchEntries / buildHighlightEntries ────────────────────────────────

describe('buildSearchEntries', () => {
  it('returns null when tileTypeIdx is not ready', () => {
    const world = makeWorld();
    const tileInfo = { id: 1, name: 'Stone', isTile: true as const };
    expect(buildSearchEntries([tileInfo], world)).toBeNull();
  });

  it('returns an entry when tileTypeIdx is populated', () => {
    const world = makeWorld();
    world.tileTypeIdx = new Map([[1, new Uint32Array([5, 10])]]);
    const tileInfo = { id: 1, name: 'Stone', isTile: true as const };
    const entries = buildSearchEntries([tileInfo], world);
    expect(entries).not.toBeNull();
    expect(entries!.length).toBe(1);
    expect(entries![0].indices).toEqual(new Uint32Array([5, 10]));
  });

  it('returns null when wallTypeIdx is not ready for a wall info', () => {
    const world = makeWorld();
    const wallInfo = { id: 1, name: 'Stone Wall', isWall: true as const };
    expect(buildSearchEntries([wallInfo], world)).toBeNull();
  });

  it('returns an entry when wallTypeIdx is populated', () => {
    const world = makeWorld();
    world.wallTypeIdx = new Map([[2, new Uint32Array([3, 7])]]);
    const wallInfo = { id: 2, name: 'Stone Wall', isWall: true as const };
    const entries = buildSearchEntries([wallInfo], world);
    expect(entries).not.toBeNull();
    expect(entries![0].indices).toEqual(new Uint32Array([3, 7]));
  });

  it('returns null when itemIdx is not ready for an item info', () => {
    const world = makeWorld();
    const itemInfo = { id: 5, name: 'Iron Pickaxe', isItem: true as const };
    expect(buildSearchEntries([itemInfo], world)).toBeNull();
  });

  it('returns an entry when itemIdx is populated', () => {
    const world = makeWorld();
    world.itemIdx = new Map([[5, new Uint32Array([1, 9])]]);
    const itemInfo = { id: 5, name: 'Iron Pickaxe', isItem: true as const };
    const entries = buildSearchEntries([itemInfo], world);
    expect(entries).not.toBeNull();
    expect(entries![0].indices).toEqual(new Uint32Array([1, 9]));
  });

  it('skips info whose id is absent from the index (returns empty → null)', () => {
    const world = makeWorld();
    world.tileTypeIdx = new Map(); // populated but empty
    const tileInfo = { id: 99, name: 'Unknown', isTile: true as const };
    expect(buildSearchEntries([tileInfo], world)).toBeNull();
  });
});

describe('buildHighlightEntries', () => {
  it('returns null when itemHighlightIdx is not ready', () => {
    const world = makeWorld();
    const itemInfo = { id: 5, name: 'Iron Pickaxe', isItem: true as const };
    expect(buildHighlightEntries([itemInfo], world)).toBeNull();
  });

  it('returns an entry using itemHighlightIdx when populated', () => {
    const world = makeWorld();
    world.itemHighlightIdx = new Map([[5, new Uint32Array([0, 1, 10, 11])]]);
    const itemInfo = { id: 5, name: 'Iron Pickaxe', isItem: true as const };
    const entries = buildHighlightEntries([itemInfo], world);
    expect(entries).not.toBeNull();
    expect(entries![0].indices).toEqual(new Uint32Array([0, 1, 10, 11]));
  });

  it('returns a filtered entry for a tile frame (specific u/v)', () => {
    const world = makeWorld();
    world.tileTypeIdx = new Map([[4, new Uint32Array([0, 1, 2, 3])]]);
    world.rawTextureU = new Int16Array([0, 18, 0, 18]);
    world.rawTextureV = new Int16Array([0, 0, 18, 18]);
    const parentTile = { id: 4, name: 'Torch' };
    const frame = { u: 18, v: 0, parent: parentTile, isTile: true as const };
    const entries = buildHighlightEntries([frame], world);
    expect(entries).not.toBeNull();
    expect(entries![0].filter).toBeDefined();
    expect(entries![0].filter!(1)).toBe(true);  // u=18, v=0 ✓
    expect(entries![0].filter!(0)).toBe(false); // u=0, v=0 ✗
  });
});
