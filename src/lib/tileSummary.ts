import type { BlockNames } from './blockNames';
import type { TileDisplayField } from './tileDisplayFields';
import { getItemText } from './tileInfo';
import type { WorldItem } from '../types/settings';

/** Display names of the non-empty items, e.g. "Band of Regeneration", "Torch (20)". */
export function itemLabels(items: WorldItem[], names?: BlockNames): string[] {
  return items.filter(item => item.id > 0).map(item => getItemText(item, names));
}

/** Plain-text description of a tile (one field per line, then its items) for copying. */
export function buildTileSummary(fields: TileDisplayField[], items: string[], itemsLabel: string): string {
  const lines = fields.map(({ label, value }) => (label ? `${label}: ${value}` : value));
  if (items.length) {
    lines.push(`${itemsLabel}:`);
    lines.push(...items.map(item => `- ${item}`));
  }
  return lines.join('\n');
}
