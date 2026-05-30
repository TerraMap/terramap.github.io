import { CloseOutlined } from '@ant-design/icons';
import { App as AntApp, Button, Drawer, Grid, Layout, Tabs, theme } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BlockSelectorModal } from './components/BlockSelectorModal';
import { CanvasContainer, CanvasContainerHandle } from './components/CanvasContainer';
import { DirectoryPickerModal } from './components/DirectoryPickerModal';
import { DropOverlay } from './components/DropOverlay';
import { HelpPanel } from './components/HelpPanel';
import { DirectoryFiles, Navbar } from './components/Navbar';
import { StatusBar } from './components/StatusBar';
import TileDescriptions from './components/TileDescriptions';
import { WorldPropertiesList } from './components/WorldPropertiesList';
import { useBlockHighlight } from './hooks/useBlockHighlight';
import { useBlockOptions } from './hooks/useBlockOptions';
import { useFileDrop } from './hooks/useFileDrop';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTileSelection } from './hooks/useTileSelection';
import { useWorldLoader } from './hooks/useWorldLoader';
import { readPlayerMap, type PlayerMap } from './lib/readPlayerMap';
import { sets } from './sets';

function NotificationBridge({ notificationRef }: { notificationRef: React.RefObject<ReturnType<typeof useApp>['notification'] | null> }) {
  const { notification } = useApp();
  notificationRef.current = notification;
  return null;
}

export default function AppContent() {
  const canvasRef = useRef<CanvasContainerHandle>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const worldFileInputRef = useRef<HTMLInputElement>(null);
  const playerMapRef = useRef<PlayerMap | null>(null);
  const { world, worldRef, status, loadWorldFile, isWorldLoading } = useWorldLoader(canvasRef, () => {
    if (playerMapRef.current) canvasRef.current?.renderFogOverlay(playerMapRef.current);
  });
  const blockOptions = useBlockOptions();
  const notificationRef = useRef<ReturnType<typeof useApp>['notification'] | null>(null);

  const [showWires, setShowWires] = useState(false);
  const [infoPaneCollapsed, setInfoPaneCollapsed] = useState(true);
  const [blocksModalOpen, setBlocksModalOpen] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [worldFile, setWorldFile] = useState<File | null>(null);
  const [directoryFiles, setDirectoryFiles] = useState<DirectoryFiles>();
  const [directoryPickerOpen, setDirectoryPickerOpen] = useState(false);
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [playerMap, setPlayerMapState] = useState<PlayerMap | null>(null);
  const setPlayerMap = useCallback((map: PlayerMap | null) => {
    playerMapRef.current = map;
    setPlayerMapState(map);
  }, []);

  const { token: { colorBgContainer, colorBgBase } } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const {
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
  } = useTileSelection(canvasRef, worldRef, () => {
    notificationRef.current?.warning({ message: `No matches found` });
  });

  const {
    selectedInfos,
    isHighlighting,
    highlightStatus,
    handleHighlightAll,
    handleClearHighlight,
    handleSetSelect,
  } = useBlockHighlight(canvasRef, worldRef, selectedBlocks, setShowWires, (count) => {
    if (count) {
      notificationRef.current?.success({ message: `Highlighted ${count.toLocaleString()} matches` });
    } else {
      notificationRef.current?.warning({ message: `No matches found` });
    }
  });

  const handleWorldFileSelect = useCallback((f: File) => {
    setWorldFile(f);
    loadWorldFile(f);
  }, [loadWorldFile]);

  const { isDragging, invalidDrop, dragProps } = useFileDrop(handleWorldFileSelect);

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

  useEffect(() => {
    if (playerMap && world) {
      canvasRef.current?.renderFogOverlay(playerMap);
    } else {
      canvasRef.current?.clearFogOverlay();
    }
  }, [playerMap, world]);

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

  const handleWorldFilesFromDirectory = useCallback((directoryFiles: DirectoryFiles) => {
    setDirectoryFiles(directoryFiles);
    setDirectoryPickerOpen(true);
  }, []);

  const handleDirectoryWorldSelected = useCallback((file: File, parsedMap: PlayerMap | null) => {
    setMapFile(parsedMap ? file : null);
    setPlayerMap(parsedMap);
    handleWorldFileSelect(file);
  }, [handleWorldFileSelect, setPlayerMap]);

  const handleReloadWorld = useCallback(async () => {
    if (mapFile) {
      const parsed = await readPlayerMap(mapFile);
      setPlayerMap(parsed);
    }
    if (worldFile) loadWorldFile(worldFile);
  }, [worldFile, mapFile, loadWorldFile, setPlayerMap]);

  const handleSaveImage = useCallback(() => {
    const w = worldRef.current;
    if (w) canvasRef.current?.saveImage(`${w.name}.png`);
  }, [worldRef]);

  const handleFindNext = useCallback(() => findBlock(1, selectedInfos), [findBlock, selectedInfos]);
  const handleFindPrev = useCallback(() => findBlock(-1, selectedInfos), [findBlock, selectedInfos]);
  const handleSetSelectWrapped = useCallback((index: number) => {
    const values = handleSetSelect(index, sets);
    if (values) setSelectedBlocks(values);
  }, [handleSetSelect]);

  const shortcutHandlers = useMemo(() => ({
    onClearHighlight: () => handleClearHighlight(),
    onFindNext: handleFindNext,
    onFindPrevious: handleFindPrev,
    onGoToTile: () => handleGoToTile(),
    onHideTileIndicator: () => hideTileIndicator(),
    onHighlight: () => handleHighlightAll(),
    onOpenBlocks: () => setBlocksModalOpen(true),
    onOpenFolder: () => directoryInputRef.current?.click(),
    onOpenWorld: () => worldFileInputRef.current?.click(),
    onReloadWorld: () => handleReloadWorld(),
    onResetZoom: () => canvasRef.current?.resetZoom(),
    onToggleInfoPane: () => setInfoPaneCollapsed((siderCollapsed) => !siderCollapsed),
    onToggleWires: () => setShowWires((showWires) => !showWires),
    onZoomIn: () => canvasRef.current?.zoomIn(),
    onZoomOut: () => canvasRef.current?.zoomOut(),
  }), [handleFindNext, handleFindPrev, handleGoToTile, hideTileIndicator, handleHighlightAll, handleClearHighlight, handleReloadWorld]);

  useKeyboardShortcuts(shortcutHandlers);

  return (
    <AntApp style={{ height: '100%' }}>
      <NotificationBridge notificationRef={notificationRef} />
      <div
        {...dragProps}
        style={{ height: '100%', position: 'relative', backgroundColor: colorBgContainer }}
      >
        <DropOverlay isDragging={isDragging} invalidDrop={invalidDrop} />
        <Layout style={{ height: '100%' }}>
          <Layout.Header style={{ backgroundColor: colorBgBase, height: 'auto', lineHeight: 'normal', padding: '8px', display: 'flex', alignItems: 'center' }}>
            <Navbar
              directoryInputRef={directoryInputRef}
              isHighlighting={isHighlighting}
              isSearching={isSearching}
              isWorldLoading={isWorldLoading}
              npcs={world?.npcs ?? []}
              onClearHighlight={handleClearHighlight}
              onGoToTile={handleGoToTile}
              onHideTargetIndicator={hideTileIndicator}
              onHighlightAll={handleHighlightAll}
              onNextBlock={handleFindNext}
              onNpcSelect={(x, y) => selectTile(x, y)}
              onOpenBlocks={() => setBlocksModalOpen(true)}
              onPrevBlock={handleFindPrev}
              onReloadWorld={handleReloadWorld}
              onResetZoom={() => canvasRef.current?.resetZoom()}
              onSaveImage={handleSaveImage}
              onSetSelect={handleSetSelectWrapped}
              onWorldFileSelect={handleWorldFileSelect}
              onWorldFilesFromDirectory={handleWorldFilesFromDirectory}
              onZoomIn={() => canvasRef.current?.zoomIn()}
              onZoomOut={() => canvasRef.current?.zoomOut()}
              sets={sets}
              setShowWires={setShowWires}
              setInfoPaneOpen={(value) => setInfoPaneCollapsed(!value)}
              showWires={showWires}
              infoPaneOpen={!infoPaneCollapsed}
              worldFileInputRef={worldFileInputRef}
              worldLoaded={!!world}
              worldProperties={worldProperties}
            />
          </Layout.Header>
          <div ref={contentAreaRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative', display: 'flex' }}>
            <Layout.Content
              style={{
                padding: 0,
                margin: 0,
                background: colorBgContainer,
                overflow: 'auto',
              }}>
              {!world && !isWorldLoading && <HelpPanel
                worldFileInputRef={worldFileInputRef} directoryInputRef={directoryInputRef} />}
              <div style={{ display: world || isWorldLoading ? 'block' : 'none', height: '100%' }}>
                <CanvasContainer
                  ref={canvasRef}
                  onTileHover={handleTileHover}
                  onTileClick={handleTileClick}
                  handleTileDoubleClick={hideTileIndicator}
                />
              </div>
            </Layout.Content>

            <Drawer
              closable={false}
              getContainer={() => contentAreaRef.current!}
              mask={false}
              open={!infoPaneCollapsed}
              onClose={() => setInfoPaneCollapsed(true)}
              placement={isMobile ? "bottom" : "right"}
              rootStyle={{ position: 'absolute' }}
              styles={{
                wrapper: isMobile ? { height: 'auto', maxHeight: '50vh' } : { width: 'auto' },
                body: {
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: !isMobile ? 225 : undefined,
                  overflow: 'hidden',
                  padding: '.5rem',
                  paddingTop: 0
                }
              }}
            >
              <Tabs
                tabBarExtraContent={
                  {
                    left: <Button size="small" type="text" icon={<CloseOutlined />}
                      onClick={() => setInfoPaneCollapsed(true)}
                      style={{ marginRight: '1rem' }}
                    />
                  }}
                items={[
                  {
                    key: 'Tile',
                    label: 'Tile',
                    children: <div style={{ overflow: 'auto', maxHeight: isMobile ? 'calc(50vh - 100px)' : 'calc(100vh - 100px)' }}>
                      {selectedTile && <TileDescriptions selectedTile={selectedTile} />}
                    </div>
                  },
                  {
                    key: "World",
                    label: 'World',
                    children: <WorldPropertiesList worldProperties={worldProperties} maxHeight={isMobile ? 'calc(50vh - 100px)' : 'calc(100vh - 100px)'} />
                  }
                ]} />
            </Drawer>
          </div>
          <Layout.Footer style={{ padding: 0 }}>
            <StatusBar selectedTile={hoveredTile} status={highlightStatus || searchStatus || status} isLoading={isWorldLoading || isSearching || !!highlightStatus} />
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

        <DirectoryPickerModal
          open={directoryPickerOpen}
          directoryFiles={directoryFiles}
          onClose={() => setDirectoryPickerOpen(false)}
          onWorldSelected={handleDirectoryWorldSelected}
        />
      </div>
    </AntApp>
  );
}
