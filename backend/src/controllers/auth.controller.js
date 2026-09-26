import { env } from '../config/env.js';
import { clearFailedLogins, recordFailedLogin } from '../middleware/loginRateLimit.js';
import { HttpError } from '../utils/httpError.js';
import { createToken, safeEqual } from '../utils/token.js';

/** POST /api/login  { "password": "..." }  →  { token, expiresAt } */
export function login(req, res) {
  const password = req.body?.password;

  if (typeof password !== 'string' || password === '') {
    throw new HttpError(400, 'La contraseña es obligatoria.');
  }

  if (!safeEqual(password, env.adminPassword)) {
    recordFailedLogin(req.ip);
    throw new HttpError(401, 'Contraseña incorrecta.');
  }

  clearFailedLogins(req.ip);
  res.json(createToken());
}
