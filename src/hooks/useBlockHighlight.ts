import { useCallback, useMemo, useState } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import { items } from '../items';
import { getTileInfoFrom, isTileMatch, type SearchableInfo } from '../lib/tileSearch';
import { tiles } from '../tiles';
import type { BlockSet, WorldData } from '../types/settings';
import { walls } from '../walls';

export function useBlockHighlight(
  canvasRef: React.RefObject<CanvasContainerHandle | null>,
  worldRef: React.RefObject<WorldData | null>,
  selectedBlocks: string[],
  setShowWires: (value: boolean) => void,
  onFinished?: (count: number) => void,
) {
  const selectedInfos = useMemo((): SearchableInfo[] => {
    const infos: SearchableInfo[] = [];
    for (const encoded of selectedBlocks) {
      const [value, u, v] = encoded.split('|');
      if (value.startsWith('item')) {
        const item = items.find(it => `item${it.Id}` === value);
        if (item) infos.push(item);
      } else if (value.startsWith('wall')) {
        const wall = walls.find(w => `wall${w.Id}` === value);
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

  const handleHighlightAll = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    const infos = selectedInfos;
    if (infos.length > 0) {
      setIsHighlighting(true);
      canvasRef.current?.highlightTiles((tile) => isTileMatch(tile, infos), w, (pct, matchCount) => {
        if (pct >= 100) {
          setHighlightStatus('');
          setIsHighlighting(false);
          onFinished?.(matchCount);
        } else {
          setHighlightStatus(`Highlighting... ${pct}%`);
        }
      });
    }
  }, [worldRef, canvasRef, selectedInfos, onFinished]);

  const handleClearHighlight = useCallback(() => {
    canvasRef.current?.clearOverlay();
    canvasRef.current?.clearSelection();
    setShowWires(false);
  }, [canvasRef, setShowWires]);

  const handleSetSelect = useCallback((index: number, sets: BlockSet[]) => {
    const set = sets[index];
    if (!set) return;
    const values: string[] = [];
    for (const entry of set.Entries) {
      if (entry.U !== undefined || entry.V !== undefined) {
        let frameIndex = '';
        const tile = tiles[Number(entry.Id)];
        if (tile?.Frames) {
          const fi = tile.Frames.findIndex(f => f.U === entry.U && f.V === entry.V);
          if (fi >= 0) frameIndex = String(fi);
        }
        values.push(`${entry.Id}|${entry.U ?? ''}|${entry.V ?? ''}|${frameIndex}`);
      } else if (entry.isTile) {
        values.push(`${entry.Id}|||`);
      } else if (entry.isItem) {
        values.push(`item${entry.Id}|||`);
      } else if (entry.isWall) {
        values.push(`wall${entry.Id}|||`);
      }
    }
    const infos = values.map((encoded) => {
      const [value, u, v] = encoded.split('|');
      if (value.startsWith('item')) return items.find(it => `item${it.Id}` === value);
      if (value.startsWith('wall')) return walls.find(w => `wall${w.Id}` === value);
      return getTileInfoFrom(value, u || undefined, v || undefined);
    }).filter((info): info is SearchableInfo => Boolean(info));
    const w = worldRef.current;
    if (w && infos.length > 0) {
      setIsHighlighting(true);
      canvasRef.current?.highlightTiles((tile) => isTileMatch(tile, infos), w, (pct, matchCount) => {
        if (pct >= 100) {
          setHighlightStatus('');
          setIsHighlighting(false);
          onFinished?.(matchCount);
        } else {
          setHighlightStatus(`Highlighting... ${pct}%`);
        }
      });
    }
    return values;
  }, [worldRef, canvasRef, onFinished]);

  return {
    selectedInfos,
    isHighlighting,
    highlightStatus,
    handleHighlightAll,
    handleClearHighlight,
    handleSetSelect,
  };
}
