import { Modal, Select } from 'antd';
import type { BlockOption } from '../hooks/useBlockOptions';

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
  return (
    <Modal
      title="Choose Blocks"
      open={open}
      onCancel={onClose}
      onOk={onClose}
      width={600}
      destroyOnHidden={false}
    >
      <Select
        allowClear
        mode="multiple"
        showSearch
        virtual
        style={{ width: '100%' }}
        placeholder="Search blocks, items, walls..."
        value={selectedValues}
        onChange={onSelectionChange}
        options={options.map(o => ({ value: `${o.value}|${o.dataU ?? ''}|${o.dataV ?? ''}`, label: o.label }))}
        filterOption={(input, option) =>
          (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
        }
        maxTagCount={5}
        autoFocus
      />
    </Modal>
  );
}
