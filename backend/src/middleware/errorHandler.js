import { env } from '../config/env.js';

/** Ruta inexistente → 404 */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/**
 * Manejador central de errores. Todos los errores (lanzados en controladores,
 * servicios o middlewares) terminan aquí.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande.' });
  }

  const status = err.status || 500;

  if (status >= 500) {
    // El detalle solo se registra en el servidor; al cliente se le envía un mensaje genérico
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
    return res.status(500).json({
      error: 'Error interno del servidor.',
      ...(env.isProduction ? {} : { debug: err.message }),
    });
  }

  res.status(status).json({ error: err.message, ...(err.details && { details: err.details }) });
}
