import { useCallback, useRef, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import { getTileAt } from '../lib/tileInfo';
import { isTileMatch, isTileOrigin, type SearchableInfo } from '../lib/tileSearch';
import type { WorldData, WorldTile } from '../types/settings';

const CHUNK_SIZE = 50_000;

export function useTileSelection(
  canvasRef: React.RefObject<CanvasContainerHandle | null>,
  worldRef: React.RefObject<WorldData | null>,
  onNotFound?: () => void,
) {
  const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
  const [selectedTile, setSelectedTile] = useState<WorldTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<WorldTile | null>(null);

  const handleTileHover = useCallback((x: number, y: number) => {
    const w = worldRef.current;
    if (!w) return;
    const tile = getTileAt(w, x, y);
    setHoveredTile(tile ? { ...tile, x, y } : null);
  }, [worldRef]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (selectionPos.x === x && selectionPos.y === y) {
      canvasRef.current?.clearSelection();
      setSelectedTile(null);
      setSelectionPos({ x: -1, y: -1 });
      return;
    }

    const w = worldRef.current;
    if (!w) return;
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);

    const tile = getTileAt(w, x, y);
    setSelectedTile(tile ? { ...tile, x, y } : null);
  }, [worldRef, canvasRef, selectionPos]);

  const handleGoToTile = useCallback(() => {
    const input = prompt('Enter coordinates (x, y):');
    if (!input) return;
    const parts = input.split(/[,\s]+/).map(Number);
    const x = parts[0];
    const y = parts[1];
    if (isNaN(x) || isNaN(y)) return;
    const w = worldRef.current;
    if (!w) return;
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);
    canvasRef.current?.panToTile(x, y);
    const tile = getTileAt(w, x, y);
    setSelectedTile(tile ? { ...tile, x, y } : null);
  }, [worldRef, canvasRef]);

  const hideTileIndicator = useCallback(() => {
    canvasRef.current?.clearSelection();
  }, [canvasRef]);

  const selectTile = useCallback((x: number, y: number) => {
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);
    canvasRef.current?.panToTile(x, y);
  }, [canvasRef]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const searchIdRef = useRef(0);

  const findBlock = useCallback((direction: number, infos: SearchableInfo[]) => {
    const w = worldRef.current;
    if (!w) return;
    if (infos.length === 0) return;

    const id = ++searchIdRef.current;
    setIsSearching(true);

    const total = w.tiles.length;
    const startIdx = selectionPos.x * w.height + selectionPos.y;
    let i = startIdx + direction;
    if (i < 0) i = total - 1;
    else if (i >= total) i = 0;

    let checked = 0;

    const searchChunk = () => {
      if (id !== searchIdRef.current) return;

      const pct = Math.round((checked / total) * 100);
      setSearchStatus(`Searching for matches... ${pct}%`);

      const end = Math.min(checked + CHUNK_SIZE, total);
      while (checked < end) {
        const tile = w.tiles[i];
        if (isTileMatch(tile, infos) && isTileOrigin(tile)) {
          const x = Math.floor(i / w.height);
          const y = i % w.height;
          setSelectionPos({ x, y });
          canvasRef.current?.drawSelection(x, y);
          canvasRef.current?.panToTile(x, y);
          setSelectedTile(tile);
          setIsSearching(false);
          setSearchStatus('');
          return;
        }
        i += direction;
        if (i < 0) i = total - 1;
        else if (i >= total) i = 0;
        checked++;
      }

      if (checked < total) {
        setTimeout(searchChunk, 0);
      } else {
        setIsSearching(false);
        setSearchStatus('');
        onNotFound?.();
      }
    };

    searchChunk();
  }, [worldRef, canvasRef, selectionPos]);

  return {
    selectionPos,
    selectedTile,
    hoveredTile,
    handleTileHover,
    handleTileClick,
    handleGoToTile,
    hideTileIndicator,
    selectTile,
    findBlock,
    isSearching,
    searchStatus,
  };
}
