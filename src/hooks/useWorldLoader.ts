import { useCallback, useRef, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import type { WorldData } from '../types/settings';

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

    worker.addEventListener('message', (e: MessageEvent) => {
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
        w.tiles = [];
        w.chests = [];
        w.signs = [];
        w.npcs = [];
        worldRef.current = w;
        canvasRef.current?.setWorldSize(w.width, w.height);
        onWorldSized?.();
        setStatus(statusRef.current);
      }

      if (e.data.tiles) {
        const w = worldRef.current!;
        const tiles = e.data.tiles;
        canvasRef.current?.renderTileBatch(tiles, e.data.x, w);

        const len = tiles.length;
        for (let i = 0; i < len; i++) {
          w.tiles.push(tiles[i]);
        }
      }

      if (e.data.done) {
        const w = worldRef.current!;
        canvasRef.current?.finishRender(w.width);
      }

      if (e.data.chests) {
        const w = worldRef.current!;
        w.chests = e.data.chests;

        for (let i = 0; i < e.data.chests.length; i++) {
          const chest = e.data.chests[i];
          let idx = chest.x * w.height + chest.y;
          w.tiles[idx].chest = chest;
          w.tiles[idx + 1].chest = chest;
          idx = (chest.x + 1) * w.height + chest.y;
          w.tiles[idx].chest = chest;
          w.tiles[idx + 1].chest = chest;
        }
      }

      if (e.data.signs) {
        const w = worldRef.current!;
        w.signs = e.data.signs;

        for (let i = 0; i < e.data.signs.length; i++) {
          const sign = e.data.signs[i];
          let idx = sign.x * w.height + sign.y;
          w.tiles[idx].sign = sign;
          w.tiles[idx + 1].sign = sign;
          idx = (sign.x + 1) * w.height + sign.y;
          w.tiles[idx].sign = sign;
          w.tiles[idx + 1].sign = sign;
        }
      }

      if (e.data.npcs) {
        const w = worldRef.current!;
        w.npcs = e.data.npcs;
      }

      if (e.data.tileEntities) {
        const w = worldRef.current!;
        for (const [pos, entity] of e.data.tileEntities.entries()) {
          const idx = pos.x * w.height + pos.y;
          const tile = w.tiles[idx];
          if (tile) {
            const size = tile.info && 'Size' in tile.info ? tile.info.Size : undefined;
            let sizeX = 1;
            let sizeY = 1;
            if (size) {
              sizeX = parseInt(size[0]);
              sizeY = parseInt(size[2]);
            }
            for (let x = 0; x < sizeX; x++) {
              for (let y = 0; y < sizeY; y++) {
                const tileIdx = (pos.x + x) * w.height + pos.y + y;
                if (w.tiles[tileIdx]) {
                  w.tiles[tileIdx].tileEntity = entity;
                }
              }
            }
          }
        }
      }

      if (e.data.done) {
        setWorld(worldRef.current);
        setIsLoading(false);
        setStatus(undefined);
        worker.terminate();
        workerRef.current = null;
      }
    });

    worker.postMessage(file);
  }, [canvasRef]);

  return { world, worldRef, status, isLoading, loadWorldFile };
}
