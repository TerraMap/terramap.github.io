import { Input, Table, type TableColumnsType } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayerMap } from '../lib/readPlayerMap';
import { capitalizeFirstLetter } from '../lib/string';
import { tiles } from '../tiles';

// Matches antd's own row-height formula for size="small" (see antd's
// InternalTable listItemHeight calc) — the header row uses the same height,
// and virtual mode needs a concrete pixel body height (scroll.y) to compute
// how many rows to render.
const TABLE_HEADER_HEIGHT = 39;

interface TileCountRow {
  id: number;
  name: string;
  count: number;
}

export function WorldSpread({ worldProperties, playerMap, tileCounts, solidBlockCount, maxHeight }: {
  worldProperties: Record<string, unknown>;
  playerMap: PlayerMap | null;
  tileCounts?: Record<number, number>;
  solidBlockCount?: number;
  maxHeight?: string;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(0);

  useEffect(() => {
    const el = tableWrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height) setTableHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const properties: Record<string, unknown> = { ...worldProperties };

  if (playerMap?.percent) {
    const pct = playerMap.percent.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 });
    properties.explored = `${playerMap.count.toLocaleString()} (${pct})`;
  }

  const filteredKeys = Object.keys(properties).filter(
    k => [
      'explored',
      'solidBlocks',
      'corruptBlocks',
      'crimsonBlocks',
      'hallowBlocks'].includes(k)
  ).sort();

  const tileRows = useMemo<TileCountRow[]>(() => {
    if (!tileCounts) return [];
    return Object.entries(tileCounts).map(([id, count]) => {
      const tileId = Number(id);
      return { id: tileId, name: tiles[tileId]?.name ?? `Tile ${tileId}`, count };
    });
  }, [tileCounts]);

  const filteredTileRows = useMemo(() => {
    if (!filter) return tileRows;
    const q = filter.toLowerCase();
    return tileRows.filter(row => row.name.toLowerCase().includes(q));
  }, [tileRows, filter]);

  const columns: TableColumnsType<TileCountRow> = useMemo(() => [
    {
      title: t('tab_tile'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('count'),
      dataIndex: 'count',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.count - b.count,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: t('percent'),
      key: 'percent',
      sorter: (a, b) => a.count - b.count,
      render: (_, row) => solidBlockCount
        ? (row.count / solidBlockCount).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 })
        : '',
    },
  ], [t, solidBlockCount]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexShrink: 0 }}>
        {filteredKeys
          .map((key) => (
            <li key={key} style={{ padding: '4px 0' }}>
              <strong>{capitalizeFirstLetter(key.replace('Blocks', ''))}:</strong> {String(properties[key])}
            </li>
          ))}
      </ul>

      {tileRows.length > 0 && (
        <>
          <Input
            placeholder={t('filter_tile_composition')}
            allowClear
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ margin: '12px 0', flexShrink: 0 }}
          />
          <div ref={tableWrapperRef} style={{ flex: 1, minHeight: 0 }}>
            <Table<TileCountRow>
              virtual
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={filteredTileRows}
              scroll={{ y: Math.max(0, tableHeight - TABLE_HEADER_HEIGHT) }}
              columns={columns}
            />
          </div>
        </>
      )}
    </div>
  );
}
