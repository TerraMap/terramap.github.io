import { Space, Spin, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Status } from '../lib/status';
import type { WorldPosition } from '../lib/tileDisplayFields';
import type { WorldTile } from '../types/settings';
import { FooterAd } from './FooterAd';
import TileTags from './TileTags';

interface StatusBarProps {
  isLoading: boolean;
  selectedTile: WorldTile | null;
  status?: Status;
  world?: WorldPosition;
  /** Changes whenever a world finishes loading (see FooterAd). */
  worldLoadCount: number;
}

export function StatusBar({ isLoading, selectedTile, status, world, worldLoadCount }: StatusBarProps) {
  const { t } = useTranslation();

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  return (
    <Space
      size="small"
      orientation="vertical"
      style={{
        width: '100%',
        padding: '4px 16px',
        background: colorBgLayout,
      }}
    >
      <span style={{ flexShrink: 0 }}>
        <Space>
          {isLoading && <Spin />}
          {status && t(`status.${status.key}`, { value: status.value })}
          {selectedTile && (
            <TileTags selectedTile={selectedTile} world={world} />
          )}
        </Space>
      </span>
      <FooterAd contentKey={worldLoadCount} />
    </Space>
  );
}
