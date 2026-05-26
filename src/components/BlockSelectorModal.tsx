import { Button, Col, Modal, Row, Segmented, Select, Space, Tag } from 'antd';
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
  const selectRef = useRef<RefSelectProps>(null);

  const filteredOptions = useMemo(() => {
    const filtered = filter === 'All' ? options : options.filter(o => o.type === filter);
    return filtered.filter(o => o.label !== '[empty]').map(o => ({
      value: `${o.value}|${o.dataU ?? ''}|${o.dataV ?? ''}|${o.frameIndex ?? ''}`,
      label: o.label,
      type: o.type,
      id: o.id,
    }));
  }, [options, filter]);

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
              onChange={setFilter as (value: string | number) => void}
              options={[
                { value: 'All', label: 'All' },
                { value: 'Tile', label: 'Tiles' },
                { value: 'Item', label: 'Items' },
                { value: 'Wall', label: 'Walls' },
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
            filterOption: (input, option) => {
              const inputLower = input.toLowerCase();
              if ((option?.label as string ?? '').toLowerCase().includes(inputLower)) return true;
              if (option?.id.toLowerCase().includes(inputLower)) return true;
              if (`${option?.type} ${option?.id}`.toLowerCase().includes(inputLower)) return true;
              return false;
            },
          }}
          optionRender={(option) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{option.data.label}</span>
              <Tag color={typeColors[option.data.type as BlockType]} style={{ marginRight: 0 }}>
                {option.data.type} {option.data.id}
              </Tag>
            </div>
          )}
        />

      </Space>
    </Modal>
  );
}
