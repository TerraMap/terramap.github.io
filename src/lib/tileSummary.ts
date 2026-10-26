import type { BlockNames } from './blockNames';
import { getItemText } from './tileInfo';
import type { WorldItem } from '../types/settings';

/** Display names of the non-empty items, e.g. "Band of Regeneration", "Torch (20)". */
export function itemLabels(items: WorldItem[], names?: BlockNames): string[] {
  return items.filter(item => item.id > 0).map(item => getItemText(item, names)
    .replace(/\s+/g, ' ')
    .trim()
    // Chinese prefixes attach directly to the item name (恶魔链锤, not 恶魔 链锤).
    .replace(/(?<=[一-鿿]) (?=[一-鿿])/gu, ''));
}
