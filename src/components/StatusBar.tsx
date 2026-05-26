import { Space, Spin, theme } from 'antd';
import { useEffect, useRef } from 'react';
import type { WorldTile } from '../types/settings';
import TileTags from './TileTags';

interface StatusBarProps {
  isLoading: boolean;
  selectedTile: WorldTile | null;
  status?: string;
}

export function StatusBar({ isLoading, selectedTile, status }: StatusBarProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adPushed = useRef(false);

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  useEffect(() => {
    if (adRef.current && !adPushed.current) {
      adPushed.current = true;
      try {
        ((window as unknown as Record<string, unknown[]>).adsbygoogle = (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
      } catch {
        // ad blocker or script not loaded
      }
    }
  }, []);

  return (
    <Space
      size="small"
      orientation="vertical"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '4px 16px',
        marginRight: 48,
        background: colorBgLayout,
        zIndex: 1000,
      }}
    >
      <span style={{ flexShrink: 0 }}>
        <Space>
          {isLoading && <Spin />}
          {status}
          {selectedTile && (
            <TileTags selectedTile={selectedTile} />
          )}
        </Space>
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: 728, height: 90, border: '1px solid black' }}
        data-ad-client="ca-pub-4263195580051724"
        data-ad-slot="9553900295"
      />
    </Space>
  );
}
