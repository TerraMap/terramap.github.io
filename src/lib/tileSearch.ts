import { tiles } from '../tiles';
import type { ItemInfo, TileFrame, TileInfo, WallInfo, WorldData } from '../types/settings';

export interface IndexEntry {
  indices: Uint32Array;
  filter?: (idx: number) => boolean;
}

export type SearchableInfo = TileFrame | TileInfo | ItemInfo | WallInfo;

export function getTileInfoFrom(id: string, u: string | undefined, v: string | undefined): TileFrame | TileInfo | undefined {
  const tileInfo = tiles.at(Number(id));

  if (tileInfo?.frames) {
    for (let frameIndex = 0; frameIndex < tileInfo.frames.length; frameIndex++) {
      const frame = tileInfo.frames[frameIndex];

      if (u != frame.u)
        continue;

      if (v != frame.v)
        continue;

      frame.parent = tileInfo;

      return frame;
    }
  }

  return tileInfo;
}

// Build index entries for highlighting (no origin filter — shows all tiles of each match).
// Checks each index type on demand so mixed tile+item searches work once all indices are ready.
// Returns null if a required index isn't ready yet.
export function buildHighlightEntries(infos: SearchableInfo[], world: WorldData): IndexEntry[] | null {
  const entries: IndexEntry[] = [];
  for (const info of infos) {
    if ('isTile' in info && info.isTile) {
      if (!world.tileTypeIdx) return null;
      const ru = world.rawTextureU!, rv = world.rawTextureV!;
      if ('parent' in info && info.parent) {
        const frame = info as TileFrame;
        const indices = world.tileTypeIdx.get(frame.parent!.id);
        if (!indices) continue;
        const u = frame.u ?? 0, v = frame.v ?? 0;
        entries.push({ indices, filter: (idx) => ru[idx] === u && rv[idx] === v });
      } else if ('id' in info) {
        const indices = world.tileTypeIdx.get(info.id);
        if (!indices) continue;
        entries.push({ indices });
      }
    } else if ('isWall' in info && info.isWall) {
      if (!world.wallTypeIdx) return null;
      const indices = world.wallTypeIdx.get(info.id);
      if (!indices) continue;
      entries.push({ indices });
    } else if ('isItem' in info && info.isItem) {
      if (!world.itemHighlightIdx) return null;
      const indices = world.itemHighlightIdx.get(info.id);
      if (!indices) continue;
      entries.push({ indices });
    } else {
      return null;
    }
  }
  return entries.length > 0 ? entries : null;
}

// Build index entries for search (origin tiles only).
// Returns null if a required index isn't ready yet.
export function buildSearchEntries(infos: SearchableInfo[], world: WorldData): IndexEntry[] | null {
  const entries: IndexEntry[] = [];
  for (const info of infos) {
    if ('isTile' in info && info.isTile) {
      if (!world.tileTypeIdx) return null;
      const ru = world.rawTextureU!, rv = world.rawTextureV!;
      if ('parent' in info && info.parent) {
        const frame = info as TileFrame;
        const indices = world.tileTypeIdx.get(frame.parent!.id);
        if (!indices) continue;
        const u = frame.u ?? 0, v = frame.v ?? 0;
        entries.push({ indices, filter: (idx) => ru[idx] === u && rv[idx] === v });
      } else if ('id' in info) {
        const indices = world.tileTypeIdx.get(info.id);
        if (!indices) continue;
        const tileFrames = tiles[info.id]?.frames;
        if (!tileFrames || tileFrames.length === 0) {
          entries.push({ indices });
        } else {
          const originSet = new Set(tileFrames.map(f => (f.u ?? 0) * 65536 + (f.v ?? 0)));
          entries.push({ indices, filter: (idx) => originSet.has(ru[idx] * 65536 + rv[idx]) });
        }
      }
    } else if ('isWall' in info && info.isWall) {
      if (!world.wallTypeIdx) return null;
      const indices = world.wallTypeIdx.get(info.id);
      if (!indices) continue;
      entries.push({ indices });
    } else if ('isItem' in info && info.isItem) {
      if (!world.itemIdx) return null;
      const indices = world.itemIdx.get(info.id);
      if (!indices) continue;
      entries.push({ indices });
    } else {
      return null;
    }
  }
  return entries.length > 0 ? entries : null;
}

function findAfter(sorted: Uint32Array, currentIdx: number, filter?: (idx: number) => boolean, explored?: Uint8Array | null): number | null {
  const n = sorted.length;
  if (n === 0) return null;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] <= currentIdx) lo = mid + 1;
    else hi = mid;
  }
  for (let j = 0; j < n; j++) {
    const idx = sorted[(lo + j) % n];
    if (idx === currentIdx) continue;
    if (explored && !explored[idx]) continue;
    if (filter && !filter(idx)) continue;
    return idx;
  }
  return null;
}

function findBefore(sorted: Uint32Array, currentIdx: number, filter?: (idx: number) => boolean, explored?: Uint8Array | null): number | null {
  const n = sorted.length;
  if (n === 0) return null;
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < currentIdx) lo = mid + 1;
    else hi = mid;
  }
  const start = (lo - 1 + n) % n;
  for (let j = 0; j < n; j++) {
    const idx = sorted[(start - j + n) % n];
    if (idx === currentIdx) continue;
    if (explored && !explored[idx]) continue;
    if (filter && !filter(idx)) continue;
    return idx;
  }
  return null;
}

export function findNextByIndex(
  entries: IndexEntry[],
  currentIdx: number,
  direction: number,
  total: number,
  explored?: Uint8Array | null
): number | null {
  let best: number | null = null;
  for (const { indices, filter } of entries) {
    const candidate = direction > 0
      ? findAfter(indices, currentIdx, filter, explored)
      : findBefore(indices, currentIdx, filter, explored);
    if (candidate === null) continue;
    if (best === null) {
      best = candidate;
    } else {
      const dCand = direction > 0 ? (candidate - currentIdx + total) % total : (currentIdx - candidate + total) % total;
      const dBest  = direction > 0 ? (best      - currentIdx + total) % total : (currentIdx - best      + total) % total;
      if (dCand < dBest) best = candidate;
    }
  }
  return best;
}
