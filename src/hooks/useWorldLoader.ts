import { useCallback, useRef, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import { getTileInfo } from '../lib/tileInfo';
import type { Chest, Sign, TileEntity, WorldData, WorldNpc, WorldTile } from '../types/settings';

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
        w.tiles = new Array<WorldTile>(w.width * w.height);
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
