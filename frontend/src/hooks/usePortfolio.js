import { useEffect, useState } from 'react';
import { fetchPortfolio } from '../api/portfolio.js';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setPortfolio(await fetchPortfolio());
      } catch (err) {
        setError(err.message ?? 'Erreur chargement');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { portfolio, loading, error };
}
