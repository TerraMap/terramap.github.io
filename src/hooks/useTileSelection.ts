import { useCallback, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import type { PlayerMap } from '../lib/readPlayerMap';
import { getTileAt } from '../lib/tileInfo';
import { buildSearchEntries, findNextByIndex, type SearchableInfo } from '../lib/tileSearch';
import type { WorldData, WorldTile } from '../types/settings';

export function useTileSelection(
  canvasRef: React.RefObject<CanvasContainerHandle | null>,
  worldRef: React.RefObject<WorldData | null>,
  playerMapRef: React.RefObject<PlayerMap | null>,
  onNotFound?: () => void,
) {
  const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
  const [selectedTile, setSelectedTile] = useState<WorldTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<WorldTile | null>(null);

  const isExplored = useCallback((x: number, y: number) => {
    const pm = playerMapRef.current;
    if (!pm) return true;
    const w = worldRef.current;
    if (!w) return true;
    return !!pm.explored[x * w.height + y];
  }, [worldRef, playerMapRef]);

  const tileHover = useCallback((x: number, y: number) => {
    const w = worldRef.current;
    if (!w || !w.rawFlags1) return;
    const tile = isExplored(x, y) ? getTileAt(w, x, y) : null;
    setHoveredTile(tile ? { ...tile, x, y } : { x, y });
  }, [worldRef, isExplored]);

  const tileClick = useCallback((x: number, y: number) => {
    if (selectionPos.x === x && selectionPos.y === y) {
      canvasRef.current?.clearSelection();
      setSelectedTile(null);
      setSelectionPos({ x: -1, y: -1 });
      return;
    }

    const w = worldRef.current;
    if (!w || !w.rawFlags1) return;
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);

    const tile = isExplored(x, y) ? getTileAt(w, x, y) : null;
    setSelectedTile(tile ? { ...tile, x, y } : null);
  }, [worldRef, canvasRef, selectionPos, isExplored]);

  const goToTile = useCallback((point?: { x: number, y: number }) => {
    let x = point?.x;
    let y = point?.y;

    if (!x || !y) {
      const input = prompt('Enter coordinates (x, y):');
      if (!input) return;
      const parts = input.split(/[,\s]+/).map(Number);
      x = parts[0];
      y = parts[1];
    }
    if (isNaN(x) || isNaN(y)) return;
    const w = worldRef.current;
    if (!w || !w.rawFlags1) return;
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);
    canvasRef.current?.panToTile(x, y);
    const tile = getTileAt(w, x, y);
    setSelectedTile(tile ? { ...tile, x, y } : null);
  }, [worldRef, canvasRef]);

  const hideTileIndicator = useCallback(() => {
    canvasRef.current?.clearSelection();
  }, [canvasRef]);

  // Tile/wall/item indices are built before the world finishes loading
  // (see useWorldLoader), so by the time the UI allows a search, the
  // O(log n) index lookup below is always available.
  const findBlock = useCallback((direction: number, infos: SearchableInfo[]) => {
    const w = worldRef.current;
    if (!w || !w.rawFlags1 || infos.length === 0) return;

    const total = w.width * w.height;
    const startIdx = selectionPos.x * w.height + selectionPos.y;

    const entries = buildSearchEntries(infos, w);
    const pm = playerMapRef.current;
    const resultIdx = entries ? findNextByIndex(entries, startIdx, direction, total, pm?.explored) : null;
    if (resultIdx === null) { onNotFound?.(); return; }

    const x = Math.floor(resultIdx / w.height);
    const y = resultIdx % w.height;
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);
    canvasRef.current?.panToTile(x, y);
    setSelectedTile(getTileAt(w, x, y));
  }, [worldRef, canvasRef, selectionPos, onNotFound, playerMapRef]);

  return {
    findBlock,
    goToTile,
    tileClick,
    tileHover,
    hideTileIndicator,
    hoveredTile,
    selectedTile,
    selectionPos,
  };
}
