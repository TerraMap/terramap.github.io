import { CompassOutlined } from '@ant-design/icons';
import { Space, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { useBlockNames } from "../hooks/useBlockNames";
import { getTileDisplayFields, type WorldPosition } from "../lib/tileDisplayFields";
import { itemLabels } from "../lib/tileSummary";
import type { WorldTile } from "../types/settings";

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
        <Tag color="gold">
          {t('chest_preview', { items: chestItems.slice(0, 3).join(t('list_separator')) + (chestItems.length > 3 ? '…' : ''), n: chestItems.length })}
        </Tag>
      )}
    </Space >
  );
}
