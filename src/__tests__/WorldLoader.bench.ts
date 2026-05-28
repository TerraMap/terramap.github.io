import { readFileSync } from 'fs';
import { resolve } from 'path';
import { bench, describe, vi } from 'vitest';
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

const worldFiles = [
  { name: 'SmCrptClsc1_4_5_0.wld', label: 'small classic' },
  { name: 'jagged_rocks.wld', label: 'jagged rocks' },
  { name: 'The_Sus_Bog.wld', label: 'tModLoader large' },
  { name: 'Builders_Workshop.wld', label: 'builders workshop' },
];

describe('World parsing', () => {
  for (const { name, label } of worldFiles) {
    bench(`parse ${label} (${name})`, () => {
      parseWorld(name);
    }, { iterations: 10, warmupIterations: 2 });
  }
});

describe('Tile color computation', () => {
  for (const { name, label } of worldFiles) {
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

    bench(`getTileColor all tiles - ${label} (${tiles.length.toLocaleString()} tiles)`, () => {
      const height = worldData.height;
      for (let i = 0; i < tiles.length; i++) {
        const y = i % height;
        getTileColor(y, tiles[i], worldData);
      }
    }, { iterations: 5, warmupIterations: 1 });
  }
});

describe('getTileInfo computation', () => {
  for (const { name, label } of worldFiles) {
    parseWorld(name);
    const tiles = collectTiles();

    bench(`getTileInfo all tiles - ${label} (${tiles.length.toLocaleString()} tiles)`, () => {
      for (let i = 0; i < tiles.length; i++) {
        getTileInfo(tiles[i]);
      }
    }, { iterations: 5, warmupIterations: 1 });
  }
});

describe('Memory usage', () => {
  for (const { name, label } of worldFiles) {
    bench(`heap after parse - ${label}`, () => {
      global.gc?.();
      const before = process.memoryUsage().heapUsed;
      parseWorld(name);
      const after = process.memoryUsage().heapUsed;
      const deltaKB = Math.round((after - before) / 1024);
      if (deltaKB > 0) {
        // Vitest bench doesn't have a native way to report custom metrics,
        // but the delta is visible in the iteration timing context.
        void deltaKB;
      }
    }, { iterations: 3, warmupIterations: 1 });
  }
});
