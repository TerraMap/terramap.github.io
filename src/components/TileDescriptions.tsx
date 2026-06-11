import { Descriptions } from "antd";
import { useTranslation } from "react-i18next";
import { getTileDisplayFields } from "../lib/tileDisplayFields";
import { getItemText } from "../lib/tileInfo";
import type { WorldItem, WorldTile } from "../types/settings";

const entityTypeKeys: Record<number, string> = {
  0: 'entity_types.target_dummy',
  1: 'entity_types.item_frame',
  2: 'entity_types.logic_sensor',
  3: 'entity_types.mannequin',
  4: 'entity_types.weapon_rack',
  5: 'entity_types.hat_rack',
  6: 'entity_types.food_plate',
  7: 'entity_types.pylon',
  8: 'entity_types.display_jar',
  9: 'entity_types.kite_anchor',
  10: 'entity_types.critter_anchor',
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
  const { t } = useTranslation();
  const fields = getTileDisplayFields(selectedTile, t);
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
          {entityTypeKeys[tileEntity.type] && (
            <div style={{ marginTop: 8 }}>
              <strong>{t(entityTypeKeys[tileEntity.type])}</strong>
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
