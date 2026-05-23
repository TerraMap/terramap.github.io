import { describe, it, expect, vi, beforeAll } from 'vitest';
import { DataStream } from '../DataStream';

// Mock worker globals before importing WorldLoader
const postMessageMock = vi.fn();
(globalThis as any).self = {
  addEventListener: vi.fn(),
  postMessage: postMessageMock,
};

const { readString, readFileFormatHeader, readHeader } = await import('../WorldLoader');

function createReader(bytes: number[]): any {
  const buffer = new ArrayBuffer(bytes.length);
  const view = new Uint8Array(buffer);
  view.set(bytes);
  const ds = new DataStream(buffer);
  ds.endianness = DataStream.LITTLE_ENDIAN;
  return ds;
}

function encodeLEB128String(str: string): number[] {
  const encoded = new TextEncoder().encode(str);
  const lengthBytes: number[] = [];
  let len = encoded.length;
  do {
    let byte = len & 0x7F;
    len >>= 7;
    if (len > 0) byte |= 0x80;
    lengthBytes.push(byte);
  } while (len > 0);
  return [...lengthBytes, ...Array.from(encoded)];
}

describe('WorldLoader', () => {
  describe('readString', () => {
    it('should read a short length-prefixed string', () => {
      // LEB128 length 5, then "Hello"
      const bytes = encodeLEB128String('Hello');
      const reader = createReader(bytes);
      expect(readString(reader)).toBe('Hello');
    });

    it('should read an empty string', () => {
      const bytes = encodeLEB128String('');
      const reader = createReader(bytes);
      expect(readString(reader)).toBe('');
    });

    it('should read a string with length > 127 (multi-byte LEB128)', () => {
      const longStr = 'A'.repeat(200);
      const bytes = encodeLEB128String(longStr);
      const reader = createReader(bytes);
      expect(readString(reader)).toBe(longStr);
    });
  });

  describe('readFileFormatHeader', () => {
    it('should read version, positions, and importance bits', () => {
      const bytes: number[] = [];
      const world: any = {};

      // version (Int32 LE) = 279
      bytes.push(0x17, 0x01, 0x00, 0x00);

      // file metadata: magic + revision (two Uint32s)
      bytes.push(0, 0, 0, 0, 0, 0, 0, 0);

      // revision (Uint32)
      bytes.push(0x01, 0x00, 0x00, 0x00);

      // isFavorite (two Uint32s)
      bytes.push(0, 0, 0, 0, 0, 0, 0, 0);

      // positions count (Int16) = 3
      bytes.push(0x03, 0x00);
      // positions: [100, 200, 300] as Int32 LE
      bytes.push(0x64, 0x00, 0x00, 0x00); // 100
      bytes.push(0xC8, 0x00, 0x00, 0x00); // 200
      bytes.push(0x2C, 0x01, 0x00, 0x00); // 300

      // importance count (Int16) = 8
      bytes.push(0x08, 0x00);
      // importance bits: 1 byte, bits = 0b10100101 = 0xA5
      // bit 0=1, bit 1=0, bit 2=1, bit 3=0, bit 4=0, bit 5=1, bit 6=0, bit 7=1
      bytes.push(0xA5);

      const reader = createReader(bytes);
      const positions = readFileFormatHeader(reader, world);

      expect(world.version).toBe(279);
      expect(world.revision).toBe(1);
      expect(positions).toEqual([100, 200, 300]);
      expect(world.importance.length).toBe(8);
      expect(world.importance[0]).toBe(true);  // bit 0 = 1
      expect(world.importance[1]).toBe(false); // bit 1 = 0
      expect(world.importance[2]).toBe(true);  // bit 2 = 1
      expect(world.importance[3]).toBe(false); // bit 3 = 0
      expect(world.importance[4]).toBe(false); // bit 4 = 0
      expect(world.importance[5]).toBe(true);  // bit 5 = 1
      expect(world.importance[6]).toBe(false); // bit 6 = 0
      expect(world.importance[7]).toBe(true);  // bit 7 = 1
    });
  });
});
