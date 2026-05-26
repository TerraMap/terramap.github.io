import {
  CameraOutlined,
  CloseOutlined,
  ExpandOutlined,
  GlobalOutlined,
  HighlightOutlined,
  LeftOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SunOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Drawer, Dropdown, Input, Space, Switch, Tooltip } from 'antd';
import { useState } from 'react';
import firstBy from 'thenby';
import useThemeMenuItems from '../hooks/useThemeMenuItems';
import { useThemeName } from '../hooks/useThemeName';
import { capitalizeFirstLetter } from '../lib/string';
import type { BlockSet, WorldNpc } from '../types/settings';
import ToolbarButton from './ToolbarButton';

interface NavbarProps {
  npcs: WorldNpc[];
  onClearHighlight: () => void;
  onHighlightAll: () => void;
  onNextBlock: () => void;
  onNpcSelect: (x: number, y: number) => void;
  onOpenBlocks: () => void;
  // onPlayerFileSelect: (file: File) => void;
  onPrevBlock: () => void;
  onReloadWorld: () => void;
  onResetZoom: () => void;
  onSaveImage: () => void;
  onSetSelect: (index: number) => void;
  onWorldFileSelect: (file: File) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  // playerFileInputRef: React.RefObject<HTMLInputElement | null>;
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
  npcs,
  onClearHighlight,
  onHighlightAll,
  onNextBlock,
  onNpcSelect,
  onOpenBlocks,
  // onPlayerFileSelect,
  onPrevBlock,
  onReloadWorld,
  onResetZoom,
  onSaveImage,
  onSetSelect,
  onWorldFileSelect,
  onZoomIn,
  onZoomOut,
  // playerFileInputRef,
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
  const [worldPropsOpen, setWorldPropsOpen] = useState(false);
  const [propsFilter, setPropsFilter] = useState('');

  const handleWorldFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onWorldFileSelect(file);
  };

  // const handlePlayerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) onPlayerFileSelect(file);
  // };

  const npcMenuItems: MenuProps['items'] = npcs.map((npc, i) => ({
    key: i,
    label: npc.name !== npc.type ? `${npc.type} - ${npc.name}` : npc.name,
    onClick: () => onNpcSelect(npc.x, npc.y),
  })).sort(firstBy('label'));

  const setMenuItems: MenuProps['items'] = sets.map((set, i) => ({
    key: i,
    label: set.Name,
    onClick: () => onSetSelect(i),
  }));

  return (
    <Space wrap align="center">
      <span style={{ marginRight: 8, fontFamily: 'inherit' }}>TerraMap</span>

      <Space.Compact>
        <ToolbarButton
          keyboardShortcut="W"
          icon={<GlobalOutlined />}
          onClick={() => worldFileInputRef.current?.click()}
          tooltip="Open Terraria World File">
          {typeof worldProperties?.name === 'string' ? worldProperties.name : 'World'}
        </ToolbarButton>
        <input
          ref={worldFileInputRef}
          type="file"
          accept=".wld"
          onChange={handleWorldFileChange}
          style={{ display: 'none' }}
        />
        {/* <ToolbarButton
          keyboardShortcut="P"
          icon={<CompassOutlined />}
          onClick={() => playerFileInputRef.current?.click()}
          tooltip="Open Terraria Player Map File">
          Player
        </ToolbarButton>
        <Select defaultValue="No Spoilers" popupMatchSelectWidth={false}
          style={{ width: 125 }}
          onSelect={(value) => {
            if (value === 'Player Map') {
              playerFileInputRef.current?.click();
            }
          }}
          options={[
            {
              key: 'No Spoilers',
              label: 'No Spoilers',
              value: 'No Spoilers'
            },
            {
              key: 'All Spoilers',
              label: 'All Spoilers',
              value: 'All Spoilers'
            },
            {
              key: 'Player Map uniqueId',
              label:
                <>
                  Player Map {worldLoaded && worldProperties.uniqueId &&
                    <Tag>
                      {`${worldProperties.uniqueId}.map`}
                    </Tag>
                  }
                </>,
              value: 'Player Map'
            },
            {
              key: 'Player Map id',
              label:
                <>
                  Player Map {worldLoaded && worldProperties.id &&
                    <Tag>
                      {`${worldProperties.id}.map`}
                    </Tag>
                  }
                </>,
              value: 'Player Map'
            }
          ]}
        />
        <input
          ref={playerFileInputRef}
          type="file"
          accept={worldLoaded && worldProperties.uniqueId ? `${worldProperties.uniqueId}.map` : ".map"}
          onChange={handlePlayerFileChange}
          style={{ display: 'none' }}
        /> */}
        {worldLoaded && (
          <ToolbarButton
            keyboardShortcut="R"
            icon={<ReloadOutlined />}
            onClick={onReloadWorld}
            tooltip="Reload World & Player Map"
          />)}
      </Space.Compact>

      {worldLoaded && (
        <>
          <Space.Compact>
            <Dropdown menu={{ items: setMenuItems }}>
              <Button>Sets</Button>
            </Dropdown>

            <ToolbarButton
              keyboardShortcut="F"
              icon={<SearchOutlined />}
              onClick={onOpenBlocks}
              tooltip="Choose Blocks">
              Blocks
            </ToolbarButton>
            <ToolbarButton
              keyboardShortcut={["Shift", "G"]}
              icon={<LeftOutlined />}
              onClick={onPrevBlock}
              tooltip="Find Previous Block"
            />
            <ToolbarButton
              keyboardShortcut="G"
              icon={<RightOutlined />}
              onClick={onNextBlock}
              tooltip="Find Next Block"
            />
            <ToolbarButton
              keyboardShortcut="H"
              icon={<HighlightOutlined />}
              onClick={onHighlightAll}
              tooltip="Highlight All Matching Blocks"
            />
            <ToolbarButton
              keyboardShortcut="X"
              icon={<CloseOutlined />}
              onClick={onClearHighlight}
              tooltip="Clear Highlighted Blocks"
            />
          </Space.Compact>

          <Space.Compact>
            <ToolbarButton
              keyboardShortcut="E"
              icon={<ZoomInOutlined />}
              onClick={onZoomIn}
              tooltip="Zoom In"
            />
            <ToolbarButton
              keyboardShortcut="C"
              icon={<ZoomOutOutlined />}
              onClick={onZoomOut}
              tooltip="Zoom Out"
            />
            <ToolbarButton
              keyboardShortcut="Z"
              icon={<ExpandOutlined />}
              onClick={onResetZoom}
              tooltip="Reset Zoom"
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
                  key: "NPCs",
                  label: "NPCs",
                  children: npcMenuItems
                },
                {
                  key: "Tile Info",
                  label: tilePropsOpen ? "Hide Tile Info" : "Show Tile Info",
                  onClick: () => setTilePropsOpen(!tilePropsOpen)
                },
                {
                  key: "Theme",
                  label: "Theme",
                  children: themeMenuItems
                },
                {
                  key: 'Wires',
                  label: showWires ? "Hide Wires" : "Show Wires",
                  onClick: () => setShowWires(!showWires)
                },
                {
                  key: 'World Properties',
                  label: 'World Properties',
                  onClick: () => setWorldPropsOpen(true)
                }
              ]
            }}>
              <Button>View</Button>
            </Dropdown>
            <Tooltip title={`Theme - ${capitalizeFirstLetter(themeName)} Mode`}>
              <Dropdown menu={{ items: themeMenuItems }}>
                <Button icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />} />
              </Dropdown>
            </Tooltip>
          </Space.Compact>

          <Switch
            checkedChildren="Tile Info"
            unCheckedChildren="Tile Info"
            checked={tilePropsOpen}
            onChange={(checked) => setTilePropsOpen(checked)}
          />
        </>
      )}


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

      <Drawer
        title={
          <Space>
            <Button size="small" type="text" icon={<CloseOutlined />} onClick={() => setWorldPropsOpen(false)} />
            World Properties
          </Space>}
        mask={false}
        open={worldPropsOpen}
        closable={false}
        zIndex={1100}
      >
        <Input
          placeholder="Filter world properties..."
          allowClear
          value={propsFilter}
          onChange={(e) => setPropsFilter(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {Object.keys(worldProperties).filter(k => !k.startsWith('_')).sort()
            .filter((key) => {
              if (!propsFilter) return true;
              const q = propsFilter.toLowerCase();
              return key.toLowerCase().includes(q) || String(worldProperties[key]).toLowerCase().includes(q);
            })
            .map((key) => (
              <li key={key} style={{ padding: '4px 0' }}>
                <strong>{key}:</strong> {String(worldProperties[key])}
              </li>
            ))}
        </ul>
      </Drawer>
    </Space>
  );
}
