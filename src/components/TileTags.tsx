import { CompassOutlined } from '@ant-design/icons';
import { Space, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { getTileDisplayFields, type WorldPosition } from "../lib/tileDisplayFields";
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
  const fields = getTileDisplayFields(selectedTile, t, world);

  return (
    <Space>
      {fields.map(({ id, label, value }, i) => (
        <Tag icon={id === 'location' ? <CompassOutlined /> : undefined} key={i}>{label ? `${label}: ${value}` : value}</Tag>
      ))}
    </Space >
  );
}
