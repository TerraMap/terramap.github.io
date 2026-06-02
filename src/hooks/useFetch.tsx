import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFetchOptions extends RequestInit {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseFetchReturn<T> extends UseFetchState<T> {
  execute: (url?: string, options?: RequestInit) => Promise<T | null>;
  abort: () => void;
  reset: () => void;
}

export function useFetch<T = unknown>(url?: string, options: UseFetchOptions = {}): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const execute = useCallback(
    async (executeUrl?: string, executeOptions?: RequestInit): Promise<T | null> => {
      const targetUrl = executeUrl || url;

      if (!targetUrl) {
        const error = new Error('No URL provided');
        setState((prev) => ({ ...prev, error, loading: false }));
        optionsRef.current.onError?.(error);
        throw error;
      }

      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { onSuccess, ...fetchOptions } = optionsRef.current;

        const response = await fetch(targetUrl, {
          ...fetchOptions,
          ...executeOptions,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Try to parse as JSON, fallback to text
        let data: T;
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          data = (await response.json()) as T;
        } else {
          data = (await response.text()) as T;
        }

        setState({ data, loading: false, error: null });
        onSuccess?.(data);
        return data;
      } catch (error) {
        const fetchError = error as Error;

        if (fetchError.name === 'AbortError') {
          return null;
        }

        setState((prev) => ({ ...prev, loading: false, error: fetchError }));
        optionsRef.current.onError?.(fetchError);
        throw fetchError;
      }
    },
    [url],
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    abort();
    setState({ data: null, loading: false, error: null });
  }, [abort]);

  // Execute immediately if immediate option is true and url is provided
  useEffect(() => {
    if (options.immediate && url) {
      void execute();
    }
  }, [url, options.immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    ...state,
    execute,
    abort,
    reset,
  };
}

// Convenience hooks for specific HTTP methods
export function useGet<T = unknown>(url?: string, options: UseFetchOptions = {}) {
  return useFetch<T>(url, { ...options, method: 'GET' });
}

export function usePost<T = unknown>(url?: string, options: UseFetchOptions = {}) {
  return useFetch<T>(url, { ...options, method: 'POST' });
}

export function usePut<T = unknown>(url?: string, options: UseFetchOptions = {}) {
  return useFetch<T>(url, { ...options, method: 'PUT' });
}

export function useDelete<T = unknown>(url?: string, options: UseFetchOptions = {}) {
  return useFetch<T>(url, { ...options, method: 'DELETE' });
}
