import { useCallback } from 'react';
import type { CanvasContainerHandle } from '../components/CanvasContainer';
import { settings } from '../settings';
import { getTileInfoFrom, isTileMatch, type SearchableInfo } from '../lib/tileSearch';
import type { BlockSet, WorldData } from '../types/settings';

export function useBlockHighlight(
  canvasRef: React.RefObject<CanvasContainerHandle | null>,
  worldRef: React.RefObject<WorldData | null>,
  selectedBlocks: string[],
  setShowWires: (value: boolean) => void,
) {
  const getSelectedInfos = useCallback((): SearchableInfo[] => {
    const infos: SearchableInfo[] = [];
    for (const encoded of selectedBlocks) {
      const [value, u, v] = encoded.split('|');
      if (value.startsWith('item')) {
        const item = settings.Items.find(it => `item${it.Id}` === value);
        if (item) infos.push(item);
      } else if (value.startsWith('wall')) {
        const wall = settings.Walls.find(w => `wall${w.Id}` === value);
        if (wall) infos.push(wall);
      } else {
        const info = getTileInfoFrom(value, u || undefined, v || undefined);
        if (info) infos.push(info);
      }
    }
    return infos;
  }, [selectedBlocks]);

  const handleHighlightAll = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    const infos = getSelectedInfos();
    if (infos.length > 0) {
      canvasRef.current?.highlightTiles((tile) => isTileMatch(tile, infos), w);
    }
  }, [worldRef, canvasRef, getSelectedInfos]);

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
        values.push(`${entry.Id}|${entry.U ?? ''}|${entry.V ?? ''}|`);
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
      if (value.startsWith('item')) return settings.Items.find(it => `item${it.Id}` === value);
      if (value.startsWith('wall')) return settings.Walls.find(w => `wall${w.Id}` === value);
      return getTileInfoFrom(value, u || undefined, v || undefined);
    }).filter((info): info is SearchableInfo => Boolean(info));
    const w = worldRef.current;
    if (w && infos.length > 0) {
      canvasRef.current?.highlightTiles((tile) => isTileMatch(tile, infos), w);
    }
    return values;
  }, [worldRef, canvasRef]);

  return {
    getSelectedInfos,
    handleHighlightAll,
    handleClearHighlight,
    handleSetSelect,
  };
}
