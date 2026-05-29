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
        label: tile.Name,
        type: 'Tile',
        id: String(i),
      });

      if (tile.Frames) {
        for (let f = 0; f < tile.Frames.length; f++) {
          const frame = tile.Frames[f];
          frame.isTile = true;

          if (frame.Name === 'Default' && frame.Variety === 'Default') continue;

          let text = tile.Name;
          if (frame.Name && frame.Name !== tile.Name) {
            text += ` - ${frame.Name}`;
          }
          if (frame.Variety && frame.Variety !== 'Default') {
            text += ` - ${frame.Variety}`;
          }

          if (text === tile.Name && (frame.U ?? 0) === 0 && (frame.V ?? 0) === 0) continue;

          options.push({
            value: `${i}`,
            label: text,
            type: 'Tile',
            id: String(i),
            dataU: frame.U,
            dataV: frame.V,
            frameIndex: f,
          });
        }
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.isItem = true;
      options.push({
        value: `item${item.Id}`,
        label: item.Name,
        type: 'Item',
        id: item.Id,
      });
    }

    for (let i = 0; i < walls.length; i++) {
      const wall = walls[i];
      wall.isWall = true;
      options.push({
        value: `wall${wall.Id}`,
        label: wall.Name,
        type: 'Wall',
        id: wall.Id,
      });
    }

    options.sort(firstBy('label'));
    return options;
  }, []);
}
