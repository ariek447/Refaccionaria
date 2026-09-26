import { useEffect, useState } from 'react';

/**
 * Ejecuta una petición al montar el componente (y cuando cambian "deps")
 * y expone su estado: data, loading, error y reload.
 *
 * @param {function} fetcher Función que devuelve una promesa, p. ej. () => usersApi.get(id)
 * @param {Array} deps       Valores que provocan una nueva petición al cambiar
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, reload: load };
}
