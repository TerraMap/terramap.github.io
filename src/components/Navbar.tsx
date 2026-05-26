import {
  CameraOutlined,
  CloseOutlined,
  ExpandOutlined,
  HighlightOutlined,
  LeftOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SunOutlined,
  UploadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Drawer, Dropdown, Flex, Input, Space, theme, Tooltip } from 'antd';
import { useState } from 'react';
import firstBy from 'thenby';
import useThemeMenuItems from '../hooks/useThemeMenuItems';
import { useThemeName } from '../hooks/useThemeName';
import type { BlockSet, WorldNpc } from '../types/settings';
import ToolbarButton from './ToolbarButton';

interface NavbarProps {
  worldLoaded: boolean;
  npcs: WorldNpc[];
  sets: BlockSet[];
  worldProperties: Record<string, unknown>;
  tileInfoItems: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File) => void;
  onOpenBlocks: () => void;
  onPrevBlock: () => void;
  onNextBlock: () => void;
  onHighlightAll: () => void;
  onClearHighlight: () => void;
  onResetZoom: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSaveImage: () => void;
  onReload: () => void;
  onNpcSelect: (x: number, y: number) => void;
  onSetSelect: (index: number) => void;
}

export function Navbar({
  fileInputRef,
  worldLoaded,
  npcs,
  sets,
  worldProperties,
  tileInfoItems,
  onFileSelect,
  onOpenBlocks,
  onPrevBlock,
  onNextBlock,
  onHighlightAll,
  onClearHighlight,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  onSaveImage,
  onReload,
  onNpcSelect,
  onSetSelect,
}: NavbarProps) {
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const { isDarkMode } = useThemeName();
  const themeMenuItems = useThemeMenuItems();
  const [propsOpen, setPropsOpen] = useState(false);
  const [propsFilter, setPropsFilter] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

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

  const tileInfoMenuItems: MenuProps['items'] = tileInfoItems.map((item, i) => ({
    key: i,
    label: item,
  }));

  return (
    <Flex
      align="center"
      gap="small"
      wrap="wrap"
      style={{
        padding: '8px 16px',
        background: colorBgLayout,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <span style={{ marginRight: 8, fontFamily: 'inherit' }}>TerraMap</span>

      <Space.Compact>
        <input
          ref={fileInputRef}
          type="file"
          accept=".wld"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <ToolbarButton
          keyboardShortcut="O"
          icon={<UploadOutlined />}
          onClick={() => fileInputRef.current?.click()}
          tooltip="Open Terraria World File">
          Open
        </ToolbarButton>
        <ToolbarButton
          keyboardShortcut="R"
          icon={<ReloadOutlined />}
          onClick={onReload}
          tooltip="Reload World"
        />
      </Space.Compact>

      {worldLoaded && (
        <>
          <Space.Compact>
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

          <Dropdown menu={{ items: setMenuItems }} trigger={['click']}>
            <Button>Sets</Button>
          </Dropdown>
          <Dropdown menu={{ items: npcMenuItems }} trigger={['click']}>
            <Button>NPCs</Button>
          </Dropdown>
          <Button onClick={() => setPropsOpen(true)} disabled={propsOpen}>World Properties</Button>

          {tileInfoItems.length > 0 && (
            <Dropdown menu={{ items: tileInfoMenuItems }} trigger={['click']}>
              <Button>Tile Info</Button>
            </Dropdown>
          )}
        </>
      )}

      <Dropdown menu={{ items: themeMenuItems }} trigger={['click']}>
        <Button icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />} />
      </Dropdown>

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
        title="World Properties"
        open={propsOpen}
        onClose={() => setPropsOpen(false)}
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
    </Flex>
  );
}
