import { useCallback, useState } from 'react';
import { discoverPlayers, type FileEntry, type WorldEntry } from '../lib/native';

export interface PlayerEntry extends FileEntry {
  playerName: string;
}

export default function useFetchPlayers() {
  const [data, setData] = useState<PlayerEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (world: WorldEntry) => {
    setLoading(true);
    setError(null);
    try {
      const result = await discoverPlayers(world);
      setData(result);
      return result;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
}
