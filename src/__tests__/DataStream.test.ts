import { describe, it, expect } from 'vitest';
import { DataStream } from '../DataStream';

function createStream(bytes: number[]): DataStream {
  const buffer = new ArrayBuffer(bytes.length);
  const view = new Uint8Array(buffer);
  view.set(bytes);
  const ds = new DataStream(buffer);
  ds.endianness = DataStream.LITTLE_ENDIAN;
  return ds;
}

describe('DataStream', () => {
  describe('constructor', () => {
    it('should create a DataStream from an ArrayBuffer', () => {
      const buffer = new ArrayBuffer(16);
      const ds = new DataStream(buffer);
      expect(ds.position).toBe(0);
      expect(ds.byteLength).toBe(16);
    });

    it('should default to little endian', () => {
      const ds = new DataStream(new ArrayBuffer(1));
      expect(ds.endianness).toBe(DataStream.LITTLE_ENDIAN);
    });
  });

  describe('seek and position', () => {
    it('should seek to a valid position', () => {
      const ds = createStream([0, 0, 0, 0, 0, 0, 0, 0]);
      ds.seek(4);
      expect(ds.position).toBe(4);
    });

    it('should clamp seek to 0 for negative values', () => {
      const ds = createStream([0, 0, 0, 0]);
      ds.seek(-5);
      expect(ds.position).toBe(0);
    });

    it('should clamp seek to byteLength', () => {
      const ds = createStream([0, 0, 0, 0]);
      ds.seek(100);
      expect(ds.position).toBe(4);
    });
  });

  describe('isEof', () => {
    it('should return false at start of non-empty buffer', () => {
      const ds = createStream([0, 1, 2]);
      expect(ds.isEof()).toBe(false);
    });

    it('should return true when position equals byteLength', () => {
      const ds = createStream([0, 1, 2]);
      ds.seek(3);
      expect(ds.isEof()).toBe(true);
    });
  });

  describe('readUint8', () => {
    it('should read a uint8 value', () => {
      const ds = createStream([0x42]);
      expect(ds.readUint8()).toBe(0x42);
      expect(ds.position).toBe(1);
    });

    it('should read 0xFF correctly', () => {
      const ds = createStream([0xFF]);
      expect(ds.readUint8()).toBe(255);
    });
  });

  describe('readInt8', () => {
    it('should read a positive int8', () => {
      const ds = createStream([0x7F]);
      expect(ds.readInt8()).toBe(127);
    });

    it('should read a negative int8', () => {
      const ds = createStream([0xFF]);
      expect(ds.readInt8()).toBe(-1);
    });

    it('should read -128', () => {
      const ds = createStream([0x80]);
      expect(ds.readInt8()).toBe(-128);
    });
  });

  describe('readUint16', () => {
    it('should read little-endian uint16', () => {
      const ds = createStream([0x01, 0x00]);
      expect(ds.readUint16()).toBe(1);
      expect(ds.position).toBe(2);
    });

    it('should read 0xFFFF correctly', () => {
      const ds = createStream([0xFF, 0xFF]);
      expect(ds.readUint16()).toBe(65535);
    });

    it('should read little-endian byte order', () => {
      // 0x0201 in little-endian = bytes [0x01, 0x02]
      const ds = createStream([0x01, 0x02]);
      expect(ds.readUint16()).toBe(0x0201);
    });

    it('should read big-endian when specified', () => {
      const ds = createStream([0x01, 0x02]);
      expect(ds.readUint16(DataStream.BIG_ENDIAN)).toBe(0x0102);
    });
  });

  describe('readInt16', () => {
    it('should read a positive int16', () => {
      const ds = createStream([0x01, 0x00]);
      expect(ds.readInt16()).toBe(1);
    });

    it('should read a negative int16', () => {
      const ds = createStream([0xFF, 0xFF]);
      expect(ds.readInt16()).toBe(-1);
    });

    it('should read -32768', () => {
      // -32768 = 0x8000 in little-endian = [0x00, 0x80]
      const ds = createStream([0x00, 0x80]);
      expect(ds.readInt16()).toBe(-32768);
    });
  });

  describe('readUint32', () => {
    it('should read little-endian uint32', () => {
      const ds = createStream([0x01, 0x00, 0x00, 0x00]);
      expect(ds.readUint32()).toBe(1);
      expect(ds.position).toBe(4);
    });

    it('should read a large uint32', () => {
      // 0xDEADBEEF in little-endian
      const ds = createStream([0xEF, 0xBE, 0xAD, 0xDE]);
      expect(ds.readUint32()).toBe(0xDEADBEEF);
    });
  });

  describe('readInt32', () => {
    it('should read a positive int32', () => {
      const ds = createStream([0x01, 0x00, 0x00, 0x00]);
      expect(ds.readInt32()).toBe(1);
      expect(ds.position).toBe(4);
    });

    it('should read a negative int32', () => {
      const ds = createStream([0xFF, 0xFF, 0xFF, 0xFF]);
      expect(ds.readInt32()).toBe(-1);
    });

    it('should read INT32_MIN', () => {
      const ds = createStream([0x00, 0x00, 0x00, 0x80]);
      expect(ds.readInt32()).toBe(-2147483648);
    });
  });

  describe('readFloat32', () => {
    it('should read 1.0', () => {
      // IEEE 754: 1.0 = 0x3F800000
      const ds = createStream([0x00, 0x00, 0x80, 0x3F]);
      expect(ds.readFloat32()).toBeCloseTo(1.0);
      expect(ds.position).toBe(4);
    });

    it('should read -1.0', () => {
      // IEEE 754: -1.0 = 0xBF800000
      const ds = createStream([0x00, 0x00, 0x80, 0xBF]);
      expect(ds.readFloat32()).toBeCloseTo(-1.0);
    });

    it('should read 0.0', () => {
      const ds = createStream([0x00, 0x00, 0x00, 0x00]);
      expect(ds.readFloat32()).toBe(0.0);
    });
  });

  describe('readFloat64', () => {
    it('should read 1.0', () => {
      // IEEE 754: 1.0 = 0x3FF0000000000000
      const ds = createStream([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F]);
      expect(ds.readFloat64()).toBeCloseTo(1.0);
      expect(ds.position).toBe(8);
    });

    it('should read -1.0', () => {
      const ds = createStream([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF]);
      expect(ds.readFloat64()).toBeCloseTo(-1.0);
    });
  });

  describe('sequential reads', () => {
    it('should advance position correctly across multiple reads', () => {
      const ds = createStream([
        0x42,                   // uint8 = 66
        0x01, 0x00,             // uint16 = 1
        0xFF, 0xFF, 0xFF, 0xFF, // int32 = -1
      ]);

      expect(ds.readUint8()).toBe(0x42);
      expect(ds.position).toBe(1);

      expect(ds.readUint16()).toBe(1);
      expect(ds.position).toBe(3);

      expect(ds.readInt32()).toBe(-1);
      expect(ds.position).toBe(7);

      expect(ds.isEof()).toBe(true);
    });
  });

  describe('readUint8Array', () => {
    it('should read an array of uint8 values', () => {
      const ds = createStream([10, 20, 30, 40, 50]);
      const arr = ds.readUint8Array(3);
      expect(arr).toBeInstanceOf(Uint8Array);
      expect(Array.from(arr)).toEqual([10, 20, 30]);
      expect(ds.position).toBe(3);
    });

    it('should read remaining bytes', () => {
      const ds = createStream([1, 2, 3]);
      ds.readUint8();
      const arr = ds.readUint8Array(2);
      expect(Array.from(arr)).toEqual([2, 3]);
    });
  });

  describe('readInt16Array', () => {
    it('should read an array of int16 values', () => {
      // [1, -1] in little-endian
      const ds = createStream([0x01, 0x00, 0xFF, 0xFF]);
      const arr = ds.readInt16Array(2);
      expect(arr).toBeInstanceOf(Int16Array);
      expect(Array.from(arr)).toEqual([1, -1]);
      expect(ds.position).toBe(4);
    });
  });

  describe('readInt32Array', () => {
    it('should read an array of int32 values', () => {
      // [1, -1] in little-endian
      const ds = createStream([
        0x01, 0x00, 0x00, 0x00,
        0xFF, 0xFF, 0xFF, 0xFF,
      ]);
      const arr = ds.readInt32Array(2);
      expect(arr).toBeInstanceOf(Int32Array);
      expect(Array.from(arr)).toEqual([1, -1]);
      expect(ds.position).toBe(8);
    });
  });

  describe('readString', () => {
    it('should read an ASCII string of given length', () => {
      const ds = createStream([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello"
      const str = ds.readString(5);
      expect(str).toBe('Hello');
      expect(ds.position).toBe(5);
    });

    it('should read remaining bytes when no length given', () => {
      const ds = createStream([0x48, 0x69]); // "Hi"
      const str = ds.readString(null);
      expect(str).toBe('Hi');
    });
  });

  describe('readCString', () => {
    it('should read a null-terminated string', () => {
      const ds = createStream([0x48, 0x69, 0x00, 0x58]); // "Hi\0X"
      const str = ds.readCString();
      expect(str).toBe('Hi');
    });
  });

  describe('static methods', () => {
    it('memcpy should copy bytes between buffers', () => {
      const src = new Uint8Array([1, 2, 3, 4, 5]).buffer;
      const dst = new ArrayBuffer(5);
      DataStream.memcpy(dst, 0, src, 1, 3);
      expect(Array.from(new Uint8Array(dst, 0, 3))).toEqual([2, 3, 4]);
    });

    it('createStringFromArray should convert byte array to string', () => {
      const arr = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const str = DataStream.createStringFromArray(arr);
      expect(str).toBe('Hello');
    });
  });
});
