import { App as AntApp, ConfigProvider, Layout, theme } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { BlockSelectorModal } from './components/BlockSelectorModal';
import { CanvasContainer, CanvasContainerHandle } from './components/CanvasContainer';
import { HelpPanel } from './components/HelpPanel';
import { Navbar } from './components/Navbar';
import { StatusBar } from './components/StatusBar';
import TileDescriptions from './components/TileDescriptions';
import { useBlockOptions } from './hooks/useBlockOptions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ThemeNameContext, useThemeName, type ThemeNames } from './hooks/useThemeName';
import { useWorldLoader } from './hooks/useWorldLoader';
import { getItemText, getTileAt } from './lib/tileInfo';
import { getTileInfoFrom, isTileMatch, isTileOrigin, type SearchableInfo } from './lib/tileSearch';
import { sets } from './sets';
import { settings } from './settings';
import { WorldTile } from './types/settings';

export default function App() {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { isDarkMode, themeName, setTheme } = useThemeName();

  const updateThemeName = (value: ThemeNames) => {
    setTheme(value);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm
      }}
    >
      <AntApp style={{ height: '100%' }}>
        <ThemeNameContext
          value={{
            isDarkMode,
            themeName,
            setThemeName: updateThemeName,
          }}
        >
          <AppContent />
        </ThemeNameContext>
      </AntApp>
    </ConfigProvider>
  );
}

function AppContent() {
  const canvasRef = useRef<CanvasContainerHandle>(null);
  // const playerFileInputRef = useRef<HTMLInputElement>(null);
  const worldFileInputRef = useRef<HTMLInputElement>(null);
  const { world, worldRef, status, loadWorldFile, isLoading } = useWorldLoader(canvasRef);
  const blockOptions = useBlockOptions();

  const [showWires, setShowWires] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(true);
  const [blocksModalOpen, setBlocksModalOpen] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [selectionPos, setSelectionPos] = useState({ x: 0, y: 0 });
  const [tileInfoItems, setTileInfoItems] = useState<string[]>([]);
  const [selectedTile, setSelectedTile] = useState<WorldTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<WorldTile | null>(null);
  const [worldFile, setWorldFile] = useState<File | null>(null);

  const { token: { colorBgContainer } } = theme.useToken();
  const { isDarkMode } = useThemeName();
  const antThemeName = isDarkMode ? 'dark' : 'light';

  useEffect(() => {
    if (worldFile?.name) {
      document.title = `${worldFile.name} | TerraMap`;
    } else {
      document.title = 'TerraMap';
    }
  }, [worldFile]);

  useEffect(() => {
    const w = worldRef.current;
    if (!w) return;
    if (showWires) {
      canvasRef.current?.renderWireOverlay(w);
    } else {
      canvasRef.current?.clearWireOverlay();
    }
  }, [showWires, world, worldRef]);

  const worldProperties = useMemo(() => {
    if (!world) return {};
    const props: Record<string, unknown> = {};
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

  const handleWorldFileSelect = useCallback((f: File) => {
    setWorldFile(f);
    loadWorldFile(f);
  }, [loadWorldFile]);

  // const onPlayerFileSelect = useCallback((f: File) => {
  //   // TODO: load player map file
  //   console.log({ playerFile: f });
  //   throw new Error('Not implemented!');
  // }, [])

  const handleTileHover = useCallback((x: number, y: number) => {
    const w = worldRef.current;
    if (!w) return;
    const tile = getTileAt(w, x, y);
    setHoveredTile(tile ? { ...tile, x, y } : null);
  }, [worldRef]);

  const updateSelectedTile = (tile: WorldTile | null) => {
    setSelectedTile(tile);

    if (tile) {
      const items: string[] = [];

      const chest = tile.chest;
      if (chest) {
        for (const item of chest.items) {
          items.push(getItemText(item));
        }
      }

      const tileEntity = tile.tileEntity;
      if (tileEntity) {
        switch (tileEntity.type) {
          case 3:
          case 5:
            if (tileEntity.items && tileEntity.dyes) {
              for (let i = 0; i < tileEntity.items.length; i++) {
                if (tileEntity.items[i].id > 0) items.push(getItemText(tileEntity.items[i]));
                if (tileEntity.dyes[i].id > 0) items.push(getItemText(tileEntity.dyes[i]));
              }
            }
            break;
        }
      }

      const sign = tile.sign;
      if (sign && sign.text && sign.text.length > 0) items.push(sign.text);

      setTileInfoItems(items);
    } else {
      setTileInfoItems([]);
    }
  }

  const handleTileClick = useCallback((x: number, y: number) => {
    const w = worldRef.current;
    if (!w) return;
    setSelectionPos({ x, y });
    canvasRef.current?.drawSelection(x, y);

    const tile = getTileAt(w, x, y);

    updateSelectedTile(tile ? { ...tile, x, y } : null);
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
    setShowWires(false);
  }, []);

  const findBlock = useCallback((direction: number) => {
    const w = worldRef.current;
    if (!w) return;

    const infos = getSelectedInfos();
    if (infos.length === 0) return;

    const total = w.tiles.length;
    const startIdx = selectionPos.x * w.height + selectionPos.y;
    let i = startIdx + direction;
    if (i < 0) i = total - 1;
    else if (i >= total) i = 0;

    for (let count = 0; count < total; count++) {
      const tile = w.tiles[i];
      if (isTileMatch(tile, infos) && isTileOrigin(tile)) {
        const x = Math.floor(i / w.height);
        const y = i % w.height;
        setSelectionPos({ x, y });
        canvasRef.current?.drawSelection(x, y);
        canvasRef.current?.panToTile(x, y);
        updateSelectedTile(tile);
        return;
      }
      i += direction;
      if (i < 0) i = total - 1;
      else if (i >= total) i = 0;
    }
  }, [worldRef, selectionPos, getSelectedInfos]);

  const handleSetSelect = useCallback((index: number) => {
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
    setSelectedBlocks(values);
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
  }, [worldRef]);

  const handleSaveImage = useCallback(() => {
    const w = worldRef.current;
    if (w) canvasRef.current?.saveImage(`${w.name}.png`);
  }, [worldRef]);

  const handleReloadWorld = useCallback(() => {
    if (worldFile) loadWorldFile(worldFile);
  }, [worldFile, loadWorldFile]);

  const shortcutHandlers = useMemo(() => ({
    onClearHighlight: () => handleClearHighlight(),
    onFindNext: () => findBlock(1),
    onFindPrevious: () => findBlock(-1),
    onHighlight: () => handleHighlightAll(),
    onOpenBlocks: () => setBlocksModalOpen(true),
    onOpenWorld: () => worldFileInputRef.current?.click(),
    onReloadWorld: () => handleReloadWorld(),
    onResetZoom: () => canvasRef.current?.resetZoom(),
    onZoomIn: () => canvasRef.current?.zoomIn(),
    onZoomOut: () => canvasRef.current?.zoomOut(),
  }), [findBlock]);

  useKeyboardShortcuts(shortcutHandlers);

  const [isDragging, setIsDragging] = useState(false);
  const [invalidDrop, setInvalidDrop] = useState(false);
  const dragCounter = useRef(0);
  const invalidDropTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.wld(\.bak\d*)?$/.test(file.name)) {
      handleWorldFileSelect(file);
    } else if (file) {
      setInvalidDrop(true);
      if (invalidDropTimer.current) clearTimeout(invalidDropTimer.current);
      invalidDropTimer.current = setTimeout(() => setInvalidDrop(false), 3000);
    }
  }, [handleWorldFileSelect]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ height: '100%', position: 'relative', backgroundColor: colorBgContainer }}
    >
      {(isDragging || invalidDrop) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1003,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none',
        }}>
          <div style={{
            padding: '32px 48px',
            borderRadius: 12,
            border: `3px dashed ${invalidDrop ? 'rgba(255, 100, 100, 0.7)' : 'rgba(255, 255, 255, 0.7)'}`,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: invalidDrop ? '#ff6464' : '#fff',
            fontSize: 24,
            fontWeight: 500,
          }}>
            {invalidDrop ? 'Only Terraria world files are supported' : 'Drop Terraria world file to open:'}
            <ul style={{ fontSize: 16 }}>
              <li>.wld</li>
              <li>.wld.bak</li>
              <li>.wld.bak2</li>
            </ul>
          </div>
        </div>
      )}
      <Layout >
        <Layout.Header style={{ backgroundColor: colorBgContainer, height: 'auto', lineHeight: 'normal', padding: '8px', display: 'flex', alignItems: 'center' }}>
          <Navbar
            npcs={world?.npcs ?? []}
            onClearHighlight={handleClearHighlight}
            onHighlightAll={handleHighlightAll}
            onNextBlock={() => findBlock(1)}
            onNpcSelect={(x, y) => {
              setSelectionPos({ x, y });
              canvasRef.current?.drawSelection(x, y);
              canvasRef.current?.panToTile(x, y);
            }}
            onOpenBlocks={() => setBlocksModalOpen(true)}
            // onPlayerFileSelect={onPlayerFileSelect}
            onPrevBlock={() => findBlock(-1)}
            onReloadWorld={handleReloadWorld}
            onResetZoom={() => canvasRef.current?.resetZoom()}
            onSaveImage={handleSaveImage}
            onSetSelect={handleSetSelect}
            onWorldFileSelect={handleWorldFileSelect}
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            // playerFileInputRef={playerFileInputRef}
            sets={sets}
            setTilePropsOpen={(tilePropsOpen) => setSiderCollapsed(!tilePropsOpen)}
            showWires={showWires}
            setShowWires={setShowWires}
            tilePropsOpen={!siderCollapsed}
            worldFileInputRef={worldFileInputRef}
            worldLoaded={!!world}
            worldProperties={worldProperties}
          />

        </Layout.Header>
        <Layout>
          <Layout.Content
            style={{
              padding: 0,
              margin: 0,
              background: colorBgContainer,
              // borderRadius: borderRadiusLG,
            }}>
            {!world && !isLoading && <HelpPanel />}
            <div style={{ display: world || isLoading ? 'block' : 'none', height: '100%' }}>
              <CanvasContainer
                ref={canvasRef}
                onTileHover={handleTileHover}
                onTileClick={handleTileClick}
              />
            </div>
          </Layout.Content>
          <Layout.Sider
            collapsed={siderCollapsed}
            collapsedWidth={48}
            onCollapse={(collapsed) => setSiderCollapsed(collapsed)}
            collapsible
            reverseArrow
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'sticky',
              insetInlineStart: 0,
              top: 0,
              bottom: 0,
              scrollbarWidth: 'thin',
              zIndex: 1001
            }}
            theme={antThemeName}
            width={200}
          >
            {siderCollapsed || !selectedTile ? (<></>) : (
              <div style={{ padding: 16 }}>
                <TileDescriptions selectedTile={selectedTile} tileInfoItems={tileInfoItems} />
              </div>)}
          </Layout.Sider>
        </Layout>
        <Layout.Footer>
          <StatusBar selectedTile={hoveredTile} status={status} isLoading={isLoading} />
        </Layout.Footer>
      </Layout>


      <BlockSelectorModal
        open={blocksModalOpen}
        onClose={(ok) => {
          setBlocksModalOpen(false);
          if (ok) {
            handleHighlightAll();
          } else {
            handleClearHighlight();
          }
        }}
        options={blockOptions}
        selectedValues={selectedBlocks}
        onSelectionChange={setSelectedBlocks}
      />
    </div>
  );
}
