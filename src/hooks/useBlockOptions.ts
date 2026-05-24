import { useMemo } from 'react';
import { settings } from '../settings';

export type BlockType = 'tile' | 'item' | 'wall';

export interface BlockOption {
  value: string;
  label: string;
  type: BlockType;
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
        label: `${tile.Name} (Tile ${i})`,
        type: 'tile',
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
          text += ` (Tile ${i})`;

          options.push({
            value: `${i}`,
            label: text,
            type: 'tile',
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
        label: `${item.Name} (Item ${item.Id})`,
        type: 'item',
      });
    }

    for (let i = 0; i < settings.Walls.length; i++) {
      const wall = settings.Walls[i];
      wall.isWall = true;
      options.push({
        value: `wall${wall.Id}`,
        label: `${wall.Name} (Wall)`,
        type: 'wall',
      });
    }

    options.sort((a, b) => a.label.localeCompare(b.label));
    return options;
  }, []);
}
