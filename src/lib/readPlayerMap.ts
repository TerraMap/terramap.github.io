export interface PlayerMap {
  width: number;
  height: number;
  explored: Uint8Array;
}

export async function readPlayerMap(file: File): Promise<PlayerMap> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  let pos = 0;

  const readUint8 = () => view.getUint8(pos++);
  const readInt16 = () => { const v = view.getInt16(pos, true); pos += 2; return v; };
  const readInt32 = () => { const v = view.getInt32(pos, true); pos += 4; return v; };
  const readUint32 = () => { const v = view.getUint32(pos, true); pos += 4; return v; };

  function read7BitEncodedInt(): number {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = readUint8();
      result |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);
    return result;
  }

  const version = readInt32();

  // magic "relogic" + file type + revision + favorite
  // FileMetadata.Read for version >= 135
  pos += 7;
  readUint8();
  readUint32();
  readUint32(); readUint32();

  const nameLen = read7BitEncodedInt();
  pos += nameLen;

  readInt32(); // world id

  const height = readInt32();
  const width = readInt32();

  const tileCount = readInt16();
  const wallCount = readInt16();
  readInt16(); readInt16(); readInt16(); readInt16();

  // tile option bit array
  const tileHasOptions: boolean[] = new Array(tileCount);
  let b = 0, b2 = 128;
  for (let i = 0; i < tileCount; i++) {
    if (b2 === 128) { b = readUint8(); b2 = 1; }
    else { b2 <<= 1; }
    tileHasOptions[i] = (b & b2) === b2;
  }

  // wall option bit array
  const wallHasOptions: boolean[] = new Array(wallCount);
  b = 0; b2 = 128;
  for (let i = 0; i < wallCount; i++) {
    if (b2 === 128) { b = readUint8(); b2 = 1; }
    else { b2 <<= 1; }
    wallHasOptions[i] = (b & b2) === b2;
  }

  // skip tile option counts
  for (let i = 0; i < tileCount; i++) {
    if (tileHasOptions[i]) readUint8();
  }
  // skip wall option counts
  for (let i = 0; i < wallCount; i++) {
    if (wallHasOptions[i]) readUint8();
  }

  // remaining data is wrapped in a DeflateStream (raw deflate)
  const compressed = new Uint8Array(buffer, pos);
  const data = await decompressRawDeflate(compressed);

  // row-major explored grid: iterate y (rows) then x (columns)
  // RLE runs are horizontal (across x within a row)
  const explored = new Uint8Array(width * height);

  let dpos = 0;
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      const b3 = data[dpos++];

      // optional second header byte
      let b4 = 0;
      if (b3 & 1) b4 = data[dpos++];

      // optional third header byte
      if (b4 & 1) dpos++;

      const classification = (b3 >> 1) & 0x07;

      // type id for classifications that have one
      const hasType = classification === 1 || classification === 2 || classification === 7;
      if (hasType) {
        if (b3 & 0x10) dpos += 2; // uint16
        else dpos += 1; // uint8
      }

      // light byte
      let light = 255;
      if (b3 & 0x20) light = data[dpos++];

      // RLE count - bits 6-7 of b3
      const rleBits = (b3 >> 6) & 0x03;
      let rle = 0;
      if (rleBits === 1) rle = data[dpos++];
      else if (rleBits === 2) { rle = data[dpos] | (data[dpos + 1] << 8); dpos += 2; }

      if (classification === 0) {
        // unexplored tiles - skip
        x += rle + 1;
      } else {
        // explored tiles
        for (let dx = 0; dx <= rle; dx++) {
          explored[(x + dx) * height + y] = 1;
          // when light != 255, each RLE tile has its own light byte (skip it)
          if (dx > 0 && light !== 255) dpos++;
        }
        x += rle + 1;
      }
    }
  }

  console.log('map v' + version, width + 'x' + height,
    'explored:', explored.reduce((a, b) => a + b, 0), 'of', width * height);

  return { width, height, explored };
}

async function decompressRawDeflate(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressed as unknown as BufferSource);
  writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
