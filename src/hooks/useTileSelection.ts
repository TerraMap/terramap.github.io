import { useCallback, useRef, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import type { PlayerMap } from '../lib/readPlayerMap';
import { fillTileFromRaw, getTileAt, getTileInfo } from '../lib/tileInfo';
import { isTileMatch, isTileOrigin, type SearchableInfo } from '../lib/tileSearch';
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
    if (!w) return;
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
    if (!w) return;
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

  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const searchIdRef = useRef(0);

  const findBlock = useCallback((direction: number, infos: SearchableInfo[]) => {
    const w = worldRef.current;
    if (!w || infos.length === 0) return;

    const id = ++searchIdRef.current;
    setIsSearching(true);

    const total = w.width * w.height;
    const startIdx = selectionPos.x * w.height + selectionPos.y;
    let i = startIdx + direction;
    if (i < 0) i = total - 1;
    else if (i >= total) i = 0;

    let checked = 0;
    let lastStatusTime = 0;

    const tileView: WorldTile = {};

    const searchChunk = () => {
      if (id !== searchIdRef.current) return;

      const now = performance.now();
      if (now - lastStatusTime > 200) {
        lastStatusTime = now;
        setSearchStatus(`Searching for matches... ${Math.round((checked / total) * 100)}%`);
      }

      const deadline = now + 100;
      while (checked < total && performance.now() < deadline) {
        const x = Math.floor(i / w.height);
        const y = i % w.height;
        fillTileFromRaw(tileView, w, i, x, y);
        tileView.info = getTileInfo(tileView);
        tileView.chest = w.chestByIdx?.get(i);
        tileView.tileEntity = w.entityByIdx?.get(i);
        const pm = playerMapRef.current;
        if (isTileMatch(tileView, infos) && isTileOrigin(tileView) && (!pm || pm.explored[i])) {
          setSelectionPos({ x, y });
          canvasRef.current?.drawSelection(x, y);
          canvasRef.current?.panToTile(x, y);
          setSelectedTile({ ...tileView });
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
  }, [worldRef, canvasRef, selectionPos, onNotFound, playerMapRef]);

  return {
    findBlock,
    goToTile,
    tileClick,
    tileHover,
    hideTileIndicator,
    hoveredTile,
    isSearching,
    searchStatus,
    selectedTile,
    selectionPos,
  };
}
