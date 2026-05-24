import { Modal, Segmented, Select } from 'antd';
import { useMemo, useState } from 'react';
import type { BlockOption, BlockType } from '../hooks/useBlockOptions';

type FilterType = 'all' | BlockType;

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
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredOptions = useMemo(() => {
    const filtered = filter === 'all' ? options : options.filter(o => o.type === filter);
    return filtered.filter(o => o.label !== '[empty] (Item 0)').map(o => ({ value: `${o.value}|${o.dataU ?? ''}|${o.dataV ?? ''}`, label: o.label }));
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
          { value: 'all', label: 'All' },
          { value: 'tile', label: 'Tiles' },
          { value: 'item', label: 'Items' },
          { value: 'wall', label: 'Walls' },
        ]}
        style={{ marginBottom: 12 }}
      />
      <Select
        allowClear
        mode="multiple"
        showSearch
        virtual
        style={{ width: '100%' }}
        placeholder="Search blocks, items, walls..."
        value={selectedValues}
        onChange={onSelectionChange}
        options={filteredOptions}
        filterOption={(input, option) =>
          (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
        }
        maxTagCount={5}
        autoFocus
      />
    </Modal>
  );
}
