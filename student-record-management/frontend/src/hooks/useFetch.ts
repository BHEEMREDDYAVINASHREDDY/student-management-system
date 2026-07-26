import { useCallback, useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Generic data-fetching hook: pass an axios call, get back { data, loading, error, refetch }.
// Re-runs whenever any value in `deps` changes.
export function useFetch<T>(
  fetcher: () => Promise<AxiosResponse<T>>,
  deps: unknown[] = []
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const refetch = () => setTick((t) => t + 1);

  return { data, loading, error, refetch };
}
