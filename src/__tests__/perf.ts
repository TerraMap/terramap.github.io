import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it, vi } from 'vitest';
import { DataStream } from '../DataStream';
import { clearCaches, getTileColor } from '../lib/mapRenderer';
import { getTileInfo } from '../lib/tileInfo';
import type { WorldData, WorldTile } from '../types/settings';

type TileData = {
  types: ArrayBuffer; wallTypes: ArrayBuffer;
  textureU: ArrayBuffer; textureV: ArrayBuffer;
  tileColors: ArrayBuffer; wallColors: ArrayBuffer;
  liquidAmounts: ArrayBuffer;
  flags1: ArrayBuffer; flags2: ArrayBuffer; flags3: ArrayBuffer;
  count: number;
};

type WorkerPostMessage = { tileData?: TileData };

const postMessageMock = vi.fn();
const workerCalls = () => postMessageMock.mock.calls as Array<[WorkerPostMessage]>;
(globalThis as unknown as Record<string, unknown>).self = {
  addEventListener: vi.fn(),
  postMessage: postMessageMock,
};

const { readFileFormatHeader, readHeader, readTiles, readChests, readSigns, readNpcs, readTileEntities } = await import('../WorldLoader');
type WorldRecord = import('../WorldLoader').WorldRecord;

function loadWorld(filename: string): DataStream {
  const filePath = resolve(__dirname, '../../Worlds', filename);
  const fileBuffer = readFileSync(filePath);
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength,
  );
  const ds = new DataStream(arrayBuffer);
  ds.endianness = DataStream.LITTLE_ENDIAN;
  return ds;
}

function parseWorld(filename: string): { world: WorldRecord; positions: number[] } {
  const reader = loadWorld(filename);
  const world = {} as WorldRecord;
  postMessageMock.mockClear();

  const positions = readFileFormatHeader(reader, world);
  readHeader(reader, world);

  if (positions[1] !== undefined && reader.position !== positions[1]) {
    reader.seek(positions[1]);
  }
  readTiles(reader, world);

  if (positions[2] !== undefined && reader.position !== positions[2]) {
    reader.seek(positions[2]);
  }
  readChests(reader, world);

  if (positions[3] !== undefined && reader.position !== positions[3]) {
    reader.seek(positions[3]);
  }
  readSigns(reader);

  if (positions[4] !== undefined && reader.position !== positions[4]) {
    reader.seek(positions[4]);
  }
  readNpcs(reader, world);

  if (positions[5] !== undefined && reader.position !== positions[5]) {
    reader.seek(positions[5]);
  }
  readTileEntities(reader);

  return { world, positions };
}

function unpackTiles(td: TileData, worldHeight: number): WorldTile[] {
  const n = td.count;
  const types         = new Uint16Array(td.types);
  const wallTypes     = new Uint16Array(td.wallTypes);
  const textureU      = new Int16Array(td.textureU);
  const textureV      = new Int16Array(td.textureV);
  const tileColors    = new Uint8Array(td.tileColors);
  const wallColors    = new Uint8Array(td.wallColors);
  const liquidAmounts = new Uint8Array(td.liquidAmounts);
  const flags1        = new Uint8Array(td.flags1);
  const flags2        = new Uint8Array(td.flags2);
  const flags3        = new Uint8Array(td.flags3);
  const tiles: WorldTile[] = new Array<WorldTile>(n);
  for (let i = 0; i < n; i++) {
    const f1 = flags1[i], f2 = flags2[i], f3 = flags3[i];
    tiles[i] = {
      x: Math.floor(i / worldHeight), y: i % worldHeight,
      IsActive:           (f1 & 0x01) ? true : undefined,
      Type:               (f1 & 0x01) ? types[i] : undefined,
      TextureU:           textureU[i],
      TextureV:           textureV[i],
      tileColor:          tileColors[i] || undefined,
      WallType:           wallTypes[i] || undefined,
      IsWallPresent:      (f1 & 0x02) ? true : undefined,
      WallColor:          wallColors[i] || undefined,
      IsWallColorPresent: (f1 & 0x04) ? true : undefined,
      IsLiquidPresent:    (f1 & 0x08) ? true : undefined,
      LiquidAmount:       liquidAmounts[i] || undefined,
      IsLiquidLava:       (f1 & 0x10) ? true : undefined,
      IsLiquidHoney:      (f1 & 0x20) ? true : undefined,
      Shimmer:            (f1 & 0x40) ? true : undefined,
      IsActuatorPresent:  (f1 & 0x80) ? true : undefined,
      slope:              (f2 & 0x07) || undefined,
      IsRedWirePresent:   (f2 & 0x08) ? true : undefined,
      IsGreenWirePresent: (f2 & 0x10) ? true : undefined,
      IsBlueWirePresent:  (f2 & 0x20) ? true : undefined,
      IsYellowWirePresent:(f2 & 0x40) ? true : undefined,
      echoBlock:          (f2 & 0x80) ? true : undefined,
      echoWall:           (f3 & 0x01) ? true : undefined,
      illuminantBlock:    (f3 & 0x02) ? true : undefined,
      illuminantWall:     (f3 & 0x04) ? true : undefined,
    };
  }
  return tiles;
}

interface TileArrays {
  types: Uint16Array;
  wallTypes: Uint16Array;
  textureU: Int16Array;
  textureV: Int16Array;
  tileColors: Uint8Array;
  wallColors: Uint8Array;
  liquidAmounts: Uint8Array;
  flags1: Uint8Array;
  flags2: Uint8Array;
  flags3: Uint8Array;
}

function packTiles(tiles: WorldTile[]): TileArrays {
  const n = tiles.length;
  const types = new Uint16Array(n);
  const wallTypes = new Uint16Array(n);
  const textureU = new Int16Array(n);
  const textureV = new Int16Array(n);
  const tileColors = new Uint8Array(n);
  const wallColors = new Uint8Array(n);
  const liquidAmounts = new Uint8Array(n);
  const flags1 = new Uint8Array(n);
  const flags2 = new Uint8Array(n);
  const flags3 = new Uint8Array(n);

  // RLE-aware: the worker pushes the same object reference for repeated tiles.
  // Detect runs via identity (===) and use fill() — mirrors Phase 1's inner loop.
  let i = 0;
  while (i < n) {
    const tile = tiles[i];

    const t  = tile.Type ?? 0;
    const wt = tile.WallType ?? 0;
    const tu = tile.TextureU ?? -1;
    const tv = tile.TextureV ?? -1;
    const tc = tile.tileColor ?? 0;
    const wc = tile.WallColor ?? 0;
    const la = tile.LiquidAmount ?? 0;

    let f1 = 0;
    if (tile.IsActive)           f1 |= 0x01;
    if (tile.IsWallPresent)      f1 |= 0x02;
    if (tile.IsWallColorPresent) f1 |= 0x04;
    if (tile.IsLiquidPresent)    f1 |= 0x08;
    if (tile.IsLiquidLava)       f1 |= 0x10;
    if (tile.IsLiquidHoney)      f1 |= 0x20;
    if (tile.Shimmer)            f1 |= 0x40;
    if (tile.IsActuatorPresent)  f1 |= 0x80;

    let f2 = tile.slope ?? 0;
    if (tile.IsRedWirePresent)    f2 |= 0x08;
    if (tile.IsGreenWirePresent)  f2 |= 0x10;
    if (tile.IsBlueWirePresent)   f2 |= 0x20;
    if (tile.IsYellowWirePresent) f2 |= 0x40;
    if (tile.echoBlock)           f2 |= 0x80;

    let f3 = 0;
    if (tile.echoWall)        f3 |= 0x01;
    if (tile.illuminantBlock) f3 |= 0x02;
    if (tile.illuminantWall)  f3 |= 0x04;

    let end = i + 1;
    while (end < n && tiles[end] === tile) end++;

    types.fill(t, i, end);
    wallTypes.fill(wt, i, end);
    textureU.fill(tu, i, end);
    textureV.fill(tv, i, end);
    tileColors.fill(tc, i, end);
    wallColors.fill(wc, i, end);
    liquidAmounts.fill(la, i, end);
    flags1.fill(f1, i, end);
    flags2.fill(f2, i, end);
    flags3.fill(f3, i, end);

    i = end;
  }

  return { types, wallTypes, textureU, textureV, tileColors, wallColors, liquidAmounts, flags1, flags2, flags3 };
}

const CI_RUNS = 1;
const DEFAULT_RUNS = 3;

function time(fn: () => void, { runs = process.env.CI ? CI_RUNS : DEFAULT_RUNS, beforeEach }: { runs?: number; beforeEach?: () => void } = {}): number {
  fn(); // warmup — JIT compiles without affecting measurement
  let total = 0;
  for (let i = 0; i < runs; i++) {
    beforeEach?.();
    const start = performance.now();
    fn();
    total += performance.now() - start;
  }
  return Math.round(total / runs);
}

const worldFiles = [
  { name: 'SmCrptClsc1_4_5_0.wld', label: 'small classic' },
  { name: 'jagged_rocks.wld', label: 'jagged rocks' },
  { name: 'The_Sus_Bog.wld', label: 'tModLoader large' },
  { name: 'Builders_Workshop.wld', label: 'builders workshop' },
];

describe('Performance', () => {
  const rows: string[] = [];

  for (const { name, label } of worldFiles) {
    it(`${label} (${name})`, { timeout: 120_000 }, () => {
      const parseMs = time(() => parseWorld(name));

      const { world } = parseWorld(name);
      const td = workerCalls().find(c => c[0].tileData)![0].tileData!;
      const tiles = unpackTiles(td, world.height);
      const worldData = {
        ...world,
        tiles,
        chests: [],
        signs: [],
        npcs: [],
        tileEntities: new Map(),
      } as unknown as WorldData;
      const tileCount = tiles.length;

      const colorMs = time(() => {
        const height = worldData.height;
        for (let i = 0; i < tileCount; i++) {
          getTileColor(i % height, tiles[i], worldData);
        }
      });

      const infoMs = time(() => {
        for (let i = 0; i < tileCount; i++) {
          getTileInfo(tiles[i]);
        }
      }, { beforeEach: clearCaches });

      // Worker-side packing cost (Phase 1, approximated from WorldTile[]).
      const packMs = time(() => { packTiles(tiles); }, { runs: 1 });

      // Main-thread unpack cost (Phase 1: TypedArrays → WorldTile[]).
      // Cap sample to 5M tiles: tiles (~4GB for large worlds) + a full second copy would OOM.
      // unpackTiles is O(n), so linear extrapolation is accurate.
      const UNPACK_CAP = 5_000_000;
      const capped = tileCount > UNPACK_CAP;
      const tdCap: TileData = capped ? {
        types: td.types.slice(0, UNPACK_CAP * 2),
        wallTypes: td.wallTypes.slice(0, UNPACK_CAP * 2),
        textureU: td.textureU.slice(0, UNPACK_CAP * 2),
        textureV: td.textureV.slice(0, UNPACK_CAP * 2),
        tileColors: td.tileColors.slice(0, UNPACK_CAP),
        wallColors: td.wallColors.slice(0, UNPACK_CAP),
        liquidAmounts: td.liquidAmounts.slice(0, UNPACK_CAP),
        flags1: td.flags1.slice(0, UNPACK_CAP),
        flags2: td.flags2.slice(0, UNPACK_CAP),
        flags3: td.flags3.slice(0, UNPACK_CAP),
        count: UNPACK_CAP,
      } : td;
      const rawUnpackMs = time(() => { unpackTiles(tdCap, world.height); }, { runs: 1 });
      const unpackMs = capped ? Math.round(rawUnpackMs * tileCount / UNPACK_CAP) : rawUnpackMs;
      const unpackStr = (capped ? '~' : '') + String(unpackMs);

      rows.push(
        `| ${label.padEnd(20)} | ${tileCount.toLocaleString().padStart(14)} | ${String(parseMs).padStart(10)} | ${String(colorMs).padStart(10)} | ${String(infoMs).padStart(10)} | ${String(packMs).padStart(10)} | ${unpackStr.padStart(12)} |`,
      );

      expect(parseMs).toBeGreaterThan(0);
    });
  }

  it('summary', () => {
    const header = [
      '',
      `| ${'World'.padEnd(20)} | ${'Tiles'.padStart(14)} | ${'Parse (ms)'.padStart(10)} | ${'Color (ms)'.padStart(10)} | ${'Info (ms)'.padStart(10)} | ${'Pack (ms)'.padStart(10)} | ${'Unpack (ms)'.padStart(12)} |`,
      `| ${'-'.repeat(20)} | ${'-'.repeat(14)} | ${'-'.repeat(10)} | ${'-'.repeat(10)} | ${'-'.repeat(10)} | ${'-'.repeat(10)} | ${'-'.repeat(12)} |`,
      ...rows,
      '',
    ];
    console.log(header.join('\n'));
  });
});
