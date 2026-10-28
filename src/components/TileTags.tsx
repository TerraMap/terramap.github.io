import { CompassOutlined } from '@ant-design/icons';
import { Space, Tag } from "antd";
import type { CSSProperties } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useBlockNames } from "../hooks/useBlockNames";
import { getTileDisplayFields, type WorldPosition } from "../lib/tileDisplayFields";
import { itemLabels } from "../lib/tileSummary";
import type { WorldTile } from "../types/settings";

const chestItemsStyle: CSSProperties = {
  display: 'inline-block',
  maxWidth: 280,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'top',
};

export default function TileTags(
  {
    selectedTile,
    world,
  }: {
    selectedTile: WorldTile;
    world?: WorldPosition;
  }) {
  const { t } = useTranslation();
  const names = useBlockNames();
  const fields = getTileDisplayFields(selectedTile, t, world, names);
  const chestItems = selectedTile.chest ? itemLabels(selectedTile.chest.items, names) : [];

  return (
    <Space>
      {fields.map(({ id, label, value }, i) => (
        <Tag icon={id === 'location' ? <CompassOutlined /> : undefined} key={i}>{label ? `${label}: ${value}` : value}</Tag>
      ))}
      {chestItems.length > 0 && (
        <Tag color="gold" title={chestItems.join('\n')}>
          {/* Long item names are cut short, so the count stays visible. */}
          <Trans
            i18nKey="chest_preview"
            count={chestItems.length}
            values={{ items: chestItems.slice(0, 3).join(t('list_separator')) + (chestItems.length > 3 ? '…' : '') }}
            components={{ items: <span style={chestItemsStyle} /> }}
          />
        </Tag>
      )}
    </Space >
  );
}
