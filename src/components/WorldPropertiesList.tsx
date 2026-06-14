import { Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayerMap } from '../lib/readPlayerMap';

export function WorldPropertiesList({ worldProperties, playerMap, maxHeight }: { worldProperties: Record<string, unknown>; playerMap: PlayerMap | null; maxHeight?: string }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');

  const properties: Record<string, unknown> = { ...worldProperties };

  if (playerMap?.percent) {
    const pct = playerMap.percent.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 });
    properties.explored = `${playerMap.count.toLocaleString()} (${pct})`;
  }

  const filteredKeys = Object.keys(properties).filter(k => !k.startsWith('_')).sort()
    .filter((key) => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return key.toLowerCase().includes(q) || String(worldProperties[key]).toLowerCase().includes(q);
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight }}>
      <Input
        placeholder={t('filter_world_properties')}
        allowClear
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 12, flexShrink: 0 }}
      />
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'auto', flex: 1 }}>
        {filteredKeys
          .map((key) => (
            <li key={key} style={{ padding: '4px 0' }}>
              <strong>{key}:</strong> {String(properties[key])}
            </li>
          ))}
      </ul>
    </div>
  );
}
