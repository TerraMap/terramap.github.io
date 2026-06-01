import {
  CameraOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  SunOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space, Switch, Tag, Tooltip } from 'antd';
import firstBy from 'thenby';
import useThemeMenuItems from '../hooks/useThemeMenuItems';
import { useThemeName } from '../hooks/useThemeName';
import { getShortcutByHandler } from '../lib/keyboardShortcuts';
import { capitalizeFirstLetter, truncateString } from '../lib/string';
import type { BlockSet, WorldNpc } from '../types/settings';
import ToolbarButton from './ToolbarButton';

export interface DirectoryFiles { worldFiles: File[], mapFiles: File[] };

interface NavbarProps {
  directoryInputRef: React.RefObject<HTMLInputElement | null>;
  infoPaneOpen: boolean;
  isHighlighting: boolean;
  isSearching: boolean;
  isWorldLoading: boolean;
  npcs: WorldNpc[];
  onClearHighlight: () => void;
  onGoToDungeon: () => void;
  onGoToSpawn: () => void;
  onGoToTile: (point?: { x: number, y: number }) => void;
  onHideTargetIndicator: () => void;
  onHighlightAll: () => void;
  onNextBlock: () => void;
  onNpcSelect: (x: number, y: number) => void;
  onOpenBlocks: () => void;
  onPrevBlock: () => void;
  onReloadWorld: () => void;
  onResetZoom: () => void;
  onSaveImage: () => void;
  onSetSelect: (index: number) => void;
  onWorldFileSelect: (file: File) => void;
  onWorldFilesFromDirectory: (directoryFiles: DirectoryFiles) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  setInfoPaneOpen: (value: boolean) => void;
  sets: BlockSet[];
  setShowWires: (value: boolean) => void;
  showWires: boolean;
  worldFileInputRef: React.RefObject<HTMLInputElement | null>;
  worldLoaded: boolean;
  worldProperties: Record<string, unknown>;
}

export function Navbar({
  directoryInputRef,
  infoPaneOpen,
  isHighlighting,
  isSearching,
  isWorldLoading,
  npcs,
  onClearHighlight,
  onGoToDungeon,
  onGoToSpawn,
  onGoToTile,
  onHideTargetIndicator,
  onHighlightAll,
  onNextBlock,
  onNpcSelect,
  onOpenBlocks,
  onPrevBlock,
  onReloadWorld,
  onResetZoom,
  onSaveImage,
  onSetSelect,
  onWorldFileSelect,
  onWorldFilesFromDirectory,
  onZoomIn,
  onZoomOut,
  setInfoPaneOpen,
  sets,
  setShowWires,
  showWires,
  worldFileInputRef,
  worldLoaded,
  worldProperties,
}: NavbarProps) {
  const { isDarkMode, themeName } = useThemeName();
  const themeMenuItems = useThemeMenuItems();

  const handleWorldFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onWorldFileSelect(file);
  };

  const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const worldFiles = Array.from(files).filter(f => /\.wld$/.test(f.name));
    const mapFiles = Array.from(files).filter(f => f.name.endsWith('.map'));
    onWorldFilesFromDirectory({ worldFiles, mapFiles });
  };

  const npcMenuItems: MenuProps['items'] = npcs.map((npc, i) => ({
    key: i,
    label: !npc.name ? npc.type : npc.name !== npc.type ? `${npc.type} - ${npc.name}` : npc.name,
    onClick: () => onNpcSelect(npc.x, npc.y),
  })).sort(firstBy('label'));

  const setMenuItems: MenuProps['items'] = sets.map((set, i) => ({
    key: i,
    label: set.name,
    onClick: () => onSetSelect(i),
  }));

  return (
    <>
      <Space wrap align="center">
        <span style={{ marginRight: 8, fontFamily: 'inherit' }}>TerraMap</span>

        <Space.Compact>
          <ToolbarButton
            loading={isWorldLoading}
            shortcutHandler="onOpenFolder"
            onClick={() => directoryInputRef.current?.click()}>
            {!worldLoaded ? 'Folder' : undefined}
          </ToolbarButton>
          <ToolbarButton
            loading={isWorldLoading}
            shortcutHandler="onOpenWorld"
            onClick={() => worldFileInputRef.current?.click()}>
            {typeof worldProperties?.name === 'string'
              ? <span title={worldProperties.name}>
                {truncateString(worldProperties.name)}
              </span>
              : 'World'}
          </ToolbarButton>
          {worldLoaded && (
            <ToolbarButton
              loading={isWorldLoading}
              shortcutHandler="onReloadWorld"
              onClick={onReloadWorld}
            />)}
        </Space.Compact>

        {!isWorldLoading && worldLoaded && (
          <>
            <Space.Compact>
              <Dropdown menu={{ items: setMenuItems }}>
                <Button>Sets</Button>
              </Dropdown>

              <ToolbarButton
                shortcutHandler="onOpenBlocks"
                onClick={onOpenBlocks}>
                Blocks
              </ToolbarButton>
              <ToolbarButton
                shortcutHandler="onFindPrevious"
                onClick={onPrevBlock}
                loading={isSearching}
              />
              <ToolbarButton
                shortcutHandler="onFindNext"
                onClick={onNextBlock}
                loading={isSearching}
              />
              <ToolbarButton
                shortcutHandler="onHighlight"
                onClick={onHighlightAll}
                loading={isHighlighting}
              />
              <ToolbarButton
                shortcutHandler="onClearHighlight"
                onClick={onClearHighlight}
                loading={isHighlighting}
              />
            </Space.Compact>

            <Space.Compact>
              <ToolbarButton
                shortcutHandler="onZoomIn"
                onClick={onZoomIn}
              />
              <ToolbarButton
                shortcutHandler="onZoomOut"
                onClick={onZoomOut}
              />
              <ToolbarButton
                shortcutHandler="onResetZoom"
                onClick={onResetZoom}
              />
              <ToolbarButton
                icon={<CameraOutlined />}
                onClick={onSaveImage}
                tooltip="Save Image"
              />
            </Space.Compact>

            <Space.Compact>
              <Dropdown menu={{
                items: [
                  {
                    key: "Go To Dungeon",
                    label: <>Go To Dungeon <Tag><kbd>d</kbd></Tag></>,
                    onClick: () => onGoToDungeon()
                  },
                  {
                    key: "Go To Location",
                    label: <>Go To Location <Tag><kbd>l</kbd></Tag></>,
                    onClick: () => onGoToTile()
                  },
                  {
                    key: "Go To Spawn",
                    label: <>Go To Spawn <Tag><kbd>s</kbd></Tag></>,
                    onClick: () => onGoToSpawn()
                  },
                  {
                    key: "Hide Tile Indicator",
                    label: <>Hide Tile Indicator <Tag><kbd>escape</kbd></Tag></>,
                    onClick: () => onHideTargetIndicator()
                  },
                  {
                    key: "Info Pane",
                    label: <>Info Pane <Switch checked={infoPaneOpen} /> <Tag><kbd>i</kbd></Tag></>,
                    onClick: () => setInfoPaneOpen(!infoPaneOpen)
                  },
                  {
                    key: "NPCs",
                    label: "NPCs",
                    children: npcMenuItems
                  },
                  {
                    key: "Theme",
                    label: "Theme",
                    children: themeMenuItems
                  },
                  {
                    key: 'Wires',
                    label: <>Wires <Switch checked={showWires} /> <Tag><kbd>w</kbd></Tag></>,
                    onClick: () => setShowWires(!showWires)
                  }
                ]
              }}>
                <Button>View</Button>
              </Dropdown>
              <Dropdown menu={{ items: themeMenuItems }}>
                <Button icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />} />
              </Dropdown>
            </Space.Compact>

            <Tooltip title={<Space>
              {infoPaneOpen ? 'Hide Info Pane' : 'Show Info Pane'}
              {
                <Tag key={getShortcutByHandler('onToggleInfoPane')?.key}>
                  <kbd>{getShortcutByHandler('onToggleInfoPane')?.key}</kbd>
                </Tag>
              }
            </Space>}>
              <Switch
                checkedChildren="Info"
                unCheckedChildren="Info"
                checked={infoPaneOpen}
                onChange={(checked) => setInfoPaneOpen(checked)}
              />
            </Tooltip>
          </>
        )
        }

        {
          !worldLoaded && (
            <Tooltip title={`Theme - ${capitalizeFirstLetter(themeName)} Mode`}>
              <Dropdown menu={{ items: themeMenuItems }}>
                <Button icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />} />
              </Dropdown>
            </Tooltip>
          )
        }

        <Tooltip title="About">
          <Button
            type="link"
            icon={<QuestionCircleOutlined />}
            href="about.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: 'auto' }}
          />
        </Tooltip>

      </Space >

      <input
        ref={worldFileInputRef}
        type="file"
        accept=".wld"
        onChange={handleWorldFileChange}
        style={{ display: 'none', visibility: 'collapse', width: 0 }}
      />

      <input
        ref={directoryInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is not in the React type definitions
        webkitdirectory=""
        onChange={handleDirectoryChange}
        style={{ display: 'none', visibility: 'collapse', width: 0 }}
      />

    </>
  );
}
