import { useState, useEffect } from 'react';

export function useLiveRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRates = async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data?.rates) {
        setRates(data.rates);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRate = (from, to) => {
    if (!rates) return null;
    if (from === 'USD') return rates[to];
    if (to === 'USD') return 1 / rates[from];
    return rates[to] / rates[from];
  };

  return { rates, loading, error, getRate };
}
