import { CloseOutlined } from '@ant-design/icons';
import { App as AntApp, App, Button, Drawer, Grid, Layout, Tabs, theme } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockSelectorModal } from './components/BlockSelectorModal';
import type { CanvasContainerHandle } from './components/CanvasContainer';
import { CanvasContainer } from './components/CanvasContainer';
import { DirectoryPickerModal } from './components/DirectoryPickerModal';
import { DropOverlay } from './components/DropOverlay';
import { HelpPanel } from './components/HelpPanel';
import type { DirectoryFiles } from './components/Navbar';
import { Navbar } from './components/Navbar';
import { StatusBar } from './components/StatusBar';
import TileDescriptions from './components/TileDescriptions';
import { WorldPickerModal } from './components/WorldPickerModal';
import { WorldPropertiesList } from './components/WorldPropertiesList';
import { WorldSpread } from './components/WorldSpread';
import { useBlockHighlight } from './hooks/useBlockHighlight';
import { useBlockOptions } from './hooks/useBlockOptions';
import { useFileDrop } from './hooks/useFileDrop';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useNative } from './hooks/useNative';
import { useTileSelection } from './hooks/useTileSelection';
import { useWorldLoader } from './hooks/useWorldLoader';
import { readPlayerMap, type PlayerMap } from './lib/readPlayerMap';
import { sets } from './sets';

function NotificationBridge({ notificationRef }: { notificationRef: React.RefObject<ReturnType<typeof App.useApp>['notification'] | null> }) {
  const { notification } = App.useApp();
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
  const notificationRef = useRef<ReturnType<typeof App.useApp>['notification'] | null>(null);

  const [showWires, setShowWires] = useState(false);
  const [infoPaneCollapsed, setInfoPaneCollapsed] = useState(true);
  const [blocksModalOpen, setBlocksModalOpen] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [worldFile, setWorldFile] = useState<File | null>(null);
  const [directoryFiles, setDirectoryFiles] = useState<DirectoryFiles>();
  const [directoryPickerOpen, setDirectoryPickerOpen] = useState(false);
  const [worldPickerOpen, setWorldPickerOpen] = useState(false);
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [playerMap, setPlayerMapState] = useState<PlayerMap | null>(null);
  const setPlayerMap = useCallback((map: PlayerMap | null) => {
    playerMapRef.current = map;
    setPlayerMapState(map);
  }, []);

  const { t } = useTranslation();
  const { token: { colorBgContainer, colorBgBase } } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const { available: nativeAvailable, ready: nativeReady } = useNative();
  const checkingNativeAccess = nativeAvailable && !nativeReady;

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
    const solid = world._solidBlockCount as number | undefined;
    if (solid && solid > 0) {
      const fmt = (count: number) => {
        const pct = (count / solid).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 });
        return `${count.toLocaleString()} (${pct})`;
      };
      const corrupt = world._corruptBlockCount as number | undefined;
      const crimson = world._crimsonBlockCount as number | undefined;
      const hallow = world._hallowBlockCount as number | undefined;
      if (corrupt !== undefined) props.corruptBlocks = fmt(corrupt);
      if (crimson !== undefined) props.crimsonBlocks = fmt(crimson);
      if (hallow !== undefined) props.hallowBlocks = fmt(hallow);
      if (solid !== undefined) props.solidBlocks = solid.toLocaleString();
    }
    return props;
  }, [world]);

  const {
    findBlock,
    goToTile,
    tileClick,
    tileHover,
    hideTileIndicator,
    hoveredTile,
    isSearching,
    searchStatus,
    selectedTile,
  } = useTileSelection(canvasRef, worldRef, playerMapRef, () => {
    notificationRef.current?.warning({ key: 'match', title: t('no_matches_found'), placement: 'bottomRight' });
  });

  const {
    selectedInfos,
    isHighlighting,
    highlightStatus,
    handleHighlightAll,
    handleClearHighlight,
    handleSetSelect,
  } = useBlockHighlight(canvasRef, worldRef, selectedBlocks, setShowWires, playerMapRef, (count) => {
    if (count) {
      notificationRef.current?.success({ key: 'match', title: t('highlighted_matches', { n: count.toLocaleString() }), placement: 'bottomRight' });
    } else {
      notificationRef.current?.warning({ key: 'match', title: t('no_matches_found'), placement: 'bottomRight' });
    }
  });

  const handleWorldFileSelect = useCallback((f: File) => {
    setWorldFile(f);
    setMapFile(null);
    setPlayerMap(null);
    loadWorldFile(f);
  }, [loadWorldFile, setPlayerMap]);

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

  const handleWorldFilesFromDirectory = useCallback((directoryFiles: DirectoryFiles) => {
    setDirectoryFiles(directoryFiles);
    setDirectoryPickerOpen(true);
  }, []);

  const handleDirectoryWorldSelected = useCallback((file: File, mapFile: File | null, playerMap: PlayerMap | null) => {
    handleWorldFileSelect(file);
    setMapFile(mapFile);
    setPlayerMap(playerMap);
    if (playerMap?.percent !== undefined) {
      notificationRef.current?.info({ key: 'explored', title: t('explored_percent', { percent: playerMap?.percent.toLocaleString(undefined, { style: 'percent' }) }), placement: 'bottomRight' });
    }
  }, [handleWorldFileSelect, setPlayerMap, t]);

  const handleReloadWorld = useCallback(async () => {
    if (worldFile) loadWorldFile(worldFile);
    if (mapFile) {
      const playerMap = await readPlayerMap(mapFile);
      setPlayerMap(playerMap);
      if (playerMap?.percent !== undefined) {
        notificationRef.current?.info({ key: 'explored', title: t('explored_percent', { percent: playerMap?.percent.toLocaleString(undefined, { style: 'percent' }) }), placement: 'bottomRight' });
      }
    }
  }, [worldFile, mapFile, loadWorldFile, setPlayerMap, notificationRef, t]);

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
    onGoToDungeon: () => {
      const x = worldProperties.dungeonX;
      const y = worldProperties.dungeonY;
      if (typeof x === 'number' && typeof y === 'number') goToTile({ x, y });
    },
    onGoToSpawn: () => {
      const x = worldProperties.spawnX;
      const y = worldProperties.spawnY;
      if (typeof x === 'number' && typeof y === 'number') goToTile({ x, y });
    },
    onGoToTile: () => goToTile(),
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
  }), [handleFindNext, handleFindPrev, goToTile, hideTileIndicator, handleHighlightAll, handleClearHighlight, handleReloadWorld, worldProperties]);

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
              infoPaneOpen={!infoPaneCollapsed}
              isHighlighting={isHighlighting}
              isSearching={isSearching}
              isWorldLoading={isWorldLoading}
              checkingNative={checkingNativeAccess}
              nativeAvailable={nativeAvailable}
              npcs={world?.npcs ?? []}
              isTileExplored={(x, y) => {
                const pm = playerMapRef.current;
                if (!pm || !world) return true;
                return !!pm.explored[Math.floor(x) * world.height + Math.floor(y)];
              }}
              onChooseWorld={() => setWorldPickerOpen(true)}
              onClearHighlight={handleClearHighlight}
              onGoToTile={goToTile}
              onHideTargetIndicator={hideTileIndicator}
              onHighlightAll={handleHighlightAll}
              onNextBlock={handleFindNext}
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
              setInfoPaneOpen={(value) => setInfoPaneCollapsed(!value)}
              sets={sets}
              setShowWires={setShowWires}
              showWires={showWires}
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
                worldFileInputRef={worldFileInputRef}
                directoryInputRef={directoryInputRef}
                checkingNative={checkingNativeAccess}
                nativeAvailable={nativeAvailable}
                onChooseWorld={() => setWorldPickerOpen(true)} />}
              <div style={{ display: world || isWorldLoading ? 'block' : 'none', height: '100%' }}>
                <CanvasContainer
                  ref={canvasRef}
                  onTileHover={tileHover}
                  onTileClick={tileClick}
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
                  maxWidth: !isMobile ? 250 : undefined,
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
                    label: t('tab_tile'),
                    children: <div style={{ overflow: 'auto', maxHeight: isMobile ? 'calc(50vh - 100px)' : 'calc(100vh - 100px)' }}>
                      {selectedTile && <TileDescriptions selectedTile={selectedTile} />}
                    </div>
                  },
                  {
                    key: "World",
                    label: t('tab_world'),
                    children: <WorldPropertiesList worldProperties={worldProperties} playerMap={playerMap} maxHeight={isMobile ? 'calc(50vh - 100px)' : 'calc(100vh - 100px)'} />
                  },
                  {
                    key: "Spread",
                    label: t('tab_spread'),
                    children: <WorldSpread worldProperties={worldProperties} playerMap={playerMap} maxHeight={isMobile ? 'calc(50vh - 100px)' : 'calc(100vh - 100px)'} />
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

        {worldPickerOpen && (
          <WorldPickerModal
            open={worldPickerOpen}
            onClose={() => setWorldPickerOpen(false)}
            onWorldSelected={handleDirectoryWorldSelected}
            nativeReady={nativeReady} />
        )}

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
