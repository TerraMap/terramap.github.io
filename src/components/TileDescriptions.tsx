import { Descriptions } from "antd";
import { getTileDisplayFields } from "../lib/tileDisplayFields";
import { getItemText } from "../lib/tileInfo";
import type { WorldItem, WorldTile } from "../types/settings";

const entityTypeNames: Record<number, string> = {
  0: 'Target Dummy',
  1: 'Item Frame',
  2: 'Logic Sensor',
  3: 'Mannequin',
  4: 'Weapon Rack',
  5: 'Hat Rack',
  6: 'Food Plate',
  7: 'Pylon',
  8: 'Display Jar',
  9: 'Kite Anchor',
  10: 'Critter Anchor',
};

function ItemList({ label, items }: { label?: string; items: WorldItem[] }) {
  const nonEmpty = items.filter(i => i.id > 0);
  if (!nonEmpty.length) return null;
  return (
    <div style={{ marginTop: 8 }}>
      {label && (<strong>{label}</strong>)}
      <ul style={{ padding: 0, margin: 0, marginLeft: 16 }}>
        {nonEmpty.map((item, i) => (
          <li key={i} style={{ padding: '4px 0' }}>{getItemText(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function PairedItemList({ label, items, dyes }: { label?: string; items: WorldItem[]; dyes: WorldItem[] }) {
  const pairs: { item: WorldItem; dye: WorldItem | undefined }[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id > 0) {
      pairs.push({ item: items[i], dye: dyes[i]?.id > 0 ? dyes[i] : undefined });
    }
  }
  if (!pairs.length) return null;
  return (
    <div style={{ marginTop: 8 }}>
      {label && (<strong>{label}</strong>)}
      <ul style={{ padding: 0, margin: 0, marginLeft: 16 }}>
        {pairs.map(({ item, dye }, i) => (
          <li key={i} style={{ padding: '4px 0' }}>
            {getItemText(item)}
            {dye && <span style={{ opacity: 0.7 }}> — {getItemText(dye)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TileDescriptions({ selectedTile }: { selectedTile: WorldTile }) {
  const fields = getTileDisplayFields(selectedTile);
  const { chest, tileEntity } = selectedTile;

  return (
    <>
      <Descriptions column={1} colon={false}>
        {fields.map(({ label, value }, i) => (
          <Descriptions.Item key={i} label={label || undefined}>{value}</Descriptions.Item>
        ))}
      </Descriptions>

      {chest && chest.items.length > 0 && (
        <ItemList items={chest.items} />
      )}

      {tileEntity && (
        <>
          {entityTypeNames[tileEntity.type] && (
            <div style={{ marginTop: 8 }}>
              <strong>{entityTypeNames[tileEntity.type]}</strong>
            </div>
          )}
          {tileEntity.item && tileEntity.item.id > 0 && (
            <ItemList items={[tileEntity.item]} />
          )}
          {tileEntity.items && tileEntity.dyes ? (
            <PairedItemList items={tileEntity.items} dyes={tileEntity.dyes} />
          ) : tileEntity.items ? (
            <ItemList items={tileEntity.items} />
          ) : null}
        </>
      )}
    </>
  );
}
