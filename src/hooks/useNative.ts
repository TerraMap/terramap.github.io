import { useCallback, useEffect, useState } from 'react';
import { initNeutralino } from '../lib/neutralino';

export function useNative() {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(
    typeof window !== 'undefined' && 'NL_VERSION' in window
  );

  useEffect(() => {
    if (available) return;
    // injectClientLibrary may inject globals after initial render
    const interval = setInterval(() => {
      if ('NL_VERSION' in window) {
        setAvailable(true);
        clearInterval(interval);
      }
    }, 50);
    const timeout = setTimeout(() => clearInterval(interval), 3000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [available]);

  useEffect(() => {
    if (!available) return;
    initNeutralino().then(() => setReady(true));
  }, [available]);

  return { available, ready };
}

export function useNativeAsync<T>(fn: () => Promise<T>, ready: boolean) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (e) {
      setError(e as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  useEffect(() => {
    if (ready) execute();
  }, [ready, execute]);

  return { data, loading, error, execute };
}
