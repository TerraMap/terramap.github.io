import { useCallback } from 'react';
import { discoverWorlds, type WorldEntry } from '../lib/neutralino';
import { useNativeAsync } from './useNative';

export default function useFetchWorlds(ready: boolean) {
  const fn = useCallback(() => discoverWorlds(), []);
  return useNativeAsync<WorldEntry[]>(fn, ready);
}
