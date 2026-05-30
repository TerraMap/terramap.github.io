import { useMemo } from 'react';
import firstBy from 'thenby';
import { items } from '../items';
import { tiles } from '../tiles';
import { walls } from '../walls';

export type BlockType = 'Tile' | 'Item' | 'Wall';

export interface BlockOption {
  value: string;
  label: string;
  type: BlockType;
  id: string;
  dataU?: number;
  dataV?: number;
  frameIndex?: number;
}

export function useBlockOptions() {
  return useMemo(() => {
    const options: BlockOption[] = [];

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      tile.isTile = true;

      options.push({
        value: String(i),
        label: tile.name,
        type: 'Tile',
        id: String(i),
      });

      if (tile.frames) {
        for (let f = 0; f < tile.frames.length; f++) {
          const frame = tile.frames[f];
          frame.isTile = true;

          if (frame.name === 'Default' && frame.variety === 'Default') continue;

          let text = tile.name;
          if (frame.name && frame.name !== tile.name) {
            text += ` - ${frame.name}`;
          }
          if (frame.variety && frame.variety !== 'Default') {
            text += ` - ${frame.variety}`;
          }

          if (text === tile.name && (frame.u ?? 0) === 0 && (frame.v ?? 0) === 0) continue;

          options.push({
            value: `${i}`,
            label: text,
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
        label: item.name,
        type: 'Item',
        id: String(item.id),
      });
    }

    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      wall.isWall = true;
      options.push({
        value: `wall${wall.id}`,
        label: wall.name,
        type: 'Wall',
        id: String(wall.id),
      });
    }

    options.sort(firstBy('label'));
    return options;
  }, []);
}
