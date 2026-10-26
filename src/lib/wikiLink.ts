// The Terraria wiki has editions in these languages; others use the English one.
const WIKI_BASES: Record<string, string> = {
  es: 'https://terraria.wiki.gg/es/wiki/',
  pt: 'https://terraria.wiki.gg/pt/wiki/',
  ru: 'https://terraria.wiki.gg/ru/wiki/',
  zh: 'https://terraria.wiki.gg/zh/wiki/',
};
const DEFAULT_WIKI_BASE = 'https://terraria.wiki.gg/wiki/';

/**
 * Link to an item's page on the Terraria wiki. It goes through the wiki's search with "go", which
 * opens the page whose title matches the name exactly and otherwise lists results, so names that
 * differ slightly from the wiki's page titles still lead somewhere useful.
 */
export function wikiUrl(name: string, language: string): string {
  const base = WIKI_BASES[language.split('-')[0]] ?? DEFAULT_WIKI_BASE;
  return `${base}Special:Search?search=${encodeURIComponent(name.trim())}&go=Go`;
}
