import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import firstBy from 'thenby';
import { items } from '../items';
import { tiles } from '../tiles';
import { walls } from '../walls';
import { useBlockNames } from './useBlockNames';

export type BlockType = 'Tile' | 'Item' | 'Wall';

export interface BlockOption {
  value: string;
  label: string;
  /** The English name, so searches match it in every language. */
  englishLabel: string;
  type: BlockType;
  id: string;
  dataU?: number;
  dataV?: number;
  frameIndex?: number;
}

export function useBlockOptions() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  const names = useBlockNames();

  return useMemo(() => {
    const options: BlockOption[] = [];

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      tile.isTile = true;

      options.push({
        value: String(i),
        label: names.tile(tile.name),
        englishLabel: tile.name,
        type: 'Tile',
        id: String(i),
      });

      if (tile.frames) {
        for (let f = 0; f < tile.frames.length; f++) {
          const frame = tile.frames[f];
          frame.isTile = true;

          if (frame.name === 'Default' && frame.variety === 'Default') continue;

          // Localize each part before joining, so untranslated parts stay English on their own.
          const parts = [tile.name];
          if (frame.name && frame.name !== tile.name) {
            parts.push(frame.name);
          }
          if (frame.variety && frame.variety !== 'Default') {
            parts.push(frame.variety);
          }

          if (parts.length === 1 && (frame.u ?? 0) === 0 && (frame.v ?? 0) === 0) continue;

          options.push({
            value: `${i}`,
            label: parts.map(part => names.tile(part)).join(' - '),
            englishLabel: parts.join(' - '),
            type: 'Tile',
            id: String(i),
            dataU: frame.u,
            dataV: frame.v,
            frameIndex: f,
          });
        }
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.isItem = true;
      options.push({
        value: `item${item.id}`,
        label: names.item(item.id, item.name),
        englishLabel: item.name,
        type: 'Item',
        id: String(item.id),
      });
    }

    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      wall.isWall = true;
      options.push({
        value: `wall${wall.id}`,
        label: names.wall(wall.id, wall.name),
        englishLabel: wall.name,
        type: 'Wall',
        id: String(wall.id),
      });
    }

    // English keeps its original order; other languages sort by their own collation.
    const collator = new Intl.Collator(language);
    options.sort(language === 'en' ? firstBy('label') : firstBy('label', { cmp: (a: string, b: string) => collator.compare(a, b) }));
    return options;
  }, [language, names]);
}
