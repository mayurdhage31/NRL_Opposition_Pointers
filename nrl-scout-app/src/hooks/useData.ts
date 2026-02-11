import { useState, useEffect } from 'react';
import { loadAllData } from '../data/loadCsv';
import type { NRLData } from '../data/types';

export function useData() {
  const [data, setData] = useState<NRLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadAllData()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
