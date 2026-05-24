import { Modal, Segmented, Select, Tag } from 'antd';
import { useMemo, useState } from 'react';
import type { BlockOption, BlockType } from '../hooks/useBlockOptions';

const typeColors: Record<BlockType, string> = {
  Tile: 'processing',
  Item: 'success',
  Wall: 'warning',
};

type FilterType = 'All' | BlockType;

interface BlockSelectorModalProps {
  open: boolean;
  onClose: () => void;
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

  const filteredOptions = useMemo(() => {
    const filtered = filter === 'All' ? options : options.filter(o => o.type === filter);
    return filtered.filter(o => o.label !== '[empty]').map(o => ({
      value: `${o.value}|${o.dataU ?? ''}|${o.dataV ?? ''}`,
      label: o.label,
      type: o.type,
      id: o.id,
    }));
  }, [options, filter]);

  return (
    <Modal
      title="Choose Blocks"
      open={open}
      onCancel={onClose}
      onOk={onClose}
      width={600}
      destroyOnHidden={false}
    >
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
        style={{ marginBottom: 12 }}
      />
      <Select
        allowClear
        mode="multiple"
        virtual
        style={{ width: '100%' }}
        placeholder={filter === 'All' ? "Search tiles, items, and walls..." : filter === 'Item' ? 'Search items...' : filter === 'Tile' ? 'Search tiles...' : 'Search walls...'}
        value={selectedValues}
        onChange={onSelectionChange}
        options={filteredOptions}
        showSearch={{
          filterOption: (input, option) => {
            const inputLower = input.toLowerCase();
            if ((option?.label as string ?? '').toLowerCase().includes(inputLower)) return true;
            if (option?.id.toLowerCase().includes(inputLower)) return true;
            if (`${option?.type} ${option?.id}`.toLowerCase().includes(inputLower)) return true;
            return false;
          }
        }}
        optionRender={(option) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{option.data.label}</span>
            <Tag color={typeColors[option.data.type as BlockType]} style={{ marginRight: 0 }}>
              {option.data.type} {option.data.id}
            </Tag>
          </div>
        )}
        maxTagCount={5}
        autoFocus
      />
    </Modal>
  );
}
