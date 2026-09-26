import { supabase } from '../config/supabase.js';
import { HttpError } from '../utils/httpError.js';
import { toHttpError } from '../utils/dbErrors.js';

/**
 * Crea las operaciones CRUD básicas sobre una tabla de Supabase.
 * Cada recurso (users, cars, parts) la reutiliza con su propia configuración
 * para no repetir el mismo código tres veces.
 *
 * @param {object} config
 * @param {string} config.table         Nombre de la tabla
 * @param {string} [config.listSelect]  Columnas/relaciones al listar
 * @param {string} [config.detailSelect] Columnas/relaciones al consultar uno
 * @param {object} config.messages      Mensajes de error del recurso
 */
export function createCrudService({ table, listSelect = '*', detailSelect = listSelect, messages }) {
  const handle = ({ data, error }) => {
    if (error) throw toHttpError(error, messages);
    return data;
  };

  const ensureFound = (data) => {
    if (!data) throw new HttpError(404, messages.notFound);
    return data;
  };

  return {
    async findAll() {
      return handle(
        await supabase.from(table).select(listSelect).order('created_at', { ascending: false }),
      );
    },

    async findById(id) {
      return ensureFound(
        handle(await supabase.from(table).select(detailSelect).eq('id', id).maybeSingle()),
      );
    },

    async create(payload) {
      return handle(await supabase.from(table).insert(payload).select(listSelect).single());
    },

    async update(id, payload) {
      return ensureFound(
        handle(
          await supabase.from(table).update(payload).eq('id', id).select(listSelect).maybeSingle(),
        ),
      );
    },

    async remove(id) {
      ensureFound(handle(await supabase.from(table).delete().eq('id', id).select('id').maybeSingle()));
    },
  };
}
