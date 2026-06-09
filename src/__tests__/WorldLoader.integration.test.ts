import { readFileSync } from 'fs';
import { resolve } from 'path';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { TileEntity } from '../../src/types/settings';
import { DataStream } from '../DataStream';


type TileData = {
  types: ArrayBuffer; wallTypes: ArrayBuffer;
  textureU: ArrayBuffer; textureV: ArrayBuffer;
  tileColors: ArrayBuffer; wallColors: ArrayBuffer;
  liquidAmounts: ArrayBuffer;
  flags1: ArrayBuffer; flags2: ArrayBuffer; flags3: ArrayBuffer;
  count: number;
};

type WorkerPostMessage = {
  tileData?: TileData;
  chests?: unknown[];
  npcs?: unknown[];
  tileEntities?: Map<{ x: number; y: number }, TileEntity>;
};

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
    fileBuffer.byteOffset + fileBuffer.byteLength
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

describe('WorldLoader integration', () => {
  describe('SmCrptClsc1_4_5_0.wld (vanilla v1.4.5.0 small classic)', () => {
    let world: WorldRecord;
    // let positions: number[];

    beforeAll(() => {
      const result = parseWorld('SmCrptClsc1_4_5_0.wld');
      world = result.world;
      // positions = result.positions;
    });

    it('should parse the version', () => {
      expect(world.version).toBeGreaterThanOrEqual(279);
    });

    it('should parse world dimensions', () => {
      expect(world.width).toBeGreaterThan(0);
      expect(world.height).toBeGreaterThan(0);
    });

    it('should parse the world name', () => {
      expect(typeof world.name).toBe('string');
      expect(world.name.length).toBeGreaterThan(0);
    });

    it('should parse worldSurfaceY as a reasonable value', () => {
      expect(world.worldSurfaceY).toBeGreaterThan(0);
      expect(world.worldSurfaceY).toBeLessThan(world.height);
    });

    it('should parse rockLayerY below worldSurfaceY', () => {
      expect(world.rockLayerY).toBeGreaterThanOrEqual(world.worldSurfaceY);
      expect(world.rockLayerY).toBeLessThan(world.height);
    });

    it('should parse spawn coordinates within world bounds', () => {
      expect(world.spawnX).toBeGreaterThanOrEqual(0);
      expect(world.spawnX).toBeLessThan(world.width);
      expect(world.spawnY).toBeGreaterThanOrEqual(0);
      expect(world.spawnY).toBeLessThan(world.height);
    });

    it('should post tile data via postMessage', () => {
      const tileMsg = workerCalls().find(c => c[0].tileData);
      expect(tileMsg).toBeDefined();
      expect(tileMsg![0].tileData!.count).toBeGreaterThan(0);
    });

    it('should post chests message', () => {
      const chestsMsg = workerCalls().find(c => c[0].chests);
      expect(chestsMsg).toBeDefined();
    });

    it('should post NPCs message', () => {
      const npcsMsg = workerCalls().find(c => c[0].npcs);
      expect(npcsMsg).toBeDefined();
    });

    it('should complete full parse without throwing', () => {
      expect(world.version).toBeDefined();
      expect(world.name).toBeDefined();
    });
  });

  describe('jagged_rocks.wld', () => {
    let world: WorldRecord;

    beforeAll(() => {
      const result = parseWorld('jagged_rocks.wld');
      world = result.world;
    });

    it('should parse successfully', () => {
      expect(world.version).toBeGreaterThan(0);
      expect(world.name).toBeTruthy();
      expect(world.width).toBeGreaterThan(0);
      expect(world.height).toBeGreaterThan(0);
    });

    it('should have valid surface and rock layers', () => {
      expect(world.worldSurfaceY).toBeGreaterThan(0);
      expect(world.rockLayerY).toBeGreaterThanOrEqual(world.worldSurfaceY);
    });
  });

  describe('The_Sus_Bog.wld (tModLoader world)', () => {
    let world: WorldRecord;

    beforeAll(() => {
      const result = parseWorld('The_Sus_Bog.wld');
      world = result.world;
    });

    it('should parse successfully despite being a tModLoader world', () => {
      expect(world.version).toBeGreaterThan(0);
      expect(world.name).toBeTruthy();
      expect(world.width).toBeGreaterThan(0);
      expect(world.height).toBeGreaterThan(0);
    });

    it('should parse worldSurfaceY correctly', () => {
      expect(world.worldSurfaceY).toBeGreaterThan(0);
      expect(world.worldSurfaceY).toBeLessThan(world.height);
    });

    it('should post tile data', () => {
      const tileMsg = workerCalls().find(c => c[0].tileData);
      expect(tileMsg).toBeDefined();
      expect(tileMsg![0].tileData!.count).toBeGreaterThan(0);
    });
  });

  describe('Builders_Workshop.wld', () => {
    let world: WorldRecord;

    beforeAll(() => {
      const result = parseWorld('Builders_Workshop.wld');
      world = result.world;
    });

    it('should parse successfully', () => {
      expect(world.version).toBeGreaterThan(0);
      expect(world.name).toBeTruthy();
      expect(world.width).toBeGreaterThan(0);
      expect(world.height).toBeGreaterThan(0);
    });

    it('should parse worldSurfaceY correctly', () => {
      expect(world.worldSurfaceY).toBeGreaterThan(0);
      expect(world.worldSurfaceY).toBeLessThan(world.height);
    });

    it('should post tile data', () => {
      const tileMsg = workerCalls().find(c => c[0].tileData);
      expect(tileMsg).toBeDefined();
      expect(tileMsg![0].tileData!.count).toBeGreaterThan(0);
    });

    it('should have a tile entity with dyes', () => {
      const entitiesMsg = workerCalls().find(c => c[0].tileEntities);
      expect(entitiesMsg).toBeDefined();

      const tileEntities = entitiesMsg![0].tileEntities as Map<{ x: number; y: number }, TileEntity>;
      let dyeEntity: TileEntity | undefined;

      for (const [, entity] of tileEntities) {
        if (entity.dyes?.some(d => d.id !== 0)) {
          dyeEntity = entity;
          break;
        }
      }
      expect(dyeEntity).toBeDefined();
      console.log('Tile entity with dyes:', JSON.stringify(dyeEntity));
    });

    it('should have a painted tile', () => {
      const td = workerCalls().find(c => c[0].tileData)![0].tileData!;
      const tileColors = new Uint8Array(td.tileColors);
      let paintedIdx = -1;
      for (let i = 0; i < td.count; i++) {
        if (tileColors[i] > 0) { paintedIdx = i; break; }
      }
      expect(paintedIdx).toBeGreaterThan(-1);
      const x = Math.floor(paintedIdx / world.height);
      const y = paintedIdx % world.height;
      console.log('Tile with paint:', JSON.stringify({ x, y, tileColor: tileColors[paintedIdx] }));
      expect(tileColors[paintedIdx]).toBeGreaterThan(0);
    });

    it('should find hat racks with items', () => {
      const entitiesMsg = workerCalls().find(c => c[0].tileEntities);
      const tileEntities = entitiesMsg![0].tileEntities as Map<{ x: number; y: number }, TileEntity>;
      const hatRacks: TileEntity[] = [];
      for (const [, entity] of tileEntities) {
        if (entity.type === 5 && entity.items?.some(i => i.id > 0)) {
          hatRacks.push(entity);
        }
      }
      console.log(`Hat racks with items: ${hatRacks.length}`);
      for (const hr of hatRacks) {
        console.log(JSON.stringify(hr));
      }
      expect(hatRacks.length).toBeGreaterThan(0);
    });
  });
});
