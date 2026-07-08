import { useCallback, useMemo, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import { items } from '../items';
import { buildHighlightEntries, getTileInfoFrom, type SearchableInfo } from '../lib/tileSearch';
import { tiles } from '../tiles';
import type { PlayerMap } from '../lib/readPlayerMap';
import type { BlockSet, WorldData } from '../types/settings';
import { walls } from '../walls';

export function useBlockHighlight(
  canvasRef: React.RefObject<CanvasContainerHandle | null>,
  worldRef: React.RefObject<WorldData | null>,
  selectedBlocks: string[],
  setShowWires: (value: boolean) => void,
  playerMapRef: React.RefObject<PlayerMap | null>,
  onFinished?: (count: number) => void,
) {
  const selectedInfos = useMemo((): SearchableInfo[] => {
    const infos: SearchableInfo[] = [];
    for (const encoded of selectedBlocks) {
      const [value, u, v] = encoded.split('|');
      if (value.startsWith('item')) {
        const item = items.find(it => `item${it.id}` === value);
        if (item) infos.push(item);
      } else if (value.startsWith('wall')) {
        const wall = walls.find(w => `wall${w.id}` === value);
        if (wall) infos.push(wall);
      } else {
        const info = getTileInfoFrom(value, u || undefined, v || undefined);
        if (info) infos.push(info);
      }
    }
    return infos;
  }, [selectedBlocks]);

  const [highlightStatus, setHighlightStatus] = useState('');
  const [isHighlighting, setIsHighlighting] = useState(false);

  // Tile/wall/item indices are built before the world finishes loading
  // (see useWorldLoader), so by the time the UI allows highlighting, the
  // O(log n) index lookup below is always available.
  const doHighlight = useCallback((infos: SearchableInfo[], w: WorldData) => {
    const onProgress = (pct: number, matchCount: number) => {
      if (pct >= 100) {
        setHighlightStatus('');
        setIsHighlighting(false);
        onFinished?.(matchCount);
      } else {
        setHighlightStatus(`Highlighting... ${pct}%`);
      }
    };
    const entries = buildHighlightEntries(infos, w) ?? [];
    canvasRef.current?.highlightByIndex(entries, w, playerMapRef.current, onProgress);
  }, [canvasRef, playerMapRef, onFinished]);

  const handleHighlightAll = useCallback(() => {
    const w = worldRef.current;
    if (!w || !w.rawFlags1) return;
    const infos = selectedInfos;
    if (infos.length > 0) {
      setIsHighlighting(true);
      doHighlight(infos, w);
    }
  }, [worldRef, selectedInfos, doHighlight]);

  const handleClearHighlight = useCallback(() => {
    canvasRef.current?.clearOverlay();
    canvasRef.current?.clearSelection();
    setShowWires(false);
  }, [canvasRef, setShowWires]);

  const handleSetSelect = useCallback((index: number, sets: BlockSet[]) => {
    const set = sets[index];
    if (!set) return;
    const values: string[] = [];
    for (const entry of set.entries) {
      if (entry.u !== undefined || entry.v !== undefined) {
        let frameIndex = '';
        const tile = tiles[entry.id];
        if (tile?.frames) {
          const fi = tile.frames.findIndex(f => f.u === entry.u && f.v === entry.v);
          if (fi >= 0) frameIndex = String(fi);
        }
        values.push(`${entry.id}|${entry.u ?? ''}|${entry.v ?? ''}|${frameIndex}`);
      } else if (entry.isTile) {
        values.push(`${entry.id}|||`);
      } else if (entry.isItem) {
        values.push(`item${entry.id}|||`);
      } else if (entry.isWall) {
        values.push(`wall${entry.id}|||`);
      }
    }
    const infos = values.map((encoded) => {
      const [value, u, v] = encoded.split('|');
      if (value.startsWith('item')) return items.find(it => `item${it.id}` === value);
      if (value.startsWith('wall')) return walls.find(w => `wall${w.id}` === value);
      return getTileInfoFrom(value, u || undefined, v || undefined);
    }).filter((info): info is SearchableInfo => Boolean(info));
    const w = worldRef.current;
    if (w && w.rawFlags1 && infos.length > 0) {
      setIsHighlighting(true);
      doHighlight(infos, w);
    }
    return values;
  }, [worldRef, doHighlight]);

  return {
    selectedInfos,
    isHighlighting,
    highlightStatus,
    handleHighlightAll,
    handleClearHighlight,
    handleSetSelect,
  };
}
