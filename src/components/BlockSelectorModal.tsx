import { Button, Col, Modal, Row, Segmented, Select, Space, Tag, theme } from 'antd';
import type { RefSelectProps } from 'antd/es/select';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BlockOption, BlockType } from '../hooks/useBlockOptions';

const typeColors: Record<BlockType, string> = {
  Tile: 'processing',
  Item: 'success',
  Wall: 'warning',
};

type FilterType = 'All' | BlockType;

interface SearchOption {
  value: string;
  label: string;
  englishLabel: string;
  type: BlockType;
  id: string;
  /** Lowercased localized and English names, for searching. */
  names: string[];
  /** Lowercased type tags as shown ("方块 4") and in English ("tile 4"), for searching. */
  tags: string[];
}

function matchesSearch(input: string, option?: SearchOption): boolean {
  const query = input.toLowerCase();
  return !!option && (option.names.some(name => name.includes(query)) || option.tags.some(tag => tag.includes(query)));
}

// Exact name or id matches first, then names that start with the search text.
function searchRank(option: SearchOption, query: string): number {
  if (option.id === query || option.names.includes(query)) return 0;
  return option.names.some(name => name.startsWith(query)) ? 1 : 2;
}

// Best match first, then shorter names. With no search text this keeps the
// alphabetical order from useBlockOptions, since rc-select sorts then too.
function sortBySearch(a: SearchOption, b: SearchOption, { searchValue }: { searchValue: string }): number {
  const query = searchValue.toLowerCase();
  if (!query) return 0;
  return searchRank(a, query) - searchRank(b, query) || a.label.length - b.label.length;
}

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
  const { t } = useTranslation();

  const { token: { colorWarning, colorPrimary, colorSuccess } } = theme.useToken();

  const filteredOptions = useMemo(() => {
    const filtered = filter === 'All' ? options : options.filter(o => o.type === filter);
    return filtered.filter(o => o.englishLabel !== '[empty]').map((o): SearchOption => ({
      value: `${o.value}|${o.dataU ?? ''}|${o.dataV ?? ''}|${o.frameIndex ?? ''}`,
      label: o.label,
      englishLabel: o.englishLabel,
      type: o.type,
      id: o.id,
      names: [o.label.toLowerCase(), o.englishLabel.toLowerCase()],
      tags: [`${t(`block_type.${o.type}`)} ${o.id}`.toLowerCase(), `${o.type} ${o.id}`.toLowerCase()],
    }));
  }, [options, filter, t]);

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
      title={t('choose_blocks')}
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
                { value: 'All', label: <span>{t('all')}</span> },
                { value: 'Tile', label: <span style={{ color: colorPrimary }}>{t('tiles')}</span> },
                { value: 'Item', label: <span style={{ color: colorSuccess }}>{t('items')}</span> },
                { value: 'Wall', label: <span style={{ color: colorWarning }}>{t('walls')}</span> },
              ]}
            />
          </Col>
          <Col flex="none">
            <Button onClick={() => onClose(false)}>{t('cancel')}</Button>
          </Col>
          <Col flex="none">
            <Button type="primary" onClick={() => onClose(true)}>{t('ok')}</Button>
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
          placeholder={filter === 'All' ? t('search_all_blocks') : filter === 'Item' ? t('search_items') : filter === 'Tile' ? t('search_tiles') : t('search_walls')}
          showSearch={{
            autoClearSearchValue: false,
            searchValue,
            onSearch: setSearchValue,
            filterSort: sortBySearch,
            filterOption: matchesSearch,
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
                {label} ({info ? t(`block_type.${info.type}`) : ''})
              </Tag>
            );
          }}
          optionRender={(option) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{option.data.label}</span>
              <Tag color={typeColors[option.data.type]} style={{ marginRight: 0 }}>
                {t(`block_type.${option.data.type}`)} {option.data.id}
              </Tag>
            </div>
          )}
        />

      </Space>
    </Modal>
  );
}
