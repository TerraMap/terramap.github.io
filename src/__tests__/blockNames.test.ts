import { describe, expect, it } from 'vitest';
import es from '../i18n/blockNames/es.json';
import ptBR from '../i18n/blockNames/pt-BR.json';
import ru from '../i18n/blockNames/ru.json';
import zhCN from '../i18n/blockNames/zh-CN.json';
import en from '../i18n/en.json';
import { createBlockNames, englishBlockNames, type BlockNameTable } from '../lib/blockNames';
import { getTileDisplayFields } from '../lib/tileDisplayFields';
import { getItemText } from '../lib/tileInfo';

const t = ((key: string) => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], en) as string) as unknown as Parameters<typeof getTileDisplayFields>[1];

const table: BlockNameTable = {
  tiles: { 'Lead Ore': '铅矿' },
  walls: { 2: '土墙（天然）' },
  items: { 227: '恢复药水' },
  prefixes: { 81: '传奇' },
  npcs: { 17: '商人' },
};

describe('createBlockNames', () => {
  const names = createBlockNames(table);

  it('looks up tiles by English name and everything else by ID', () => {
    expect(names.tile('Lead Ore')).toBe('铅矿');
    expect(names.wall(2, 'Dirt Wall (natural)')).toBe('土墙（天然）');
    expect(names.item(227, 'Restoration Potion')).toBe('恢复药水');
    expect(names.prefix(81, 'Legendary')).toBe('传奇');
    expect(names.npc(17, 'Merchant')).toBe('商人');
  });

  it('falls back to the English name', () => {
    expect(names.tile('Forest Short Plants')).toBe('Forest Short Plants');
    expect(names.item(226, 'Restoration Potion')).toBe('Restoration Potion');
  });
});

describe('display helpers', () => {
  const names = createBlockNames(table);

  it('getItemText translates the prefix and item', () => {
    const item = { id: 227, prefixId: 81, count: 2 };
    expect(getItemText(item, names)).toBe('传奇 恢复药水 (2)');
    expect(getItemText(item)).toBe('Legendary Restoration Potion (2)');
  });

  it('getTileDisplayFields translates the tile and wall', () => {
    const tile = { x: 0, y: 0, Type: 167, WallType: 2, info: { id: 167, name: 'Lead Ore' } };
    const value = (id: string) => getTileDisplayFields(tile, t, undefined, names).find(f => f.id === id)?.value;
    expect(value('tile')).toBe('铅矿');
    expect(value('wall')).toBe('土墙（天然） (2)');
    expect(getTileDisplayFields(tile, t, undefined, englishBlockNames).find(f => f.id === 'tile')?.value).toBe('Lead Ore');
  });
});

describe('generated tables', () => {
  const tables: Record<string, BlockNameTable> = { es, 'pt-BR': ptBR, ru, 'zh-CN': zhCN };

  it.each(Object.entries(tables))('%s translates names from each source', (_language, generated) => {
    const names = createBlockNames(generated);
    expect(names.tile('Lead Ore')).not.toBe('Lead Ore');
    expect(names.tile('Gold Chest')).not.toBe('Gold Chest');
    expect(names.wall(1, 'Stone Wall')).not.toBe('Stone Wall');
    expect(names.wall(2, 'Dirt Wall (natural)')).not.toBe('Dirt Wall (natural)');
    expect(names.item(12, 'Copper Ore')).not.toBe('Copper Ore');
    expect(names.prefix(81, 'Legendary')).not.toBe('Legendary');
    expect(names.npc(22, 'Guide')).not.toBe('Guide');
  });

  it('keys items by ID, so items sharing an English name get their own translation', () => {
    // TEdit names both 226 and 227 "Restoration Potion"; the game calls 226 "Lesser Restoration Potion".
    const names = createBlockNames(zhCN);
    expect(names.item(226, 'Restoration Potion')).toBe('弱效恢复药水');
    expect(names.item(227, 'Restoration Potion')).toBe('恢复药水');
  });
});
