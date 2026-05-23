/**
  DataStream reads scalars, arrays and structs of data from an ArrayBuffer.
  It's like a file-like DataView on steroids.
  */

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

type StructDefinition = unknown[];

export class DataStream {
  /** Big-endian const to use as default endianness. */
  static readonly BIG_ENDIAN: boolean = false;

  /** Little-endian const to use as default endianness. */
  static readonly LITTLE_ENDIAN: boolean = true;

  /**
    Native endianness. Either DataStream.BIG_ENDIAN or DataStream.LITTLE_ENDIAN
    depending on the platform endianness.
    */
  static endianness: boolean = new Int8Array(new Int16Array([1]).buffer)[0] > 0;

  /**
    Copies byteLength bytes from the src buffer at srcOffset to the
    dst buffer at dstOffset.
    */
  static memcpy(dst: ArrayBuffer, dstOffset: number, src: ArrayBuffer, srcOffset: number, byteLength: number): void {
    var dstU8 = new Uint8Array(dst, dstOffset, byteLength);
    var srcU8 = new Uint8Array(src, srcOffset, byteLength);
    dstU8.set(srcU8);
  }

  /**
    Converts array to native endianness in-place.
    */
  static arrayToNative(array: TypedArray, arrayIsLittleEndian: boolean): TypedArray {
    if (arrayIsLittleEndian == this.endianness) {
      return array;
    } else {
      return this.flipArrayEndianness(array);
    }
  }

  /**
    Converts native endianness array to desired endianness in-place.
    */
  static nativeToEndian(array: TypedArray, littleEndian: boolean): TypedArray {
    if (this.endianness == littleEndian) {
      return array;
    } else {
      return this.flipArrayEndianness(array);
    }
  }

  /**
    Flips typed array endianness in-place.
    */
  static flipArrayEndianness(array: TypedArray): TypedArray {
    var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    for (var i = 0; i < array.byteLength; i += array.BYTES_PER_ELEMENT) {
      for (var j = i + array.BYTES_PER_ELEMENT - 1, k = i; j > k; j--, k++) {
        var tmp = u8[k];
        u8[k] = u8[j];
        u8[j] = tmp;
      }
    }
    return array;
  }

  /**
    Creates a string from an array of character codes.
    */
  static createStringFromArray(array: ArrayLike<number>): string {
    var str = "";
    for (var i = 0; i < array.length; i++) {
      str += String.fromCharCode(array[i]);
    }
    return str;
  }

  position: number;
  endianness: boolean;
  failurePosition: number = 0;

  private _buffer!: ArrayBuffer;
  private _dataView!: DataView;
  private _byteOffset: number;
  private _byteLength: number = 0;
  private _dynamicSize: boolean = true;

  constructor(arrayBuffer?: ArrayBuffer | DataView | number, byteOffset?: number, endianness?: boolean) {
    this._byteOffset = byteOffset || 0;
    if (arrayBuffer instanceof ArrayBuffer) {
      this.buffer = arrayBuffer;
    } else if (typeof arrayBuffer == "object") {
      this.dataView = arrayBuffer as DataView;
      if (byteOffset) {
        this._byteOffset += byteOffset;
      }
    } else {
      this.buffer = new ArrayBuffer(arrayBuffer || 1);
    }
    this.position = 0;
    this.endianness = endianness == null ? DataStream.LITTLE_ENDIAN : endianness;
  }

  get dynamicSize(): boolean {
    return this._dynamicSize;
  }

  set dynamicSize(v: boolean) {
    if (!v) {
      this._trimAlloc();
    }
    this._dynamicSize = v;
  }

  /** Returns the byte length of the DataStream object. */
  get byteLength(): number {
    return this._byteLength - this._byteOffset;
  }

  /** Get/set the backing ArrayBuffer. The setter updates the DataView. */
  get buffer(): ArrayBuffer {
    this._trimAlloc();
    return this._buffer;
  }

  set buffer(v: ArrayBuffer) {
    this._buffer = v;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  /** Get/set the byteOffset. The setter updates the DataView. */
  get byteOffset(): number {
    return this._byteOffset;
  }

  set byteOffset(v: number) {
    this._byteOffset = v;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._buffer.byteLength;
  }

  /** Get/set the backing DataView. The setter updates buffer and byteOffset. */
  get dataView(): DataView {
    return this._dataView;
  }

  set dataView(v: DataView) {
    this._byteOffset = v.byteOffset;
    this._buffer = v.buffer as ArrayBuffer;
    this._dataView = new DataView(this._buffer, this._byteOffset);
    this._byteLength = this._byteOffset + v.byteLength;
  }

  /** Internal: resize the buffer when required. */
  _realloc(extra: number): void {
    if (!this._dynamicSize) {
      return;
    }
    var req = this._byteOffset + this.position + extra;
    var blen = this._buffer.byteLength;
    if (req <= blen) {
      if (req > this._byteLength) {
        this._byteLength = req;
      }
      return;
    }
    if (blen < 1) {
      blen = 1;
    }
    while (req > blen) {
      blen *= 2;
    }
    var buf = new ArrayBuffer(blen);
    var src = new Uint8Array(this._buffer);
    var dst = new Uint8Array(buf, 0, src.length);
    dst.set(src);
    this.buffer = buf;
    this._byteLength = req;
  }

  /** Internal: trim the buffer when virtual byteLength is smaller than buffer byteLength. */
  _trimAlloc(): void {
    if (this._byteLength == this._buffer.byteLength) {
      return;
    }
    var buf = new ArrayBuffer(this._byteLength);
    var dst = new Uint8Array(buf);
    var src = new Uint8Array(this._buffer, 0, dst.length);
    dst.set(src);
    this.buffer = buf;
  }

  /** Sets the read position. Clamps between 0 and byteLength. */
  seek(pos: number): void {
    var npos = Math.max(0, Math.min(this.byteLength, pos));
    this.position = (isNaN(npos) || !isFinite(npos)) ? 0 : npos;
  }

  /** Returns true if the seek pointer is at the end of the buffer. */
  isEof(): boolean {
    return (this.position >= this.byteLength);
  }

  // ---------------------------------------------------------------------------
  // map* methods
  // ---------------------------------------------------------------------------

  mapInt32Array(length: number, e?: boolean | null): Int32Array {
    this._realloc(length * 4);
    var arr = new Int32Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += length * 4;
    return arr;
  }

  mapInt16Array(length: number, e?: boolean | null): Int16Array {
    this._realloc(length * 2);
    var arr = new Int16Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += length * 2;
    return arr;
  }

  mapInt8Array(length: number): Int8Array {
    this._realloc(length * 1);
    var arr = new Int8Array(this._buffer, this.byteOffset + this.position, length);
    this.position += length * 1;
    return arr;
  }

  mapUint32Array(length: number, e?: boolean | null): Uint32Array {
    this._realloc(length * 4);
    var arr = new Uint32Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += length * 4;
    return arr;
  }

  mapUint16Array(length: number, e?: boolean | null): Uint16Array {
    this._realloc(length * 2);
    var arr = new Uint16Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += length * 2;
    return arr;
  }

  mapUint8Array(length: number): Uint8Array {
    this._realloc(length * 1);
    var arr = new Uint8Array(this._buffer, this.byteOffset + this.position, length);
    this.position += length * 1;
    return arr;
  }

  mapFloat64Array(length: number, e?: boolean | null): Float64Array {
    this._realloc(length * 8);
    var arr = new Float64Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += length * 8;
    return arr;
  }

  mapFloat32Array(length: number, e?: boolean | null): Float32Array {
    this._realloc(length * 4);
    var arr = new Float32Array(this._buffer, this.byteOffset + this.position, length);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += length * 4;
    return arr;
  }

  // ---------------------------------------------------------------------------
  // read*Array methods
  // ---------------------------------------------------------------------------

  readInt32Array(length?: number | null, e?: boolean | null): Int32Array {
    length = length == null ? (this.byteLength - this.position / 4) : length;
    var arr = new Int32Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += arr.byteLength;
    return arr;
  }

  readInt16Array(length?: number | null, e?: boolean | null): Int16Array {
    length = length == null ? (this.byteLength - this.position / 2) : length;
    var arr = new Int16Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += arr.byteLength;
    return arr;
  }

  readInt8Array(length?: number | null): Int8Array {
    length = length == null ? (this.byteLength - this.position) : length;
    var arr = new Int8Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    this.position += arr.byteLength;
    return arr;
  }

  readUint32Array(length?: number | null, e?: boolean | null): Uint32Array {
    length = length == null ? (this.byteLength - this.position / 4) : length;
    var arr = new Uint32Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += arr.byteLength;
    return arr;
  }

  readUint16Array(length?: number | null, e?: boolean | null): Uint16Array {
    length = length == null ? (this.byteLength - this.position / 2) : length;
    var arr = new Uint16Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += arr.byteLength;
    return arr;
  }

  readUint8Array(length?: number | null): Uint8Array {
    length = length == null ? (this.byteLength - this.position) : length;
    var arr = new Uint8Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    this.position += arr.byteLength;
    return arr;
  }

  readFloat64Array(length?: number | null, e?: boolean | null): Float64Array {
    length = length == null ? (this.byteLength - this.position / 8) : length;
    var arr = new Float64Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += arr.byteLength;
    return arr;
  }

  readFloat32Array(length?: number | null, e?: boolean | null): Float32Array {
    length = length == null ? (this.byteLength - this.position / 4) : length;
    var arr = new Float32Array(length);
    DataStream.memcpy(arr.buffer, 0,
                      this.buffer, this.byteOffset + this.position,
                      length * arr.BYTES_PER_ELEMENT);
    DataStream.arrayToNative(arr, e == null ? this.endianness : e);
    this.position += arr.byteLength;
    return arr;
  }

  // ---------------------------------------------------------------------------
  // Scalar read methods
  // ---------------------------------------------------------------------------

  readInt32(e?: boolean | null): number {
    var v = this._dataView.getInt32(this.position, e == null ? this.endianness : e);
    this.position += 4;
    return v;
  }

  readInt16(e?: boolean | null): number {
    var v = this._dataView.getInt16(this.position, e == null ? this.endianness : e);
    this.position += 2;
    return v;
  }

  readInt8(): number {
    var v = this._dataView.getInt8(this.position);
    this.position += 1;
    return v;
  }

  readUint32(e?: boolean | null): number {
    var v = this._dataView.getUint32(this.position, e == null ? this.endianness : e);
    this.position += 4;
    return v;
  }

  readUint16(e?: boolean | null): number {
    var v = this._dataView.getUint16(this.position, e == null ? this.endianness : e);
    this.position += 2;
    return v;
  }

  readUint8(): number {
    var v = this._dataView.getUint8(this.position);
    this.position += 1;
    return v;
  }

  readFloat32(e?: boolean | null): number {
    var v = this._dataView.getFloat32(this.position, e == null ? this.endianness : e);
    this.position += 4;
    return v;
  }

  readFloat64(e?: boolean | null): number {
    var v = this._dataView.getFloat64(this.position, e == null ? this.endianness : e);
    this.position += 8;
    return v;
  }

  // ---------------------------------------------------------------------------
  // Struct reading
  // ---------------------------------------------------------------------------

  /**
    Reads a struct of data from the DataStream. The struct is defined as
    a flat array of [name, type]-pairs.
    */
  readStruct(structDefinition: StructDefinition): Record<string, unknown> | null {
    var struct: Record<string, unknown> = {}, t, v;
    var p = this.position;
    for (var i = 0; i < structDefinition.length; i += 2) {
      t = structDefinition[i + 1];
      v = this.readType(t, struct);
      if (v == null) {
        if (this.failurePosition == 0) {
          this.failurePosition = this.position;
        }
        this.position = p;
        return null;
      }
      struct[structDefinition[i] as string] = v;
    }
    return struct;
  }

  /**
    Read UCS-2 string of desired length and endianness from the DataStream.
    */
  readUCS2String(length: number, endianness?: boolean): string {
    return DataStream.createStringFromArray(this.readUint16Array(length, endianness));
  }

  /**
    Read a string of desired length and encoding from the DataStream.
    */
  readString(length?: number | null, encoding?: string | null): string {
    if (encoding == null || encoding == "ASCII") {
      return DataStream.createStringFromArray(this.mapUint8Array(length == null ? this.byteLength - this.position : length));
    } else {
      return (new TextDecoder(encoding)).decode(this.mapUint8Array(length!));
    }
  }

  /**
    Read null-terminated string of desired length from the DataStream.
    */
  readCString(length?: number | null): string {
    var blen = this.byteLength - this.position;
    var u8 = new Uint8Array(this._buffer, this._byteOffset + this.position);
    var len = blen;
    if (length != null) {
      len = Math.min(length, blen);
    }
    for (var i = 0; i < len && u8[i] != 0; i++); // find first zero byte
    var s = DataStream.createStringFromArray(this.mapUint8Array(i));
    if (length != null) {
      this.position += len - i;
    } else if (i != blen) {
      this.position += 1; // trailing zero if not at end of buffer
    }
    return s;
  }

  /**
    Reads an object of type t from the DataStream, passing struct as the thus-far
    read struct to possible callbacks that refer to it.
    */
  readType(t: unknown, struct?: Record<string, unknown>): unknown {
    if (typeof t == "function") {
      return (t as (ds: DataStream, s: Record<string, unknown> | undefined) => unknown)(this, struct);
    } else if (typeof t == "object" && !(t instanceof Array)) {
      return (t as { get: (ds: DataStream, s: Record<string, unknown> | undefined) => unknown }).get(this, struct);
    } else if (t instanceof Array && t.length != 3) {
      return this.readStruct(t);
    }
    var v: unknown = null;
    var lengthOverride: number | null = null;
    var charset: string = "ASCII";
    var pos = this.position;
    var len: string;
    if (typeof t == 'string' && /:/.test(t)) {
      var tp = t.split(":");
      t = tp[0];
      len = tp[1];

      if (struct && struct[len] != null) {
        lengthOverride = parseInt(struct[len] as string);
      } else {
        lengthOverride = parseInt(tp[1]);
      }
    }
    if (typeof t == 'string' && /,/.test(t)) {
      var tp2 = t.split(",");
      t = tp2[0];
      charset = tp2[1];
    }
    switch (t) {

      case 'uint8':
        v = this.readUint8(); break;
      case 'int8':
        v = this.readInt8(); break;

      case 'uint16':
        v = this.readUint16(this.endianness); break;
      case 'int16':
        v = this.readInt16(this.endianness); break;
      case 'uint32':
        v = this.readUint32(this.endianness); break;
      case 'int32':
        v = this.readInt32(this.endianness); break;
      case 'float32':
        v = this.readFloat32(this.endianness); break;
      case 'float64':
        v = this.readFloat64(this.endianness); break;

      case 'uint16be':
        v = this.readUint16(DataStream.BIG_ENDIAN); break;
      case 'int16be':
        v = this.readInt16(DataStream.BIG_ENDIAN); break;
      case 'uint32be':
        v = this.readUint32(DataStream.BIG_ENDIAN); break;
      case 'int32be':
        v = this.readInt32(DataStream.BIG_ENDIAN); break;
      case 'float32be':
        v = this.readFloat32(DataStream.BIG_ENDIAN); break;
      case 'float64be':
        v = this.readFloat64(DataStream.BIG_ENDIAN); break;

      case 'uint16le':
        v = this.readUint16(DataStream.LITTLE_ENDIAN); break;
      case 'int16le':
        v = this.readInt16(DataStream.LITTLE_ENDIAN); break;
      case 'uint32le':
        v = this.readUint32(DataStream.LITTLE_ENDIAN); break;
      case 'int32le':
        v = this.readInt32(DataStream.LITTLE_ENDIAN); break;
      case 'float32le':
        v = this.readFloat32(DataStream.LITTLE_ENDIAN); break;
      case 'float64le':
        v = this.readFloat64(DataStream.LITTLE_ENDIAN); break;

      case 'cstring':
        v = this.readCString(lengthOverride); break;

      case 'string':
        v = this.readString(lengthOverride, charset); break;

      case 'u16string':
        v = this.readUCS2String(lengthOverride!, this.endianness); break;

      case 'u16stringle':
        v = this.readUCS2String(lengthOverride!, DataStream.LITTLE_ENDIAN); break;

      case 'u16stringbe':
        v = this.readUCS2String(lengthOverride!, DataStream.BIG_ENDIAN); break;

      default:
        if ((t as unknown[]).length == 3) {
          var ta = (t as unknown[])[1];
          var tlen = (t as unknown[])[2];
          var length = 0;
          if (typeof tlen == 'function') {
            length = tlen(struct, this, t);
          } else if (typeof tlen == 'string' && struct && struct[tlen] != null) {
            length = parseInt(struct[tlen] as string);
          } else {
            length = parseInt(tlen as string);
          }
          if (typeof ta == "string") {
            var tap = ta.replace(/(le|be)$/, '');
            var endianness: boolean | null = null;
            if (/le$/.test(ta)) {
              endianness = DataStream.LITTLE_ENDIAN;
            } else if (/be$/.test(ta)) {
              endianness = DataStream.BIG_ENDIAN;
            }
            if (tlen == '*') {
              length = null as unknown as number;
            }
            switch (tap) {
              case 'uint8':
                v = this.readUint8Array(length); break;
              case 'uint16':
                v = this.readUint16Array(length, endianness); break;
              case 'uint32':
                v = this.readUint32Array(length, endianness); break;
              case 'int8':
                v = this.readInt8Array(length); break;
              case 'int16':
                v = this.readInt16Array(length, endianness); break;
              case 'int32':
                v = this.readInt32Array(length, endianness); break;
              case 'float32':
                v = this.readFloat32Array(length, endianness); break;
              case 'float64':
                v = this.readFloat64Array(length, endianness); break;
              case 'cstring':
              case 'utf16string':
              case 'string':
                if (length == null) {
                  v = [];
                  while (!this.isEof()) {
                    var u = this.readType(ta, struct);
                    if (u == null) break;
                    (v as unknown[]).push(u);
                  }
                } else {
                  v = new Array(length);
                  for (var i = 0; i < length; i++) {
                    (v as unknown[])[i] = this.readType(ta, struct);
                  }
                }
                break;
            }
          } else {
            if (tlen == '*') {
              v = [];
              this.buffer;
              while (true) {
                var p = this.position;
                try {
                  var o = this.readType(ta, struct);
                  if (o == null) {
                    this.position = p;
                    break;
                  }
                  (v as unknown[]).push(o);
                } catch (e) {
                  this.position = p;
                  break;
                }
              }
            } else {
              v = new Array(length);
              for (var i = 0; i < length; i++) {
                var u2 = this.readType(ta, struct);
                if (u2 == null) return null;
                (v as unknown[])[i] = u2;
              }
            }
          }
          break;
        }
    }
    if (lengthOverride != null) {
      this.position = pos + lengthOverride;
    }
    return v;
  }
}
