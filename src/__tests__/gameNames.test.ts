import { describe, expect, it } from 'vitest';
import { localizeGameName } from '../lib/gameNames';

describe('localizeGameName', () => {
  it('translates tile, item and wall names to Chinese', () => {
    expect(localizeGameName('Lead Ore', 'zh-CN')).toBe('铅矿');
    expect(localizeGameName('Lead Bar', 'zh-CN')).toBe('铅锭');
    expect(localizeGameName('Dirt Wall (natural)', 'zh-CN')).toBe('土墙（天然）');
  });

  it('translates composite labels part by part', () => {
    expect(localizeGameName('Chests - Gold Chest', 'zh-CN')).toBe('箱子 - 金箱');
  });

  it('leaves names unchanged for languages without a table', () => {
    expect(localizeGameName('Lead Ore', 'en')).toBe('Lead Ore');
    expect(localizeGameName('Lead Ore', undefined)).toBe('Lead Ore');
  });

  it('falls back to English for unknown names', () => {
    expect(localizeGameName('Not A Real Block', 'zh-CN')).toBe('Not A Real Block');
  });
});
