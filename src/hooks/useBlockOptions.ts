import { useMemo } from 'react';
import { settings } from '../settings';

export type BlockType = 'Tile' | 'Item' | 'Wall';

export interface BlockOption {
  value: string;
  label: string;
  type: BlockType;
  id: string;
  dataU?: number;
  dataV?: number;
}

export function useBlockOptions() {
  return useMemo(() => {
    const options: BlockOption[] = [];

    for (let i = 0; i < settings.Tiles.length; i++) {
      const tile = settings.Tiles[i];
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

          let text = tile.Name;
          if (frame.Name) {
            text += ` - ${frame.Name}`;
          }
          if (frame.Variety) {
            text += ` - ${frame.Variety}`;
          }

          options.push({
            value: `${i}`,
            label: text,
            type: 'Tile',
            id: String(i),
            dataU: frame.U,
            dataV: frame.V,
          });
        }
      }
    }

    for (let i = 0; i < settings.Items.length; i++) {
      const item = settings.Items[i];
      item.isItem = true;
      options.push({
        value: `item${item.Id}`,
        label: item.Name,
        type: 'Item',
        id: item.Id,
      });
    }

    for (let i = 0; i < settings.Walls.length; i++) {
      const wall = settings.Walls[i];
      wall.isWall = true;
      options.push({
        value: `wall${wall.Id}`,
        label: wall.Name,
        type: 'Wall',
        id: wall.Id,
      });
    }

    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, []);
}
