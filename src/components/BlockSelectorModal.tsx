import { Button, Col, Modal, Row, Segmented, Select, Space, Tag, theme } from 'antd';
import type { RefSelectProps } from 'antd/es/select';
import { useMemo, useRef, useState } from 'react';
import type { BlockOption, BlockType } from '../hooks/useBlockOptions';

const typeColors: Record<BlockType, string> = {
  Tile: 'processing',
  Item: 'success',
  Wall: 'warning',
};

type FilterType = 'All' | BlockType;

interface BlockSelectorModalProps {
  open: boolean;
  onClose: (ok: boolean) => void;
  options: BlockOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

export function BlockSelectorModal({
  open,
  onClose,
  options,
  selectedValues,
  onSelectionChange,
}: BlockSelectorModalProps) {
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchValue, setSearchValue] = useState('');
  const selectRef = useRef<RefSelectProps>(null);

  const { token: { colorWarning, colorPrimary, colorSuccess } } = theme.useToken();

  const filteredOptions = useMemo(() => {
    const filtered = filter === 'All' ? options : options.filter(o => o.type === filter);
    return filtered.filter(o => o.label !== '[empty]').map(o => ({
      value: `${o.value}|${o.dataU ?? ''}|${o.dataV ?? ''}|${o.frameIndex ?? ''}`,
      label: o.label,
      type: o.type,
      id: o.id,
    }));
  }, [options, filter]);

  const selectedOptionsByValue = useMemo(() => {
    const map = new Map<string, { type: BlockType; id: string }>();
    for (const o of options) {
      const key = `${o.value}|${o.dataU ?? ''}|${o.dataV ?? ''}|${o.frameIndex ?? ''}`;
      map.set(key, { type: o.type, id: o.id });
    }
    return map;
  }, [options]);

  return (
    <Modal
      title="Choose Blocks"
      footer={false}
      open={open}
      onCancel={() => onClose(false)}
      onOk={() => onClose(true)}
      width={600}
      destroyOnHidden={false}
      afterOpenChange={(open) => { if (open) selectRef.current?.focus(); }}
    >
      <Space orientation="vertical" style={{ width: '100%' }}>
        <Row wrap={false} gutter={8}>
          <Col flex="auto">
            <Segmented
              block
              value={filter}
              onChange={(v) => {
                setFilter(v as FilterType);
                selectRef.current?.focus();
              }}
              options={[
                { value: 'All', label: <span>All</span> },
                { value: 'Tile', label: <span style={{ color: colorPrimary }}>Tiles</span> },
                { value: 'Item', label: <span style={{ color: colorSuccess }}>Items</span> },
                { value: 'Wall', label: <span style={{ color: colorWarning }}>Walls</span> },
              ]}
            />
          </Col>
          <Col flex="none">
            <Button onClick={() => onClose(false)}>Cancel</Button>
          </Col>
          <Col flex="none">
            <Button type="primary" onClick={() => onClose(true)}>OK</Button>
          </Col>
        </Row>

        <Select
          ref={selectRef}
          allowClear
          autoFocus
          maxTagCount={5}
          mode="multiple"
          onChange={onSelectionChange}
          options={filteredOptions}
          style={{ width: '100%' }}
          value={selectedValues}
          virtual
          placeholder={filter === 'All' ? "Search tiles, items, and walls..." : filter === 'Item' ? 'Search items...' : filter === 'Tile' ? 'Search tiles...' : 'Search walls...'}
          showSearch={{
            autoClearSearchValue: false,
            searchValue,
            onSearch: setSearchValue,
            filterOption: (input, option) => {
              const inputLower = input.toLowerCase();
              if ((option?.label ?? '').toLowerCase().includes(inputLower)) return true;
              if (option?.id.toLowerCase().includes(inputLower)) return true;
              if (`${option?.type} ${option?.id}`.toLowerCase().includes(inputLower)) return true;
              return false;
            },
          }}
          tagRender={({ value, closable, onClose, label }) => {
            const info = selectedOptionsByValue.get(value as string);
            return (
              <Tag
                closable={closable}
                onClose={onClose}
                color={info ? typeColors[info.type] : undefined}
                style={{ marginInlineEnd: 4 }}
              >
                {label} ({info?.type})
              </Tag>
            );
          }}
          optionRender={(option) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{option.data.label}</span>
              <Tag color={typeColors[option.data.type]} style={{ marginRight: 0 }}>
                {option.data.type} {option.data.id}
              </Tag>
            </div>
          )}
        />

      </Space>
    </Modal>
  );
}
