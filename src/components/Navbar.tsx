import { useRef } from 'react';
import { Button, Space, Dropdown, Flex } from 'antd';
import type { MenuProps } from 'antd';
import {
  UploadOutlined,
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
  HighlightOutlined,
  ClearOutlined,
  ExpandOutlined,
  CameraOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

interface NavbarProps {
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

  const propMenuItems: MenuProps['items'] = Object.keys(worldProperties)
    .sort()
    .map((key) => ({
      key,
      label: `${key}: ${worldProperties[key]}`,
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
      <span style={{ color: '#fff', fontWeight: 'bold', marginRight: 8 }}>TerraMap</span>

      <input
        ref={fileInputRef}
        type="file"
        accept=".wld"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
        Open
      </Button>

      <Space.Compact>
        <Button icon={<SearchOutlined />} onClick={onOpenBlocks} disabled={!worldLoaded}>
          Blocks
        </Button>
        <Button icon={<LeftOutlined />} onClick={onPrevBlock} disabled={!worldLoaded} />
        <Button icon={<RightOutlined />} onClick={onNextBlock} disabled={!worldLoaded} />
        <Button icon={<HighlightOutlined />} onClick={onHighlightAll} disabled={!worldLoaded} />
        <Button icon={<ClearOutlined />} onClick={onClearHighlight} disabled={!worldLoaded} />
      </Space.Compact>

      <Space.Compact>
        <Button icon={<ExpandOutlined />} onClick={onResetZoom} disabled={!worldLoaded} />
        <Button icon={<CameraOutlined />} onClick={onSaveImage} disabled={!worldLoaded} />
        <Button icon={<ReloadOutlined />} onClick={onReload} disabled={!worldLoaded} />
      </Space.Compact>

      {worldLoaded && (
        <>
          <Dropdown menu={{ items: setMenuItems }} trigger={['click']}>
            <Button>Sets</Button>
          </Dropdown>
          <Dropdown menu={{ items: npcMenuItems }} trigger={['click']}>
            <Button>NPCs</Button>
          </Dropdown>
          <Dropdown menu={{ items: propMenuItems }} trigger={['click']}>
            <Button>World Properties</Button>
          </Dropdown>
          {tileInfoItems.length > 0 && (
            <Dropdown menu={{ items: tileInfoMenuItems }} trigger={['click']}>
              <Button>Tile Info</Button>
            </Dropdown>
          )}
        </>
      )}

      <Button
        type="link"
        icon={<QuestionCircleOutlined />}
        href="about.html"
        target="_blank"
        style={{ color: '#fff', marginLeft: 'auto' }}
      />
    </Flex>
  );
}
