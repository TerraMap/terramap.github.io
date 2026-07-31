import { Space, Spin, theme } from 'antd';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { isNative } from '../lib/native';
import type { WorldTile } from '../types/settings';
import TileTags from './TileTags';

interface StatusBarProps {
  isLoading: boolean;
  selectedTile: WorldTile | null;
  status?: ReactNode;
}

const AD_CLIENT = 'ca-pub-4263195580051724';
const AD_SLOT = '9553900295';
const AD_SCRIPT_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/**
 * Standard fixed banner sizes, widest first.
 *
 * We request one of these explicitly instead of using a responsive unit
 * (`data-ad-format="horizontal"`). A responsive <ins> derives its own height
 * from the available width and writes it as an inline style after mount, which
 * beats anything React put in the style prop -- in a footer that spans the
 * window it happily picks a few hundred pixels and eats into the map. With
 * explicit width/height and no data-ad-format, AdSense serves the size we
 * asked for.
 */
const BANNER_SIZES = [
  { minWidth: 970, width: 970, height: 90 },
  { minWidth: 728, width: 728, height: 90 },
  { minWidth: 468, width: 468, height: 60 },
  { minWidth: 0, width: 320, height: 50 },
];

// Tallest banner above, reserved up front so the footer doesn't resize once the
// available width has been measured. Doubles as a hard cap on the container.
const MAX_AD_HEIGHT = 90;

/**
 * The ad is web-only -- the native (Tauri) build renders no <ins> and never
 * fetches the remote script, so the desktop app stays offline-capable and
 * doesn't ship ads it isn't allowed to serve. The script is injected here
 * rather than from index.html for the same reason: index.html is shared by
 * both builds.
 */
export function StatusBar({ isLoading, selectedTile, status }: StatusBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const adPushed = useRef(false);
  const [size, setSize] = useState<typeof BANNER_SIZES[number] | null>(null);

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  // Pick the banner from the width actually available, before requesting an ad
  // -- AdSense reads the <ins> element's rendered box at push time.
  useEffect(() => {
    if (isNative() || !containerRef.current) {
      return;
    }
    const available = containerRef.current.clientWidth;
    setSize(BANNER_SIZES.find((candidate) => available >= candidate.minWidth) ?? BANNER_SIZES[BANNER_SIZES.length - 1]);
  }, []);

  useEffect(() => {
    // The isNative() check is redundant with adRef being null natively, but
    // stated explicitly so the "no ads in the desktop app" guarantee doesn't
    // rest on how the JSX below happens to be structured.
    if (isNative() || !size || !adRef.current || adPushed.current) {
      return;
    }
    adPushed.current = true;

    if (!document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = AD_SCRIPT_SRC;
      document.head.appendChild(script);
    }

    try {
      // Queued on the global array; the script drains it whenever it loads, so
      // pushing before the script arrives is fine.
      ((window as unknown as Record<string, unknown[]>).adsbygoogle = (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
    } catch {
      // ad blocker, or the script was blocked -- nothing to do.
    }
  }, [size]);

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
          {status}
          {selectedTile && (
            <TileTags selectedTile={selectedTile} />
          )}
        </Space>
      </span>
      {!isNative() && (
        <div ref={containerRef} style={{ height: MAX_AD_HEIGHT, overflow: 'hidden' }}>
          {size && (
            <ins
              ref={adRef}
              className="adsbygoogle"
              // Explicit width/height and no data-ad-format: this is what makes
              // the unit fixed-size rather than responsive.
              style={{ display: 'inline-block', width: size.width, height: size.height }}
              data-ad-client={AD_CLIENT}
              data-ad-slot={AD_SLOT}
            />
          )}
        </div>
      )}
    </Space>
  );
}
