import { describe, expect, it } from 'vitest';
import { createBlockNames, englishBlockNames } from '../lib/blockNames';
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

  it('only uses an edition for the exact languages TerraMap has names in', () => {
    // Regional variants without their own names table get English names, so they need the English wiki.
    expect(wikiUrl('Starfury', 'zh-TW')).toBe('https://terraria.wiki.gg/wiki/Special:Search?search=Starfury&go=Go');
    expect(wikiUrl('Starfury', 'pt-PT')).toBe('https://terraria.wiki.gg/wiki/Special:Search?search=Starfury&go=Go');
  });

  it('matches the language of the names table, which is English until a localized one loads', () => {
    expect(wikiUrl('Starfury', englishBlockNames.language)).toBe('https://terraria.wiki.gg/wiki/Special:Search?search=Starfury&go=Go');
    expect(createBlockNames({ tiles: {}, walls: {}, items: {}, prefixes: {}, npcs: {}, prefixFormat: '{ItemName} {PrefixName}', prefixVariants: {}, itemGenders: {} }, 'es').language).toBe('es');
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
