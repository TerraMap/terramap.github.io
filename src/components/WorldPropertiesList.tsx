import { Input } from 'antd';
import { useState } from 'react';

export function WorldPropertiesList({ worldProperties, maxHeight }: { worldProperties: Record<string, unknown>; maxHeight?: string }) {
  const [filter, setFilter] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight }}>
      <Input
        placeholder="Filter world properties..."
        allowClear
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 12, flexShrink: 0 }}
      />
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'auto', flex: 1 }}>
        {Object.keys(worldProperties).filter(k => !k.startsWith('_')).sort()
          .filter((key) => {
            if (!filter) return true;
            const q = filter.toLowerCase();
            return key.toLowerCase().includes(q) || String(worldProperties[key]).toLowerCase().includes(q);
          })
          .map((key) => (
            <li key={key} style={{ padding: '4px 0' }}>
              <strong>{key}:</strong> {String(worldProperties[key])}
            </li>
          ))}
      </ul>
    </div>
  );
}
