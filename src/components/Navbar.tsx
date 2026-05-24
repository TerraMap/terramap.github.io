import {
  CameraOutlined,
  CloseOutlined,
  ExpandOutlined,
  HighlightOutlined,
  LeftOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Drawer, Dropdown, Flex, Input, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';

interface NavbarProps {
  isLoading: boolean;
  worldLoaded: boolean;
  npcs: any[];
  sets: any[];
  worldProperties: Record<string, any>;
  tileInfoItems: string[];
  onFileSelect: (file: File) => void;
  onOpenBlocks: () => void;
  onPrevBlock: () => void;
  onNextBlock: () => void;
  onHighlightAll: () => void;
  onClearHighlight: () => void;
  onResetZoom: () => void;
  onSaveImage: () => void;
  onReload: () => void;
  onNpcSelect: (x: number, y: number) => void;
  onSetSelect: (index: number) => void;
}

export function Navbar({
  isLoading,
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
  onSaveImage,
  onReload,
  onNpcSelect,
  onSetSelect,
}: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [propsOpen, setPropsOpen] = useState(false);
  const [propsFilter, setPropsFilter] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const npcMenuItems: MenuProps['items'] = npcs.map((npc, i) => ({
    key: i,
    label: npc.name !== npc.type ? `${npc.name} the ${npc.type}` : npc.name,
    onClick: () => onNpcSelect(npc.x, npc.y),
  }));

  const setMenuItems: MenuProps['items'] = sets.map((set: any, i: number) => ({
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
        background: '#001529',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <span style={{ color: '#fff', marginRight: 8, fontFamily: 'inherit' }}>TerraMap</span>

      <Tooltip title="Open Terraria World File">
        <input
          ref={fileInputRef}
          type="file"
          accept=".wld"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Button icon={<UploadOutlined />} loading={isLoading} onClick={() => fileInputRef.current?.click()}>
          Open
        </Button>
      </Tooltip>

      {worldLoaded && (
        <>
          <Space.Compact>
            <Tooltip title="Choose Blocks (b)">
              <Button icon={<SearchOutlined />} onClick={onOpenBlocks} disabled={!worldLoaded}>
                Blocks
              </Button>
            </Tooltip>
            <Tooltip title="Find Previous Block"><Button icon={<LeftOutlined />} onClick={onPrevBlock} disabled={!worldLoaded} /></Tooltip>
            <Tooltip title="Find Next Block"><Button icon={<RightOutlined />} onClick={onNextBlock} disabled={!worldLoaded} /></Tooltip>
            <Tooltip title="Highlight All Matching Blocks"><Button icon={<HighlightOutlined />} onClick={onHighlightAll} disabled={!worldLoaded} /></Tooltip>
            <Tooltip title="Clear Highlighted Blocks"><Button icon={<CloseOutlined />} onClick={onClearHighlight} disabled={!worldLoaded} /></Tooltip>
          </Space.Compact>

          <Space.Compact>
            <Tooltip title="Reset Zoom"><Button icon={<ExpandOutlined />} onClick={onResetZoom} disabled={!worldLoaded} /></Tooltip>
            <Tooltip title="Save Image"><Button icon={<CameraOutlined />} onClick={onSaveImage} disabled={!worldLoaded} /></Tooltip>
            <Tooltip title="Reload World"><Button icon={<ReloadOutlined />} onClick={onReload} disabled={!worldLoaded} /></Tooltip>
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

      <Tooltip title="About">
        <Button
          type="link"
          icon={<QuestionCircleOutlined />}
          href="about.html"
          target="_blank"
          style={{ color: '#fff', marginLeft: 'auto' }}
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
