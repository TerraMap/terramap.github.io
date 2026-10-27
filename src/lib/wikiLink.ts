// The Terraria wiki has editions in these of TerraMap's languages; the rest use the English one.
const WIKI_BASES: Record<string, string> = {
  es: 'https://terraria.wiki.gg/es/wiki/',
  'pt-BR': 'https://terraria.wiki.gg/pt/wiki/',
  ru: 'https://terraria.wiki.gg/ru/wiki/',
  'zh-CN': 'https://terraria.wiki.gg/zh/wiki/',
};
const DEFAULT_WIKI_BASE = 'https://terraria.wiki.gg/wiki/';

/**
 * Link to an item's page on the Terraria wiki. It goes through the wiki's search with "go", which
 * opens the page whose title matches the name exactly and otherwise lists results, so names that
 * differ slightly from the wiki's page titles still lead somewhere useful.
 *
 * `language` is the language the name is in (BlockNames.language), so the name is always searched
 * on the matching edition, even while a localized names table is still loading.
 */
export function wikiUrl(name: string, language: string): string {
  const base = WIKI_BASES[language] ?? DEFAULT_WIKI_BASE;
  return `${base}Special:Search?search=${encodeURIComponent(name.trim())}&go=Go`;
}
