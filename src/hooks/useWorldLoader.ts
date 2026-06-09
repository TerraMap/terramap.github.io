import { useCallback, useRef, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import { getTileInfo } from '../lib/tileInfo';
import type { Chest, Sign, TileEntity, WorldData, WorldNpc } from '../types/settings';

function buildItemIndex(w: WorldData): void {
  const height = w.height;
  const searchSets = new Map<number, Set<number>>();   // deduplicated: one origin per chest per item
  const highlightBuckets = new Map<number, number[]>(); // all chest tiles (4) + entity origin

  function addSearch(id: number, originIdx: number) {
    let s = searchSets.get(id);
    if (!s) { s = new Set(); searchSets.set(id, s); }
    s.add(originIdx);
  }
  function addHighlight(id: number, idx: number) {
    let b = highlightBuckets.get(id);
    if (!b) { b = []; highlightBuckets.set(id, b); }
    b.push(idx);
  }

  for (const chest of w.chests) {
    const x0 = chest.x, y0 = chest.y;
    const originIdx = x0 * height + y0;
    for (const item of chest.items) {
      if (item.id > 0) {
        addSearch(item.id, originIdx);
        addHighlight(item.id, originIdx);
        addHighlight(item.id, x0 * height + y0 + 1);
        addHighlight(item.id, (x0 + 1) * height + y0);
        addHighlight(item.id, (x0 + 1) * height + y0 + 1);
      }
    }
  }

  const seen = new Set<TileEntity>();
  if (w.entityByIdx) {
    for (const entity of w.entityByIdx.values()) {
      if (seen.has(entity)) continue;
      seen.add(entity);
      const originIdx = entity.position.x * height + entity.position.y;
      const add = (item: { id: number } | undefined) => {
        if (!item || item.id === 0) return;
        addSearch(item.id, originIdx);
        addHighlight(item.id, originIdx);
      };
      switch (entity.type) {
        case 1: case 4: case 6: add(entity.item); break;
        case 3: case 5:
          entity.items?.forEach(add);
          entity.dyes?.forEach(add);
          break;
      }
    }
  }

  w.itemIdx = new Map();
  for (const [id, s] of searchSets) {
    const arr = Array.from(s).sort((a, b) => a - b);
    w.itemIdx.set(id, new Uint32Array(arr));
  }
  w.itemHighlightIdx = new Map();
  for (const [id, arr] of highlightBuckets) {
    arr.sort((a, b) => a - b);
    w.itemHighlightIdx.set(id, new Uint32Array(arr));
  }
}

function buildTileIndex(w: WorldData): void {
  const total = w.width * w.height;
  const rawFlags1 = w.rawFlags1!;
  const rawTypes = w.rawTypes!;
  const rawWallTypes = w.rawWallTypes!;
  const tileBuckets = new Map<number, number[]>();
  const wallBuckets = new Map<number, number[]>();
  let i = 0;
  const chunk = () => {
    const deadline = performance.now() + 50;
    while (i < total && performance.now() < deadline) {
      const f1 = rawFlags1[i];
      if (f1 & 0x01) {
        const t = rawTypes[i];
        let b = tileBuckets.get(t);
        if (!b) { b = []; tileBuckets.set(t, b); }
        b.push(i);
      }
      if (f1 & 0x02) {
        const wt = rawWallTypes[i];
        if (wt > 0) {
          let b = wallBuckets.get(wt);
          if (!b) { b = []; wallBuckets.set(wt, b); }
          b.push(i);
        }
      }
      i++;
    }
    if (i < total) {
      setTimeout(chunk, 0);
    } else {
      w.tileTypeIdx = new Map();
      for (const [t, arr] of tileBuckets) w.tileTypeIdx.set(t, new Uint32Array(arr));
      w.wallTypeIdx = new Map();
      for (const [wt, arr] of wallBuckets) w.wallTypeIdx.set(wt, new Uint32Array(arr));
    }
  };
  setTimeout(chunk, 0);
}

interface TileData {
  types: ArrayBuffer;
  wallTypes: ArrayBuffer;
  textureU: ArrayBuffer;
  textureV: ArrayBuffer;
  tileColors: ArrayBuffer;
  wallColors: ArrayBuffer;
  liquidAmounts: ArrayBuffer;
  flags1: ArrayBuffer;
  flags2: ArrayBuffer;
  flags3: ArrayBuffer;
  count: number;
}

interface WorkerMessage {
  status?: string;
  version?: number;
  world?: WorldData;
  tileData?: TileData;
  done?: boolean;
  chests?: Chest[];
  signs?: Sign[];
  npcs?: WorldNpc[];
  tileEntities?: Map<{ x: number; y: number }, TileEntity>;
}

export function useWorldLoader(canvasRef: React.RefObject<CanvasContainerHandle | null>, onWorldSized?: () => void) {
  const [world, setWorld] = useState<WorldData | null>(null);
  const [status, setStatus] = useState<string | undefined>('Please choose a Terraria .wld file');
  const [isLoading, setIsLoading] = useState(false);
  const worldRef = useRef<WorldData | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const statusRef = useRef(status);
  const lastStatusFlush = useRef(0);

  const loadWorldFile = useCallback((file: File) => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setIsLoading(true);
    setStatus('Loading...');

    const worker = new Worker(new URL('../WorldLoader.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    let renderDone = false;
    let workerDone = false;
    const tryFinishLoad = () => {
      if (renderDone && workerDone) {
        setIsLoading(false);
        setStatus(undefined);
      }
    };

    worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
      if (e.data.status) {
        statusRef.current = e.data.status;
        const now = performance.now();
        if (now - lastStatusFlush.current > 200) {
          lastStatusFlush.current = now;
          setStatus(e.data.status);
        }
      }

      if (e.data.world) {
        const w = e.data.world;
        w.chests = [];
        w.signs = [];
        w.npcs = [];
        w.chestByIdx = new Map();
        w.signByIdx = new Map();
        w.entityByIdx = new Map();
        worldRef.current = w;
        canvasRef.current?.setWorldSize(w.width, w.height);
        onWorldSized?.();
        setStatus(statusRef.current);
      }

      if (e.data.tileData) {
        const td = e.data.tileData;
        const w = worldRef.current!;

        // Attach raw TypedArrays to world — renderColumnRange reads these directly,
        // eliminating ~5M WorldTile object allocations from the render hot path.
        w.rawTypes         = new Uint16Array(td.types);
        w.rawWallTypes     = new Uint16Array(td.wallTypes);
        w.rawTextureU      = new Int16Array(td.textureU);
        w.rawTextureV      = new Int16Array(td.textureV);
        w.rawTileColors    = new Uint8Array(td.tileColors);
        w.rawWallColors    = new Uint8Array(td.wallColors);
        w.rawLiquidAmounts = new Uint8Array(td.liquidAmounts);
        w.rawFlags1        = new Uint8Array(td.flags1);
        w.rawFlags2        = new Uint8Array(td.flags2);
        w.rawFlags3        = new Uint8Array(td.flags3);

        // Phase 1: render canvas columns directly from TypedArrays.
        let col = 0;
        const renderChunk = () => {
          const msg = `Rendering world... ${Math.round(col / w.width * 100)}%`;
          statusRef.current = msg;
          const now = performance.now();
          if (now - lastStatusFlush.current > 200) {
            lastStatusFlush.current = now;
            setStatus(msg);
          }
          const deadline = performance.now() + 100;
          while (col < w.width && performance.now() < deadline) {
            canvasRef.current?.renderColumnRange(w, col, col + 1);
            col++;
          }
          if (col < w.width) {
            setTimeout(renderChunk, 0);
          } else {
            canvasRef.current?.finishRender(w.width);
            renderDone = true;
            tryFinishLoad();
            buildTileIndex(w);
          }
        };
        renderChunk();
      }

      if (e.data.chests) {
        const w = worldRef.current!;
        const chests = e.data.chests;
        w.chests = chests;
        for (let i = 0; i < chests.length; i++) {
          const chest = chests[i];
          const idx0 = chest.x * w.height + chest.y;
          w.chestByIdx!.set(idx0, chest);
          w.chestByIdx!.set(idx0 + 1, chest);
          const idx1 = (chest.x + 1) * w.height + chest.y;
          w.chestByIdx!.set(idx1, chest);
          w.chestByIdx!.set(idx1 + 1, chest);
        }
      }

      if (e.data.signs) {
        const w = worldRef.current!;
        const signs = e.data.signs;
        w.signs = signs;
        for (let i = 0; i < signs.length; i++) {
          const sign = signs[i];
          const idx0 = sign.x * w.height + sign.y;
          w.signByIdx!.set(idx0, sign);
          w.signByIdx!.set(idx0 + 1, sign);
          const idx1 = (sign.x + 1) * w.height + sign.y;
          w.signByIdx!.set(idx1, sign);
          w.signByIdx!.set(idx1 + 1, sign);
        }
      }

      if (e.data.npcs) {
        worldRef.current!.npcs = e.data.npcs;
      }

      if (e.data.tileEntities) {
        const entities = e.data.tileEntities;
        const w = worldRef.current!;
        for (const [pos, entity] of entities.entries()) {
          const idx = pos.x * w.height + pos.y;
          let sizeX = 1, sizeY = 1;
          if (w.rawFlags1 && (w.rawFlags1[idx] & 0x01)) {
            const info = getTileInfo({
              Type: w.rawTypes![idx],
              TextureU: w.rawTextureU![idx],
              TextureV: w.rawTextureV![idx],
            });
            const size = info && 'size' in info ? info.size : undefined;
            if (size) { sizeX = parseInt(size[0]); sizeY = parseInt(size[2]); }
          }
          for (let x = 0; x < sizeX; x++) {
            for (let y = 0; y < sizeY; y++) {
              w.entityByIdx!.set((pos.x + x) * w.height + pos.y + y, entity);
            }
          }
        }
      }

      if (e.data.done) {
        buildItemIndex(worldRef.current!);
        setWorld(worldRef.current);
        workerDone = true;
        tryFinishLoad();
        worker.terminate();
        workerRef.current = null;
      }
    });

    worker.postMessage(file);
  }, [canvasRef, onWorldSized]);

  return { world, worldRef, status, isWorldLoading: isLoading, loadWorldFile };
}
