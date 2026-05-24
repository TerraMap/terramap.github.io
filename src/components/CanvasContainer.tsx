import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { usePanZoom } from '../hooks/usePanZoom';
import { getTileColor } from '../lib/mapRenderer';
import { getTileInfo } from '../lib/tileInfo';

export interface CanvasContainerHandle {
  setWorldSize: (width: number, height: number) => void;
  renderTileBatch: (tiles: any[], startX: number, world: any) => void;
  finishRender: (worldWidth: number) => void;
  highlightTiles: (matchFn: ((tile: any) => boolean) | null, world: any) => void;
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
}

const BUFFER_WIDTH = 200;

export const CanvasContainer = forwardRef<CanvasContainerHandle, CanvasContainerProps>(
  function CanvasContainer({ onTileHover, onTileClick }, ref) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const panzoomRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const selectionRef = useRef<HTMLCanvasElement>(null);
    const pixelsRef = useRef<Uint8ClampedArray | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const selectionCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);

    const { zoomIn, zoomOut, reset, panToPoint } = usePanZoom(panzoomRef);

    const getMousePos = useCallback((evt: MouseEvent | PointerEvent) => {
      const el = panzoomRef.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
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

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('pointerdown', handlePointerDown);
      el.addEventListener('pointermove', handlePointerMove);
      el.addEventListener('pointerup', handlePointerUp);

      return () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('pointerdown', handlePointerDown);
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerup', handlePointerUp);
      };
    }, [getMousePos, onTileHover, onTileClick]);

    useImperativeHandle(ref, () => ({
      setWorldSize(width: number, height: number) {
        const el = panzoomRef.current!;
        const canvas = canvasRef.current!;
        const overlay = overlayRef.current!;
        const selection = selectionRef.current!;

        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        canvas.width = width;
        canvas.height = height;
        overlay.width = width;
        overlay.height = height;
        selection.width = width;
        selection.height = height;

        ctxRef.current = canvas.getContext('2d')!;
        overlayCtxRef.current = overlay.getContext('2d')!;
        selectionCtxRef.current = selection.getContext('2d')!;

        const displayWidth = window.innerWidth * 0.99;
        const ratio = height / width;
        const displayHeight = displayWidth * ratio;
        el.style.width = `${displayWidth}px`;
        el.style.height = `${displayHeight}px`;
        canvas.style.width = `${displayWidth}px`;
        overlay.style.width = `${displayWidth}px`;
        selection.style.width = `${displayWidth}px`;

        pixelsRef.current = new Uint8ClampedArray(4 * BUFFER_WIDTH * height);
      },

      renderTileBatch(tiles: any[], startX: number, world: any) {
        const ctx = ctxRef.current!;
        const pixels = pixelsRef.current!;
        const height = world.height;
        const xlimit = startX + tiles.length / height;

        let i = 0;
        for (let x = startX; x < xlimit; x++) {
          const bufferStart = BUFFER_WIDTH * Math.floor(x / BUFFER_WIDTH);
          if (x % BUFFER_WIDTH === 0 && x > 0) {
            const imageData = new ImageData(pixels as unknown as Uint8ClampedArray<ArrayBuffer>, BUFFER_WIDTH);
            ctx.putImageData(imageData, bufferStart - BUFFER_WIDTH, 0);
          }
          for (let y = 0; y < height; y++) {
            const tile = tiles[i++];
            if (tile) {
              tile.info = getTileInfo(tile);

              let c = getTileColor(y, tile, world);
              if (!c) c = { r: 0, g: 0, b: 0 };

              const pxIdx = 4 * (y * BUFFER_WIDTH + x - bufferStart);
              pixels[pxIdx] = c.r;
              pixels[pxIdx + 1] = c.g;
              pixels[pxIdx + 2] = c.b;
              pixels[pxIdx + 3] = 255;
            }
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

      highlightTiles(matchFn: ((tile: any) => boolean) | null, world: any) {
        const ctx = overlayCtxRef.current!;
        const overlay = overlayRef.current!;
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, overlay.width, overlay.height);

        if (matchFn && world) {
          let x = 0;
          let y = 0;
          for (let i = 0; i < world.tiles.length; i++) {
            const tile = world.tiles[i];
            if (matchFn(tile)) {
              ctx.fillStyle = "rgb(255, 255, 255)";
              ctx.fillRect(x, y, 1, 1);
            }
            y++;
            if (y >= world.height) {
              y = 0;
              x++;
            }
          }
        }
      },

      drawSelection(x: number, y: number) {
        const ctx = selectionCtxRef.current!;
        const selection = selectionRef.current!;
        const cx = x + 0.5;
        const cy = y + 0.5;
        const targetWidth = 39;
        const half = targetWidth / 2;

        ctx.clearRect(0, 0, selection.width, selection.height);
        ctx.lineWidth = 12;
        ctx.strokeStyle = "rgb(255, 0, 0)";
        ctx.strokeRect(cx - half, cy - half, targetWidth, targetWidth);

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
        selectionCtxRef.current!.clearRect(0, 0, selection.width, selection.height);
      },

      saveImage(filename: string) {
        const canvas = canvasRef.current!;
        const overlay = overlayRef.current!;
        const selection = selectionRef.current!;
        const newCanvas = document.createElement("canvas");
        const newCtx = newCanvas.getContext("2d")!;
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        newCtx.drawImage(canvas, 0, 0);
        newCtx.drawImage(overlay, 0, 0);
        newCtx.drawImage(selection, 0, 0);
        newCanvas.toBlob((blob) => {
          if (blob) {
            import('file-saver').then(({ saveAs }) => saveAs(blob, filename));
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
      resetZoom() { reset(); },
    }));

    return (
      <div ref={wrapperRef} style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
        <div ref={panzoomRef} style={{ position: 'relative' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
          <canvas ref={overlayRef} style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
          <canvas ref={selectionRef} style={{ position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated' }} />
        </div>
      </div>
    );
  }
);
