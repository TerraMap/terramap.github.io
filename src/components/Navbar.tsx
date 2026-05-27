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
import { getShortcutsByHandler } from '../lib/keyboardShortcuts';
import { capitalizeFirstLetter } from '../lib/string';
import type { BlockSet, WorldNpc } from '../types/settings';
import ToolbarButton from './ToolbarButton';

export interface DirectoryFiles { worldFiles: File[], mapFiles: File[] };

interface NavbarProps {
  directoryInputRef: React.RefObject<HTMLInputElement | null>;
  npcs: WorldNpc[];
  onClearHighlight: () => void;
  onGoToTile: () => void;
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
  onToggleWorldProps: () => void;
  onWorldFilesFromDirectory: (directoryFiles: DirectoryFiles) => void;
  onWorldFileSelect: (file: File) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  sets: BlockSet[];
  setTilePropsOpen: (value: boolean) => void;
  showWires: boolean;
  setShowWires: (value: boolean) => void;
  tilePropsOpen: boolean;
  worldFileInputRef: React.RefObject<HTMLInputElement | null>;
  worldLoaded: boolean;
  worldProperties: Record<string, unknown>;
}

export function Navbar({
  directoryInputRef,
  npcs,
  onClearHighlight,
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
  onToggleWorldProps,
  onWorldFilesFromDirectory,
  onWorldFileSelect,
  onZoomIn,
  onZoomOut,
  sets,
  setShowWires,
  setTilePropsOpen,
  showWires,
  tilePropsOpen,
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
    const worldFiles = Array.from(files).filter(f => /\.wld(\.bak\d*)?$/.test(f.name));
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
    label: set.Name,
    onClick: () => onSetSelect(i),
  }));

  return (
    <>
      <Space wrap align="center">
        <span style={{ marginRight: 8, fontFamily: 'inherit' }}>TerraMap</span>

        <Space.Compact>
          <ToolbarButton
            shortcutHandler="onOpenFolder"
            onClick={() => directoryInputRef.current?.click()}>
            Folder
          </ToolbarButton>
          <ToolbarButton
            shortcutHandler="onOpenWorld"
            onClick={() => worldFileInputRef.current?.click()}>
            {typeof worldProperties?.name === 'string' ? worldProperties.name : 'World'}
          </ToolbarButton>
          {worldLoaded && (
            <ToolbarButton
              shortcutHandler="onReloadWorld"
              onClick={onReloadWorld}
            />)}
        </Space.Compact>

        {worldLoaded && (
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
              />
              <ToolbarButton
                shortcutHandler="onFindNext"
                onClick={onNextBlock}
              />
              <ToolbarButton
                shortcutHandler="onHighlight"
                onClick={onHighlightAll}
              />
              <ToolbarButton
                shortcutHandler="onClearHighlight"
                onClick={onClearHighlight}
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
                    key: "Go To Location",
                    label: <>Go To Location <Tag><kbd>l</kbd></Tag></>,
                    onClick: () => onGoToTile()
                  },
                  {
                    key: "Hide Tile Indicator",
                    label: <>Hide Tile Indicator <Tag><kbd>escape</kbd></Tag></>,
                    onClick: () => onHideTargetIndicator()
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
                    key: "Tile Info",
                    label: <>Tile Info  <Switch checked={tilePropsOpen} /> <Tag><kbd>t</kbd></Tag></>,
                    onClick: () => setTilePropsOpen(!tilePropsOpen)
                  },
                  {
                    key: 'Wires',
                    label: <>Wires <Switch checked={showWires} /> <Tag><kbd>w</kbd></Tag></>,
                    onClick: () => setShowWires(!showWires)
                  },
                  {
                    key: 'World Properties',
                    label: <>World Properties <Tag><kbd>p</kbd></Tag></>,
                    onClick: () => onToggleWorldProps()
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
              {tilePropsOpen ? 'Hide Tile Info Pane' : 'Show Tile Info Pane'}
              {getShortcutsByHandler('onToggleTileInfoPane').map(s => (
                <Tag key={s.key}><kbd>{s.key}</kbd></Tag>
              ))}
            </Space>}>
              <Switch
                checkedChildren="Tile Info"
                unCheckedChildren="Tile Info"
                checked={tilePropsOpen}
                onChange={(checked) => setTilePropsOpen(checked)}
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
