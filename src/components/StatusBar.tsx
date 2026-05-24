import { Space, Spin } from 'antd';
import { useEffect, useRef } from 'react';

interface StatusBarProps {
  status: string;
  isLoading: boolean;
}

export function StatusBar({ status, isLoading }: StatusBarProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adPushed = useRef(false);

  useEffect(() => {
    if (adRef.current && !adPushed.current) {
      adPushed.current = true;
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        // ad blocker or script not loaded
      }
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '4px 16px',
        background: '#001529',
        color: '#fff',
        fontSize: 13,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <span style={{ flexShrink: 0 }}><Space>{isLoading && <Spin />}{status}</Space></span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: 728, height: 90 }}
        data-ad-client="ca-pub-4263195580051724"
        data-ad-slot="9553900295"
      />
    </div>
  );
}
