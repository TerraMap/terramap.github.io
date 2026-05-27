import { CloseOutlined } from '@ant-design/icons';
import { Button, Drawer, Input, Space } from 'antd';
import { useState } from 'react';

interface WorldPropertiesDrawerProps {
  open: boolean;
  onClose: () => void;
  worldProperties: Record<string, unknown>;
}

export function WorldPropertiesDrawer({ open, onClose, worldProperties }: WorldPropertiesDrawerProps) {
  const [filter, setFilter] = useState('');

  return (
    <Drawer
      title={
        <Space>
          <Button size="small" type="text" icon={<CloseOutlined />} onClick={onClose} />
          World Properties
        </Space>}
      mask={false}
      open={open}
      closable={false}
      zIndex={1100}
    >
      <Input
        placeholder="Filter world properties..."
        allowClear
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
    </Drawer>
  );
}
