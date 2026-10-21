/// <reference types="vite/client" />
import { useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { createBlockNames, englishBlockNames, type BlockNames, type BlockNameTable } from '../lib/blockNames';

// Each language's table is its own chunk, loaded only when that language is selected.
const tableLoaders = import.meta.glob<BlockNameTable>('../i18n/blockNames/*.json', { import: 'default' });

const loaded = new Map<string, BlockNames>();
const loading = new Set<string>();
const listeners = new Set<() => void>();

function load(language: string) {
  const loader = tableLoaders[`../i18n/blockNames/${language}.json`];
  if (!loader || loaded.has(language) || loading.has(language)) return;
  loading.add(language);
  loader()
    .then(table => {
      loaded.set(language, createBlockNames(table));
      listeners.forEach(listener => listener());
    })
    .catch((error: unknown) => console.error(`Failed to load block names for ${language}`, error))
    .finally(() => loading.delete(language));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Block names in the current UI language, or English until (or unless) a table is loaded. */
export function useBlockNames(): BlockNames {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage;

  useEffect(() => {
    if (language) load(language);
  }, [language]);

  return useSyncExternalStore(subscribe, () => (language && loaded.get(language)) || englishBlockNames);
}
