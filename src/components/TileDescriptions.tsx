import { Descriptions, Space } from "antd";
import { paintColors } from "../lib/paintColors";
import { slopeLabels } from "../lib/slopeLabels";
import { getTileText } from "../lib/tileInfo";
import type { TileFrame, WorldTile } from "../types/settings";

export default function TileDescriptions(
  {
    selectedTile,
    tileInfoItems
  }: {
    selectedTile: WorldTile;
    tileInfoItems: string[];
  }) {
  const selectedTileParent = selectedTile?.info && 'parent' in selectedTile.info ? (selectedTile.info as TileFrame).parent : undefined;

  return (
    <>
      <Descriptions column={1} colon={false}>
        <Descriptions.Item>{getTileText(selectedTile)}</Descriptions.Item>
        {typeof selectedTile.info?.Variety === 'string' && (
          <Descriptions.Item label="Variety">{typeof selectedTile.info?.Variety === 'string' ? selectedTile.info.Variety : ''}</Descriptions.Item>
        )}
        {selectedTile.info?.Name && (
          <Descriptions.Item label="Name">{selectedTile.info?.Name}</Descriptions.Item>
        )}
        {selectedTileParent?.Size && (
          <Descriptions.Item label="Size">{selectedTileParent.Size ? selectedTileParent.Size?.replace(',', ' x ') : ''}</Descriptions.Item>
        )}
        {selectedTile.Type ? (
          <Descriptions.Item label="Type">{selectedTile.Type}</Descriptions.Item>
        ) : undefined}
        {selectedTile.WallType && (
          <Descriptions.Item label="Wall Type">{selectedTile.WallType}</Descriptions.Item>
        )}
        {((selectedTile.TextureU ?? 0) > 0 || (selectedTile.TextureV ?? 0) > 0) && (
          <Descriptions.Item label="UV">{selectedTile.TextureU}, {selectedTile.TextureV}</Descriptions.Item>
        )}
        {selectedTileParent && (
          <Descriptions.Item label="Parent">{selectedTileParent.Name}</Descriptions.Item>
        )}
        {selectedTile.slope && (
          <Descriptions.Item label="Slope">{slopeLabels[selectedTile.slope] ?? selectedTile.slope}</Descriptions.Item>
        )}
        {selectedTile.tileColor && (
          <Descriptions.Item label="Paint (Block)">{paintColors[selectedTile.tileColor] ?? selectedTile.tileColor}</Descriptions.Item>
        )}
        {selectedTile.WallColor && (
          <Descriptions.Item label="Paint (Wall)">{paintColors[selectedTile.WallColor] ?? selectedTile.WallColor}</Descriptions.Item>
        )}
        {selectedTile.echoBlock && (
          <Descriptions.Item label="Echo">Block</Descriptions.Item>
        )}
        {selectedTile.echoWall && (
          <Descriptions.Item label="Echo">Wall</Descriptions.Item>
        )}
        {selectedTile.illuminantBlock && (
          <Descriptions.Item label="Illuminant">Block</Descriptions.Item>
        )}
        {selectedTile.illuminantWall && (
          <Descriptions.Item label="Illuminant">Wall</Descriptions.Item>
        )}
        <Descriptions.Item label="Location">{selectedTile.x}, {selectedTile.y}</Descriptions.Item>
        <Descriptions.Item label="Wires">
          <Space>
            {selectedTile.IsRedWirePresent ? 'Red' : ''}
            {selectedTile.IsGreenWirePresent ? 'Green' : ''}
            {selectedTile.IsBlueWirePresent ? 'Blue' : ''}
            {!selectedTile.IsRedWirePresent && !selectedTile.IsGreenWirePresent && !selectedTile.IsBlueWirePresent ? 'None' : ''}
          </Space>
        </Descriptions.Item>
        {selectedTile.IsLiquidPresent && (
          <Descriptions.Item label="Liquid">
            <Space>
              {selectedTile.IsLiquidHoney ? 'Honey' :
                selectedTile.IsLiquidLava ? 'Lava' :
                  selectedTile.Shimmer ? 'Shimmer' :
                    'Water'}
              {selectedTile.LiquidAmount && `(${selectedTile.LiquidAmount})`}
            </Space>
          </Descriptions.Item>
        )}
        {(tileInfoItems?.length ?? 0) > 0 && (
          <Descriptions.Item label={selectedTile.chest ? `Chest: ${selectedTile.chest?.name}` : selectedTile.sign ? 'Sign' : ''} />
        )}
      </Descriptions>
      {(tileInfoItems?.length ?? 0) > 0 && (
        <ul style={{ padding: 0, margin: 0, marginTop: 8 }}>
          {tileInfoItems
            .map((item) => (
              <li key={item} style={{ padding: '4px 0' }}>
                {item}
              </li>
            ))}
        </ul>
      )}
    </>
  );
}