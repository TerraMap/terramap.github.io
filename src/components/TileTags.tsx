import { Space, Tag } from "antd";
import { getTileDisplayFields } from "../lib/tileDisplayFields";
import type { WorldTile } from "../types/settings";

export default function TileTags(
  {
    selectedTile,
  }: {
    selectedTile: WorldTile;
  }) {
  const fields = getTileDisplayFields(selectedTile);

  return (
    <Space>
      {fields.map(({ label, value }, i) => (
        <Tag key={i}>{label ? `${label}: ${value}` : value}</Tag>
      ))}
    </Space>
  );
}
