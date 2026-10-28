import { describe, expect, it } from 'vitest';
import zhCN from '../i18n/blockNames/zh-CN.json';
import { createBlockNames } from '../lib/blockNames';
import { buildTileSummary, itemLabels } from '../lib/tileSummary';

describe('itemLabels', () => {
  it('skips empty slots', () => {
    // Item 8 is Torch; prefix 0 means none.
    expect(itemLabels([{ id: 0, count: 0, prefixId: 0 }, { id: 8, count: 20, prefixId: 0 }])).toEqual(['Torch (20)']);
  });

  it('puts the prefix on the item name the way the game does', () => {
    // Legendary (81) Terra Blade (757).
    const item = { id: 757, count: 1, prefixId: 81 };
    expect(itemLabels([item])).toEqual(['Legendary Terra Blade']);
    expect(itemLabels([item], createBlockNames(zhCN, 'zh-CN'))).toEqual(['‹传奇›泰拉刃']);
  });
});

describe('buildTileSummary', () => {
  it('lists fields one per line, then the items', () => {
    const text = buildTileSummary(
      [{ id: 'location', label: 'Location', value: '116 East, 352 ft Underground' }, { id: 'tile', label: 'Tile', value: "Dead Man's Chest" }],
      ['Band of Regeneration', 'Torch (20)'],
      'Items',
    );
    expect(text).toBe("Location: 116 East, 352 ft Underground\nTile: Dead Man's Chest\nItems:\n- Band of Regeneration\n- Torch (20)");
  });

  it('omits the items section when there are none', () => {
    expect(buildTileSummary([{ label: '', value: 'Stone Block' }], [], 'Items')).toBe('Stone Block');
  });
});
