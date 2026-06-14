import { useTranslation } from 'react-i18next';
import type { PlayerMap } from '../lib/readPlayerMap';
import { capitalizeFirstLetter } from '../lib/string';

export function WorldSpread({ worldProperties, playerMap, maxHeight }: { worldProperties: Record<string, unknown>; playerMap: PlayerMap | null; maxHeight?: string }) {
  const { t } = useTranslation();

  const properties: Record<string, unknown> = { ...worldProperties };

  if (playerMap?.percent) {
    const pct = playerMap.percent.toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 });
    properties.explored = `${playerMap.count.toLocaleString()} (${pct})`;
  }

  const filteredKeys = Object.keys(properties).filter(
    k => [
      'explored',
      'solidBlocks',
      'corruptBlocks',
      'crimsonBlocks',
      'hallowBlocks'].includes(k)
  ).sort();

  console.log({ filteredKeys, properties });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight }}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'auto', flex: 1 }}>
        {filteredKeys
          .map((key) => (
            <li key={key} style={{ padding: '4px 0' }}>
              <strong>{capitalizeFirstLetter(key.replace('Blocks', ''))}:</strong> {String(properties[key])}
            </li>
          ))}
      </ul>
    </div>
  );
}
