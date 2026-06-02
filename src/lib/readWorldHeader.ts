export interface WorldHeader {
  height: number;
  id: number;
  name: string;
  seed: string;
  uniqueId: string;
  version: number;
  width: number;
}

export function readWorldHeader(buffer: ArrayBuffer): WorldHeader {
  const view = new DataView(buffer);
  let pos = 0;

  const readInt16 = () => { const v = view.getInt16(pos, true); pos += 2; return v; };
  const readInt32 = () => { const v = view.getInt32(pos, true); pos += 4; return v; };
  const readUint8 = () => { const v = view.getUint8(pos); pos += 1; return v; };
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

  // file metadata (uint64)
  readUint32(); readUint32();
  // revision
  readUint32();
  // isFavorite (uint64)
  readUint32(); readUint32();

  // positions array
  const positionsLength = readInt16();
  for (let i = 0; i < positionsLength; i++) readInt32();

  // importance bit array
  const importanceLength = readInt16();
  let b2 = 128;
  for (let i = 0; i < importanceLength; i++) {
    if (b2 === 128) { readUint8(); b2 = 1; } else { b2 <<= 1; }
  }

  // world name (length-prefixed string)
  const nameLen = read7BitEncodedInt();
  const nameBytes = new Uint8Array(buffer, pos, nameLen);
  const name = new TextDecoder().decode(nameBytes);
  pos += nameLen;

  // seed (length-prefixed string)
  const seedLen = read7BitEncodedInt();
  const seedBytes = new Uint8Array(buffer, pos, seedLen);
  const seed = new TextDecoder().decode(seedBytes);
  pos += seedLen;

  // worldGeneratorVersion (uint64)
  readUint32(); readUint32();

  // uniqueId (16 bytes, .NET Guid)
  const uuidBytes: number[] = [];
  for (let i = 0; i < 16; i++) uuidBytes.push(readUint8());
  const hex = uuidBytes.map(b => b.toString(16).padStart(2, '0'));
  const uniqueId = [
    hex.slice(0, 4).reverse().join(''),
    hex.slice(4, 6).reverse().join(''),
    hex.slice(6, 8).reverse().join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');

  const id = readInt32();

  readInt32(); // left
  readInt32(); // right
  readInt32(); // top
  readInt32(); // bottom

  const height = readInt32();
  const width = readInt32();

  return { height, id, name, seed, uniqueId, version, width };
}
