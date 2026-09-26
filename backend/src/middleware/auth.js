import { HttpError } from '../utils/httpError.js';
import { verifyToken } from '../utils/token.js';

/**
 * Exige el header "Authorization: Bearer <token>" con un token válido.
 * Se aplica a todas las rutas de /api excepto /health y /login.
 */
export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token || !verifyToken(token)) {
    return next(new HttpError(401, 'Sesión inválida o expirada. Inicia sesión de nuevo.'));
  }
  next();
}
