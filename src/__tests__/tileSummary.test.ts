import { describe, expect, it } from 'vitest';
import { englishBlockNames } from '../lib/blockNames';
import { itemLabels } from '../lib/tileSummary';

describe('itemLabels', () => {
  it('skips empty slots and tidies item text', () => {
    // Item 8 is Torch; prefix 0 means none.
    expect(itemLabels([{ id: 0, count: 0, prefixId: 0 }, { id: 8, count: 20, prefixId: 0 }])).toEqual(['Torch (20)']);
  });

  it('joins a Chinese prefix to the item name', () => {
    const zh = { ...englishBlockNames, prefix: () => '恶魔', item: () => '链锤' };
    expect(itemLabels([{ id: 162, count: 1, prefixId: 1 }], zh)).toEqual(['恶魔链锤']);
  });
});
