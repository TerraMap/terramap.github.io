import { Space, Tag } from "antd";
import { paintColors } from "../lib/paintColors";
import { slopeLabels } from "../lib/slopeLabels";
import type { TileFrame, WorldTile } from "../types/settings";

export default function TileTags(
  {
    selectedTile,
  }: {
    selectedTile: WorldTile;
  }) {
  const selectedTileParent = selectedTile?.info && 'parent' in selectedTile.info ? (selectedTile.info as TileFrame).parent : undefined;

  const isWirePresent = selectedTile.IsRedWirePresent || selectedTile.IsGreenWirePresent || selectedTile.IsBlueWirePresent;

  return (
    <Space>
      <Tag>Location: {selectedTile.x}, {selectedTile.y}</Tag>
      {selectedTile.info?.Name && (
        <Tag>Name: {selectedTile.info?.Name}</Tag>
      )}
      {typeof selectedTile.info?.Variety === 'string' && (
        <Tag>Variety: {typeof selectedTile.info?.Variety === 'string' ? selectedTile.info.Variety : ''}</Tag>
      )}
      {selectedTileParent?.Size && (
        <Tag>Size: {selectedTileParent.Size ? selectedTileParent.Size?.replace(',', ' x ') : ''}</Tag>
      )}
      {selectedTile.Type ? (
        <Tag>Type: {selectedTile.Type}</Tag>
      ) : undefined}
      {selectedTile.WallType && (
        <Tag>Wall Type: {selectedTile.WallType}</Tag>
      )}
      {((selectedTile.TextureU ?? 0) > 0 || (selectedTile.TextureV ?? 0) > 0) && (
        <Tag>UV: {selectedTile.TextureU}, {selectedTile.TextureV}</Tag>
      )}
      {selectedTileParent && (
        <Tag>Parent: {selectedTileParent.Name}</Tag>
      )}
      {isWirePresent && (
        <Tag>
          <Space>
            {selectedTile.IsRedWirePresent ? 'Red' : ''}
            {selectedTile.IsGreenWirePresent ? 'Green' : ''}
            {selectedTile.IsBlueWirePresent ? 'Blue' : ''}
          </Space>
        </Tag>

      )}
      {selectedTile.IsActuatorPresent && (
        <>
          <Tag>Actuator ({selectedTile.IsActive ? 'Active' : 'Inactive'})</Tag>
        </>
      )}
      {
        selectedTile.IsLiquidPresent && (
          <Space.Compact>
            <Tag>Liquid: {selectedTile.LiquidAmount && selectedTile.LiquidAmount}
              {selectedTile.IsLiquidHoney ? ' Honey' :
                selectedTile.IsLiquidLava ? ' Lava' :
                  selectedTile.Shimmer ? ' Shimmer' :
                    selectedTile.IsLiquidPresent ? ' Water' :
                      ' Unknown'}</Tag>
          </Space.Compact>

        )
      }
      {selectedTile.slope && (
        <Tag>Slope: {slopeLabels[selectedTile.slope] ?? selectedTile.slope}</Tag>
      )}
      {selectedTile.tileColor && (
        <Tag>Paint (Block): {paintColors[selectedTile.tileColor] ?? selectedTile.tileColor}</Tag>
      )}
      {selectedTile.WallColor && (
        <Tag>Paint (Wall): {paintColors[selectedTile.WallColor] ?? selectedTile.WallColor}</Tag>
      )}
      {selectedTile.echoBlock && <Tag>Echo Block</Tag>}
      {selectedTile.echoWall && <Tag>Echo Wall</Tag>}
      {selectedTile.illuminantBlock && <Tag>Illuminant Block</Tag>}
      {selectedTile.illuminantWall && <Tag>Illuminant Wall</Tag>}
    </Space >
  );
}