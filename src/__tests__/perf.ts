import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it, vi } from 'vitest';
import { DataStream } from '../DataStream';
import { clearCaches, getTileColorRaw } from '../lib/mapRenderer';
import { fillTileFromRaw, getTileInfo } from '../lib/tileInfo';
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

      const rawTypes         = new Uint16Array(td.types);
      const rawWallTypes     = new Uint16Array(td.wallTypes);
      const rawTextureU      = new Int16Array(td.textureU);
      const rawTextureV      = new Int16Array(td.textureV);
      const rawTileColors    = new Uint8Array(td.tileColors);
      const rawWallColors    = new Uint8Array(td.wallColors);
      const rawLiquidAmounts = new Uint8Array(td.liquidAmounts);
      const rawFlags1        = new Uint8Array(td.flags1);
      const rawFlags2        = new Uint8Array(td.flags2);
      const rawFlags3        = new Uint8Array(td.flags3);

      const worldData = {
        ...world,
        rawTypes, rawWallTypes, rawTextureU, rawTextureV,
        rawTileColors, rawWallColors, rawLiquidAmounts,
        rawFlags1, rawFlags2, rawFlags3,
        tiles: [],
        chests: [],
        signs: [],
        npcs: [],
        tileEntities: new Map(),
      } as unknown as WorldData;

      const tileCount = td.count;
      const height = world.height;

      // Render hot path: direct TypedArray reads, no object allocation.
      const colorMs = time(() => {
        let y = 0;
        for (let i = 0; i < tileCount; i++) {
          getTileColorRaw(y, i, worldData);
          if (++y >= height) y = 0;
        }
      });

      // Highlight/selection path: single reused tileView, filled from TypedArrays.
      const tileView: WorldTile = {};
      const infoMs = time(() => {
        let x = 0, y = 0;
        for (let i = 0; i < tileCount; i++) {
          fillTileFromRaw(tileView, worldData, i, x, y);
          getTileInfo(tileView);
          if (++y >= height) { y = 0; x++; }
        }
      }, { beforeEach: clearCaches });

      rows.push(
        `| ${label.padEnd(20)} | ${tileCount.toLocaleString().padStart(14)} | ${String(parseMs).padStart(10)} | ${String(colorMs).padStart(10)} | ${String(infoMs).padStart(10)} |`,
      );

      expect(parseMs).toBeGreaterThan(0);
    });
  }

  it('summary', () => {
    const header = [
      '',
      `| ${'World'.padEnd(20)} | ${'Tiles'.padStart(14)} | ${'Parse (ms)'.padStart(10)} | ${'Color (ms)'.padStart(10)} | ${'Info (ms)'.padStart(10)} |`,
      `| ${'-'.repeat(20)} | ${'-'.repeat(14)} | ${'-'.repeat(10)} | ${'-'.repeat(10)} | ${'-'.repeat(10)} |`,
      ...rows,
      '',
    ];
    console.log(header.join('\n'));
  });
});
