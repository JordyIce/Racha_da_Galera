import { useState, useEffect } from 'react';

export function useData(month) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const param = month === 'all' ? 'all' : month;
    fetch(`/api/sheets?month=${param}`)
      .then(r => r.json())
      .then(res => {
        if (!res.ok) throw new Error(res.error);
        const sorted = [...res.data].sort((a, b) => b.pontos - a.pontos);
        setData(sorted);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [month]);

  return { data, loading, error };
}
