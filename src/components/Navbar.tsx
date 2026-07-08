import {
  CameraOutlined,
  GlobalOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  SunOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space, Spin, Switch, Tag, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import firstBy from 'thenby';
import useThemeMenuItems from '../hooks/useThemeMenuItems';
import { useThemeName } from '../hooks/useThemeName';
import { getShortcutByHandler } from '../lib/keyboardShortcuts';
import { truncateString } from '../lib/string';
import type { BlockSet, WorldNpc } from '../types/settings';
import LanguageDropdown from './LanguageDropdown';
import ToolbarButton, { ShortcutLabel } from './ToolbarButton';

export interface DirectoryFiles { worldFiles: File[], mapFiles: File[] };

interface NavbarProps {
  directoryInputRef: React.RefObject<HTMLInputElement | null>;
  infoPaneOpen: boolean;
  isHighlighting: boolean;
  isWorldLoading: boolean;
  checkingNative: boolean;
  nativeAvailable?: boolean;
  npcs: WorldNpc[];
  isTileExplored: (x: number, y: number) => boolean;
  onChooseWorld: () => void;
  onClearHighlight: () => void;
  onGoToTile: (point?: { x: number, y: number }) => void;
  onHideTargetIndicator: () => void;
  onHighlightAll: () => void;
  onNextBlock: () => void;
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
  isWorldLoading,
  checkingNative,
  nativeAvailable,
  npcs,
  isTileExplored,
  onChooseWorld,
  onClearHighlight,
  onGoToTile,
  onHideTargetIndicator,
  onHighlightAll,
  onNextBlock,
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
  worldProperties
}: NavbarProps) {
  const { isDarkMode, themeName } = useThemeName();
  const themeMenuItems = useThemeMenuItems();
  const { t } = useTranslation();

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
    disabled: !isTileExplored(npc.x, npc.y),
    onClick: () => onGoToTile({ x: npc.x, y: npc.y }),
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
          {checkingNative ? <Spin /> : nativeAvailable ?
            <Button icon={<GlobalOutlined />} onClick={onChooseWorld}>{t('choose_world')}</Button>
            :
            <ToolbarButton
              loading={isWorldLoading}
              shortcutHandler="onOpenFolder"
              onClick={() => directoryInputRef.current?.click()}>
              {!worldLoaded ? t('folder') : undefined}
            </ToolbarButton>
          }
          <ToolbarButton
            loading={isWorldLoading}
            shortcutHandler="onOpenWorld"
            onClick={() => worldFileInputRef.current?.click()}>
            {typeof worldProperties.name === 'string'
              ? <span title={worldProperties.name}>
                {truncateString(worldProperties.name)}
              </span>
              : t('open_world_file')}
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
                <Button>{t('sets')}</Button>
              </Dropdown>

              <ToolbarButton
                shortcutHandler="onOpenBlocks"
                onClick={onOpenBlocks}>
                {t('blocks')}
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
                tooltip={t('save_image')}
              />
            </Space.Compact>

            <Space.Compact>
              <Dropdown menu={{
                items: [
                  {
                    key: "onGoToDungeon",
                    label: <ShortcutLabel handler="onGoToDungeon" />,
                    disabled: typeof worldProperties.dungeonX === 'number' && typeof worldProperties.dungeonY === 'number'
                      && !isTileExplored(worldProperties.dungeonX, worldProperties.dungeonY),
                    onClick: () => {
                      const x = worldProperties.dungeonX;
                      const y = worldProperties.dungeonY;
                      if (typeof x === 'number' && typeof y === 'number') onGoToTile({ x, y });
                    }
                  },
                  {
                    key: "onGoToTile",
                    label: <ShortcutLabel handler="onGoToTile" />,
                    onClick: () => onGoToTile()
                  },
                  {
                    key: "onGoToSpawn",
                    label: <ShortcutLabel handler="onGoToSpawn" />,
                    disabled: typeof worldProperties.spawnX === 'number' && typeof worldProperties.spawnY === 'number'
                      && !isTileExplored(worldProperties.spawnX, worldProperties.spawnY),
                    onClick: () => {
                      const x = worldProperties.spawnX;
                      const y = worldProperties.spawnY;
                      if (typeof x === 'number' && typeof y === 'number') onGoToTile({ x, y });
                    }
                  },
                  {
                    key: "onHideTileIndicator",
                    label: <ShortcutLabel handler="onHideTileIndicator" />,
                    onClick: () => onHideTargetIndicator()
                  },
                  {
                    key: "onToggleInfoPane",
                    label: <Space size="small">
                      <ShortcutLabel handler="onToggleInfoPane" />
                      <Switch checked={infoPaneOpen} size="small" />
                    </Space>,
                    onClick: () => setInfoPaneOpen(!infoPaneOpen)
                  },
                  {
                    key: "NPCs",
                    label: t('npcs'),
                    children: npcMenuItems
                  },
                  {
                    key: "Theme",
                    label: t('theme'),
                    children: themeMenuItems
                  },
                  {
                    key: 'onToggleWires',
                    label:
                      <Space size="small">
                        <ShortcutLabel handler="onToggleWires" />
                        <Switch checked={showWires} size="small" />
                      </Space>,
                    onClick: () => setShowWires(!showWires)
                  }
                ]
              }}>
                <Button>{t('view')}</Button>
              </Dropdown>
              <Dropdown menu={{ items: themeMenuItems, selectedKeys: [themeName] }}>
                <Button icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />} />
              </Dropdown>
              <LanguageDropdown />
            </Space.Compact>

            <Tooltip title={<Space>
              {infoPaneOpen ? t('hide_info_pane') : t('show_info_pane')}
              {
                <Tag>
                  <kbd>{getShortcutByHandler('onToggleInfoPane')?.key}</kbd>
                </Tag>
              }
            </Space>}>
              <Switch
                checkedChildren={t('info')}
                unCheckedChildren={t('info')}
                checked={infoPaneOpen}
                onChange={(checked) => setInfoPaneOpen(checked)}
              />
            </Tooltip>
          </>
        )
        }

        {
          !worldLoaded && (
            <Dropdown menu={{ items: themeMenuItems, selectedKeys: [themeName] }}>
              <Button icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />} />
            </Dropdown>
          )
        }


        <Tooltip title={t('about')}>
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
