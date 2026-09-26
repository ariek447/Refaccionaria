import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../components/Toast.jsx';

/**
 * Lógica común de las páginas de administración: cargar el listado,
 * crear/editar y eliminar registros mostrando notificaciones.
 *
 * @param {object} api      Objeto de api/client.js (usersApi, carsApi, partsApi)
 * @param {object} messages Textos de éxito/error del recurso
 */
export function useCrud(api, messages) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await api.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  /** Crea (sin id) o actualiza (con id). Relanza el error para que el formulario muestre los detalles. */
  async function save(values, id) {
    const isEdit = id !== undefined;
    try {
      const saved = isEdit ? await api.update(id, values) : await api.create(values);
      setItems((current) =>
        isEdit ? current.map((item) => (item.id === id ? saved : item)) : [saved, ...current],
      );
      toast.success(isEdit ? messages.updated : messages.created);
    } catch (err) {
      toast.error(`${isEdit ? messages.updateError : messages.createError} ${err.message}`);
      throw err;
    }
  }

  /** Elimina y devuelve true si tuvo éxito. */
  async function remove(id) {
    try {
      await api.remove(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success(messages.deleted);
      return true;
    } catch (err) {
      toast.error(`${messages.deleteError} ${err.message}`);
      return false;
    }
  }

  return { items, loading, error, reload: load, save, remove };
}
