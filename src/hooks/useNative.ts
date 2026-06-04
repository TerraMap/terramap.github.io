import { useCallback, useEffect, useState } from 'react';
import { isNative } from '../lib/native';

export function useNative() {
  const [available] = useState(() => isNative());
  const [ready, setReady] = useState(() => isNative());

  useEffect(() => {
    if (available) setReady(true);
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
    if (ready) void execute();
  }, [ready, execute]);

  return { data, loading, error, execute };
}
