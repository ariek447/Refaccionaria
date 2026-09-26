import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Token de sesión sin estado (misma idea que un JWT con HS256):
 *
 *   base64url(payload) . base64url(HMAC-SHA256(payload, AUTH_SECRET))
 *
 * El servidor no guarda sesiones: para validar un token basta con recalcular
 * la firma. Si alguien modifica el payload (por ejemplo, la expiración),
 * la firma deja de coincidir y el token se rechaza.
 */

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

const sign = (data) => crypto.createHmac('sha256', env.authSecret).update(data).digest('base64url');

/** Compara dos textos en tiempo constante (evita ataques de temporización). */
export function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function createToken() {
  const now = Date.now();
  // iat/exp en milisegundos
  const payload = { sub: 'admin', iat: now, exp: now + TOKEN_TTL_MS };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  return {
    token: `${encodedPayload}.${sign(encodedPayload)}`,
    expiresAt: new Date(payload.exp).toISOString(),
  };
}

/** Devuelve el payload si el token es auténtico y no ha expirado; si no, null. */
export function verifyToken(token) {
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  if (!safeEqual(signature, sign(encodedPayload))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}
