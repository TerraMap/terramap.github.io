import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it, vi } from 'vitest';
import { DataStream } from '../DataStream';
import { getTileColor } from '../lib/mapRenderer';
import { getTileInfo } from '../lib/tileInfo';
import type { WorldData, WorldTile } from '../types/settings';

const postMessageMock = vi.fn();
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

function collectTiles(): WorldTile[] {
  const tileMessages = postMessageMock.mock.calls.filter(c => c[0].tiles);
  const tiles: WorldTile[] = [];
  for (const call of tileMessages) {
    for (const tile of call[0].tiles) {
      tiles.push(tile);
    }
  }
  return tiles;
}

function time(fn: () => void, runs = 3): number {
  let total = 0;
  for (let i = 0; i < runs; i++) {
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
    it(`${label} (${name})`, { timeout: 30_000 }, () => {
      const parseMs = time(() => parseWorld(name));

      const { world } = parseWorld(name);
      const tiles = collectTiles();
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
      });

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
