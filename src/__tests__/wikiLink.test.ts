import { describe, expect, it } from 'vitest';
import { englishBlockNames } from '../lib/blockNames';
import { getItemName } from '../lib/tileInfo';
import { wikiUrl } from '../lib/wikiLink';

describe('wikiUrl', () => {
  it('uses the wiki edition for the UI language', () => {
    expect(wikiUrl('星怒', 'zh-CN')).toBe('https://terraria.wiki.gg/zh/wiki/Special:Search?search=%E6%98%9F%E6%80%92&go=Go');
    expect(wikiUrl('Furia de estrellas', 'es')).toBe('https://terraria.wiki.gg/es/wiki/Special:Search?search=Furia%20de%20estrellas&go=Go');
    expect(wikiUrl('Tocha', 'pt-BR')).toBe('https://terraria.wiki.gg/pt/wiki/Special:Search?search=Tocha&go=Go');
  });

  it('falls back to the English wiki', () => {
    expect(wikiUrl('Hermes Boots', 'en')).toBe('https://terraria.wiki.gg/wiki/Special:Search?search=Hermes%20Boots&go=Go');
    expect(wikiUrl('Hermes Boots', 'de')).toBe('https://terraria.wiki.gg/wiki/Special:Search?search=Hermes%20Boots&go=Go');
  });

  it('escapes characters that would break the query', () => {
    expect(wikiUrl(" Tom's & Jerry ", 'en')).toBe("https://terraria.wiki.gg/wiki/Special:Search?search=Tom's%20%26%20Jerry&go=Go");
  });
});

describe('getItemName', () => {
  it('names items without prefix or count', () => {
    expect(getItemName(65)).toBe('Starfury');
    expect(getItemName(65, { ...englishBlockNames, item: () => '星怒' })).toBe('星怒');
  });

  it('returns undefined for unknown IDs', () => {
    expect(getItemName(-12345)).toBeUndefined();
  });
});
