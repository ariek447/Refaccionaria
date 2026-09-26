import { HttpError } from './httpError.js';

// Códigos de error de PostgreSQL más comunes
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_CHECK_VIOLATION = '23514';
const PG_NOT_NULL_VIOLATION = '23502';

/**
 * Traduce un error de Supabase/PostgreSQL a un HttpError con un mensaje claro.
 * @param {object} error    Error devuelto por supabase-js
 * @param {object} messages Mensajes específicos del recurso (ver services/*.service.js)
 */
export function toHttpError(error, messages = {}) {
  switch (error.code) {
    case PG_UNIQUE_VIOLATION: {
      const constraint = Object.keys(messages.unique || {}).find((name) =>
        error.message.includes(name),
      );
      return new HttpError(409, messages.unique?.[constraint] || 'El registro ya existe.');
    }
    case PG_FOREIGN_KEY_VIOLATION:
      return new HttpError(
        messages.foreignKey?.status || 409,
        messages.foreignKey?.message || 'El registro está relacionado con otros datos.',
      );
    case PG_CHECK_VIOLATION:
    case PG_NOT_NULL_VIOLATION:
      return new HttpError(400, 'Los datos no cumplen las reglas de la base de datos.');
    default:
      // Error inesperado (red, credenciales, etc.): se registra y se responde 500
      return error instanceof Error ? error : Object.assign(new Error(error.message), error);
  }
}
