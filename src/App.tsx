import { useCallback, useMemo, useRef, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Navbar } from './components/Navbar';
import { StatusBar } from './components/StatusBar';
import { HelpPanel } from './components/HelpPanel';
import { CanvasContainer, CanvasContainerHandle } from './components/CanvasContainer';
import { BlockSelectorModal } from './components/BlockSelectorModal';
import { useWorldLoader } from './hooks/useWorldLoader';
import { useBlockOptions } from './hooks/useBlockOptions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { getTileAt, getTileText, getItemText } from './lib/tileInfo';
import { isTileMatch, getTileInfoFrom } from './lib/tileSearch';
import { settings } from './settings';
import { sets } from './sets';

export default function App() {
  const canvasRef = useRef<CanvasContainerHandle>(null);
  const { world, worldRef, status, loadFile } = useWorldLoader(canvasRef);
  const blockOptions = useBlockOptions();

  const [blocksModalOpen, setBlocksModalOpen] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
  const [statusText, setStatusText] = useState('');
  const [tileInfoItems, setTileInfoItems] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const displayStatus = statusText || status;

  const worldProperties = useMemo(() => {
    if (!world) return {};
    const props: Record<string, any> = {};
    Object.keys(world).forEach((key) => {
      const value = world[key];
      const type = typeof value;
      if (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint') {
        props[key] = value;
      }
    });
    return props;
  }, [world]);

  const getSelectedInfos = useCallback(() => {
    const infos: any[] = [];
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

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    loadFile(f);
  }, [loadFile]);

  const handleTileHover = useCallback((x: number, y: number) => {
    const w = worldRef.current;
    if (!w) return;
    const tile = getTileAt(w, x, y);
    if (tile) {
      setStatusText(`${getTileText(tile)} (${x}, ${y})`);
    } else {
      setStatusText(`${x}, ${y}`);
    }
  }, [worldRef]);

  const handleTileClick = useCallback((x: number, y: number) => {
    const w = worldRef.current;
    if (!w) return;
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);

    const tile = getTileAt(w, x, y);
    if (tile) {
      const items: string[] = [];

      const chest = tile.chest;
      if (chest) {
        if (chest.name?.length > 0) items.push(chest.name);
        for (const item of chest.items) {
          items.push(getItemText(item));
        }
      }

      const tileEntity = tile.tileEntity;
      if (tileEntity) {
        switch (tileEntity.type) {
          case 3:
          case 5:
            for (let i = 0; i < tileEntity.items.length; i++) {
              if (tileEntity.items[i].id > 0) items.push(getItemText(tileEntity.items[i]));
              if (tileEntity.dyes[i].id > 0) items.push(getItemText(tileEntity.dyes[i]));
            }
            break;
        }
      }

      const sign = tile.sign;
      if (sign?.text?.length > 0) items.push(sign.text);

      setTileInfoItems(items);
    }
  }, [worldRef]);

  const handleHighlightAll = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    const infos = getSelectedInfos();
    if (infos.length > 0) {
      canvasRef.current?.highlightTiles((tile) => isTileMatch(tile, infos), w);
    }
  }, [worldRef, getSelectedInfos]);

  const handleClearHighlight = useCallback(() => {
    canvasRef.current?.clearOverlay();
    canvasRef.current?.clearSelection();
  }, []);

  const findBlock = useCallback((direction: number) => {
    const w = worldRef.current;
    if (!w) return;

    const infos = getSelectedInfos();
    if (infos.length === 0) return;

    let x = selectionPos.x;
    let y = selectionPos.y + direction;
    const start = x * w.height + y;

    for (let i = start; i >= 0 && i < w.tiles.length; i += direction) {
      const tile = w.tiles[i];
      if (isTileMatch(tile, infos)) {
        setSelectionPos({ x, y });
        canvasRef.current?.drawSelection(x, y);
        break;
      }
      y += direction;
      if (y < 0 || y >= w.height) {
        y = direction > 0 ? 0 : w.height - 1;
        x += direction;
      }
    }
  }, [worldRef, selectionPos, getSelectedInfos]);

  const handleSetSelect = useCallback((index: number) => {
    const set = sets[index];
    if (!set) return;
    const values: string[] = [];
    for (const entry of set.Entries) {
      const e = entry as any;
      if (e.U !== undefined || e.V !== undefined) {
        values.push(`${e.Id}|${e.U ?? ''}|${e.V ?? ''}`);
      } else if (e.isTile) {
        values.push(`${e.Id}||`);
      } else if (e.isItem) {
        values.push(`item${e.Id}||`);
      } else if (e.isWall) {
        values.push(`wall${e.Id}||`);
      }
    }
    setSelectedBlocks(values);
    const infos = values.map((encoded) => {
      const [value, u, v] = encoded.split('|');
      if (value.startsWith('item')) return settings.Items.find(it => `item${it.Id}` === value);
      if (value.startsWith('wall')) return settings.Walls.find(w => `wall${w.Id}` === value);
      return getTileInfoFrom(value, u || undefined, v || undefined);
    }).filter(Boolean);
    const w = worldRef.current;
    if (w && infos.length > 0) {
      canvasRef.current?.highlightTiles((tile) => isTileMatch(tile, infos), w);
    }
  }, [worldRef]);

  const handleSaveImage = useCallback(() => {
    const w = worldRef.current;
    if (w) canvasRef.current?.saveImage(`${w.name}.png`);
  }, [worldRef]);

  const handleReload = useCallback(() => {
    if (file) loadFile(file);
  }, [file, loadFile]);

  const shortcutHandlers = useMemo(() => ({
    onZoomIn: () => canvasRef.current?.zoomIn(),
    onZoomOut: () => canvasRef.current?.zoomOut(),
    onOpenBlocks: () => setBlocksModalOpen(true),
  }), []);

  useKeyboardShortcuts(shortcutHandlers);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Navbar
        worldLoaded={!!world}
        npcs={world?.npcs ?? []}
        sets={sets}
        worldProperties={worldProperties}
        tileInfoItems={tileInfoItems}
        onFileSelect={handleFileSelect}
        onOpenBlocks={() => setBlocksModalOpen(true)}
        onPrevBlock={() => findBlock(-1)}
        onNextBlock={() => findBlock(1)}
        onHighlightAll={handleHighlightAll}
        onClearHighlight={handleClearHighlight}
        onResetZoom={() => canvasRef.current?.resetZoom()}
        onSaveImage={handleSaveImage}
        onReload={handleReload}
        onNpcSelect={(x, y) => {
          setSelectionPos({ x, y });
          canvasRef.current?.drawSelection(x, y);
        }}
        onSetSelect={handleSetSelect}
      />

      <div style={{ paddingTop: 52, paddingBottom: 32 }}>
        {!world && <HelpPanel />}
        <div style={{ display: world ? 'block' : 'none' }}>
          <CanvasContainer
            ref={canvasRef}
            onTileHover={handleTileHover}
            onTileClick={handleTileClick}
          />
        </div>
      </div>

      <StatusBar status={displayStatus} />

      <BlockSelectorModal
        open={blocksModalOpen}
        onClose={() => setBlocksModalOpen(false)}
        options={blockOptions}
        selectedValues={selectedBlocks}
        onSelectionChange={setSelectedBlocks}
      />
    </ConfigProvider>
  );
}
