import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { usePanZoom } from '../hooks/usePanZoom';
import { getTileColorRaw } from '../lib/mapRenderer';
import type { PlayerMap } from '../lib/readPlayerMap';
import type { IndexEntry } from '../lib/tileSearch';
import type { WorldData } from '../types/settings';

export interface CanvasContainerHandle {
  setWorldSize: (width: number, height: number) => void;
  renderColumnRange: (world: WorldData, startCol: number, endCol: number) => void;
  finishRender: (worldWidth: number) => void;
  highlightByIndex: (entries: IndexEntry[], world: WorldData, playerMap: PlayerMap | null, onProgress?: (pct: number, matchCount: number) => void) => void;
  renderWireOverlay: (world: WorldData) => void;
  clearWireOverlay: () => void;
  renderFogOverlay: (playerMap: PlayerMap) => void;
  clearFogOverlay: () => void;
  drawSelection: (x: number, y: number) => void;
  panToTile: (x: number, y: number) => void;
  clearOverlay: () => void;
  clearSelection: () => void;
  saveImage: (filename: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

interface CanvasContainerProps {
  onTileHover?: (x: number, y: number) => void;
  onTileClick?: (x: number, y: number) => void;
  handleTileDoubleClick?: () => void;
}

const BUFFER_WIDTH = 200;

export const CanvasContainer = forwardRef<CanvasContainerHandle, CanvasContainerProps>(
  function CanvasContainer({ onTileHover, onTileClick, handleTileDoubleClick }, ref) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const panzoomRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const wireRef = useRef<HTMLCanvasElement>(null);
    const fogRef = useRef<HTMLCanvasElement>(null);
    const selectionRef = useRef<HTMLCanvasElement>(null);
    const pixelsRef = useRef<Uint8ClampedArray | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const wireCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const fogCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const selectionCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const highlightIdRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);

    const { zoomIn, zoomOut, reset, panToPoint } = usePanZoom(panzoomRef);

    const getMousePos = useCallback((evt: MouseEvent | PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: Math.floor((evt.clientX - rect.left) * scaleX),
        y: Math.floor((evt.clientY - rect.top) * scaleY),
      };
    }, []);

    useEffect(() => {
      const el = panzoomRef.current;
      if (!el) return;

      const handleMouseMove = (evt: MouseEvent) => {
        const pos = getMousePos(evt);
        onTileHover?.(pos.x, pos.y);
      };

      const handlePointerDown = (evt: PointerEvent) => {
        dragStartRef.current = { x: evt.clientX, y: evt.clientY };
        isDraggingRef.current = false;
      };

      const handlePointerMove = (evt: PointerEvent) => {
        if (dragStartRef.current) {
          const dx = evt.clientX - dragStartRef.current.x;
          const dy = evt.clientY - dragStartRef.current.y;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            isDraggingRef.current = true;
          }
        }
      };

      const handlePointerUp = (evt: PointerEvent) => {
        if (!isDraggingRef.current) {
          const pos = getMousePos(evt);
          onTileClick?.(pos.x, pos.y);
        }
        dragStartRef.current = null;
        isDraggingRef.current = false;
      };

      const handleDblClick = () => {
        handleTileDoubleClick?.();
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('pointerdown', handlePointerDown);
      el.addEventListener('pointermove', handlePointerMove);
      el.addEventListener('pointerup', handlePointerUp);
      el.addEventListener('dblclick', handleDblClick);

      return () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('pointerdown', handlePointerDown);
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerup', handlePointerUp);
        el.removeEventListener('dblclick', handleDblClick);
      };
    }, [getMousePos, onTileHover, onTileClick, handleTileDoubleClick]);

    const fitToContainer = useCallback(() => {
      const el = panzoomRef.current;
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!el || !canvas || !wrapper) return;
      const displayWidth = wrapper.clientWidth;
      const ratio = canvas.height / canvas.width;
      const displayHeight = displayWidth * ratio;
      for (const c of [el, canvas, overlayRef.current!, wireRef.current!, fogRef.current!, selectionRef.current!]) {
        c.style.width = `${displayWidth}px`;
        c.style.height = `${displayHeight}px`;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      setWorldSize(width: number, height: number) {
        const el = panzoomRef.current!;
        const canvas = canvasRef.current!;
        const overlay = overlayRef.current!;
        const wire = wireRef.current!;
        const fog = fogRef.current!;
        const selection = selectionRef.current!;

        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        canvas.width = width;
        canvas.height = height;
        overlay.width = width;
        overlay.height = height;
        wire.width = width;
        wire.height = height;
        fog.width = width;
        fog.height = height;
        selection.width = width;
        selection.height = height;

        ctxRef.current = canvas.getContext('2d')!;
        overlayCtxRef.current = overlay.getContext('2d')!;
        wireCtxRef.current = wire.getContext('2d')!;
        fogCtxRef.current = fog.getContext('2d')!;
        selectionCtxRef.current = selection.getContext('2d')!;

        fitToContainer();

        pixelsRef.current = new Uint8ClampedArray(4 * BUFFER_WIDTH * height);
      },

      renderColumnRange(world: WorldData, startCol: number, endCol: number) {
        const ctx = ctxRef.current!;
        const pixels = pixelsRef.current!;
        const height = world.height;

        for (let x = startCol; x < endCol; x++) {
          const bufferStart = BUFFER_WIDTH * Math.floor(x / BUFFER_WIDTH);
          if (x % BUFFER_WIDTH === 0 && x > 0) {
            const imageData = new ImageData(pixels as unknown as Uint8ClampedArray<ArrayBuffer>, BUFFER_WIDTH);
            ctx.putImageData(imageData, bufferStart - BUFFER_WIDTH, 0);
          }
          const colBase = x * height;
          for (let y = 0; y < height; y++) {
            const idx = colBase + y;
            let c = getTileColorRaw(y, idx, world);
            if (!c) c = { r: 0, g: 0, b: 0 };
            const pxIdx = 4 * (y * BUFFER_WIDTH + x - bufferStart);
            pixels[pxIdx] = c.r;
            pixels[pxIdx + 1] = c.g;
            pixels[pxIdx + 2] = c.b;
            pixels[pxIdx + 3] = 255;
          }
        }
      },

      finishRender(worldWidth: number) {
        const ctx = ctxRef.current!;
        const pixels = pixelsRef.current!;
        const bufferStart = BUFFER_WIDTH * Math.floor((worldWidth - 1) / BUFFER_WIDTH);
        const imageData = new ImageData(pixels as unknown as Uint8ClampedArray<ArrayBuffer>, BUFFER_WIDTH);
        ctx.putImageData(imageData, bufferStart, 0);
        pixelsRef.current = null;
      },

      highlightByIndex(entries: IndexEntry[], world: WorldData, playerMap: PlayerMap | null, onProgress?: (pct: number, matchCount: number) => void) {
        const ctx = overlayCtxRef.current!;
        const overlay = overlayRef.current!;
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        const id = ++highlightIdRef.current;
        const ow = overlay.width;
        const imageData = ctx.createImageData(ow, overlay.height);
        const data = imageData.data;
        const height = world.height;

        for (let p = 3; p < data.length; p += 4) data[p] = 192;
        ctx.putImageData(imageData, 0, 0);

        const totalIndices = entries.reduce((sum, e) => sum + e.indices.length, 0);
        let processed = 0;
        let matches = 0;
        let lastPutImageTime = 0;
        let entryI = 0;
        let arrayPos = 0;

        const processChunk = () => {
          if (id !== highlightIdRef.current) return;

          const deadline = performance.now() + 200;
          while (entryI < entries.length && performance.now() < deadline) {
            const entry = entries[entryI];
            const arr = entry.indices;
            const filter = entry.filter;

            while (arrayPos < arr.length && performance.now() < deadline) {
              const idx = arr[arrayPos++];
              processed++;
              if (filter && !filter(idx)) continue;
              if (playerMap && !playerMap.explored[idx]) continue;
              const x = Math.floor(idx / height);
              const y = idx % height;
              const pxIdx = (y * ow + x) * 4;
              data[pxIdx] = 255; data[pxIdx + 1] = 255; data[pxIdx + 2] = 255; data[pxIdx + 3] = 255;
              matches++;
            }

            if (arrayPos >= arr.length) { entryI++; arrayPos = 0; }
          }

          const now = performance.now();
          if (entryI >= entries.length || now - lastPutImageTime > 1000) {
            ctx.putImageData(imageData, 0, 0);
            lastPutImageTime = now;
          }

          if (entryI < entries.length) {
            onProgress?.(totalIndices > 0 ? Math.round((processed / totalIndices) * 100) : 100, matches);
            setTimeout(processChunk, 0);
          } else {
            onProgress?.(100, matches);
          }
        };

        onProgress?.(0, 0);
        processChunk();
      },

      renderWireOverlay(world: WorldData) {
        const ctx = wireCtxRef.current!;
        const wire = wireRef.current!;
        ctx.clearRect(0, 0, wire.width, wire.height);

        const w = wire.width;
        const imageData = ctx.createImageData(w, world.height);
        const data = imageData.data;

        const rawFlags2 = world.rawFlags2!;
        let x = 0;
        let y = 0;
        const total = world.width * world.height;
        for (let i = 0; i < total; i++) {
          const pxIdx = (y * w + x) * 4;
          let r = 0, g = 0, b = 0, count = 0;
          const f2 = rawFlags2[i];
          if (f2 & 0x08) { r += 255; count++; }
          if (f2 & 0x10) { g += 255; count++; }
          if (f2 & 0x20) { b += 255; count++; }
          if (f2 & 0x40) { r += 255; g += 255; count++; }
          if (count > 0) {
            data[pxIdx] = Math.min(r, 255);
            data[pxIdx + 1] = Math.min(g, 255);
            data[pxIdx + 2] = Math.min(b, 255);
            data[pxIdx + 3] = 160;
          } else {
            data[pxIdx + 3] = 192;
          }
          y++;
          if (y >= world.height) {
            y = 0;
            x++;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      },

      clearWireOverlay() {
        const wire = wireRef.current!;
        wireCtxRef.current!.clearRect(0, 0, wire.width, wire.height);
      },

      renderFogOverlay(playerMap: PlayerMap) {
        const ctx = fogCtxRef.current!;
        const fog = fogRef.current!;
        ctx.clearRect(0, 0, fog.width, fog.height);

        const w = fog.width;
        const h = fog.height;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let x = 0; x < playerMap.width && x < w; x++) {
          for (let y = 0; y < playerMap.height && y < h; y++) {
            if (!playerMap.explored[x * playerMap.height + y]) {
              const pxIdx = (y * w + x) * 4;
              data[pxIdx + 3] = 255;
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);
      },

      clearFogOverlay() {
        const fog = fogRef.current;
        fogCtxRef.current?.clearRect(0, 0, fog?.width ?? 0, fog?.height ?? 0);
      },

      drawSelection(x: number, y: number) {
        const ctx = selectionCtxRef.current!;
        const selection = selectionRef.current!;
        const cx = Math.round(x) + 0.5;
        const cy = Math.round(y) + 0.5;
        const targetWidth = 39;
        const half = targetWidth / 2;

        ctx.clearRect(0, 0, selection.width, selection.height);
        ctx.lineWidth = 12;
        ctx.strokeStyle = "#FF00FF";
        ctx.strokeRect(cx - half, cy - half, targetWidth, targetWidth);

        ctx.strokeStyle = "#FF00FF";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx - half, cy); ctx.lineTo(cx - 1, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + half, cy); ctx.lineTo(cx + 1, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - half); ctx.lineTo(cx, cy - 1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy + half); ctx.lineTo(cx, cy + 1); ctx.stroke();
      },

      clearOverlay() {
        const overlay = overlayRef.current!;
        overlayCtxRef.current!.clearRect(0, 0, overlay.width, overlay.height);
      },

      clearSelection() {
        const selection = selectionRef.current!;
        selectionCtxRef.current?.clearRect(0, 0, selection.width, selection.height);
      },

      saveImage(filename: string) {
        const canvas = canvasRef.current!;
        const overlay = overlayRef.current!;
        const wire = wireRef.current!;
        const fog = fogRef.current!;
        const selection = selectionRef.current!;
        const newCanvas = document.createElement("canvas");
        const newCtx = newCanvas.getContext("2d")!;
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        newCtx.drawImage(canvas, 0, 0);
        newCtx.drawImage(overlay, 0, 0);
        newCtx.drawImage(wire, 0, 0);
        newCtx.drawImage(fog, 0, 0);
        newCtx.drawImage(selection, 0, 0);
        newCanvas.toBlob((blob) => {
          if (blob) {
            void import('file-saver').then(({ saveAs }) => saveAs(blob, filename));
          }
        });
      },

      panToTile(x: number, y: number) {
        const canvas = canvasRef.current;
        const el = panzoomRef.current;
        if (!canvas || !el) return;
        const elX = x * (el.offsetWidth / canvas.width);
        const elY = y * (el.offsetHeight / canvas.height);
        panToPoint(elX, elY);
      },

      zoomIn() { zoomIn(); },
      zoomOut() { zoomOut(); },
      resetZoom() { fitToContainer(); reset(); },
    }));

    return (
      <div ref={wrapperRef} style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
        <div ref={panzoomRef} style={{ position: 'relative' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', left: 0, top: 0 }} />
          <canvas ref={overlayRef} style={{ position: 'absolute', left: 0, top: 0 }} />
          <canvas ref={wireRef} style={{ position: 'absolute', left: 0, top: 0 }} />
          <canvas ref={fogRef} style={{ position: 'absolute', left: 0, top: 0 }} />
          <canvas ref={selectionRef} style={{ position: 'absolute', left: 0, top: 0 }} />
        </div>
      </div>
    );
  }
);
