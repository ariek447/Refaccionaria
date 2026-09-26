import { HttpError } from '../utils/httpError.js';

// Protección contra fuerza bruta: máximo 5 intentos fallidos por IP cada 15 minutos.
// Se guarda en memoria: si el servidor se reinicia, los contadores vuelven a cero.
const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const failedAttempts = new Map(); // ip -> { count, resetAt }

function getEntry(ip) {
  const entry = failedAttempts.get(ip);
  if (entry && entry.resetAt <= Date.now()) {
    failedAttempts.delete(ip);
    return undefined;
  }
  return entry;
}

/** Middleware: bloquea la IP si ya superó el límite de intentos fallidos. */
export function loginRateLimit(req, res, next) {
  const entry = getEntry(req.ip);
  if (entry && entry.count >= MAX_FAILED_ATTEMPTS) {
    const minutes = Math.ceil((entry.resetAt - Date.now()) / 60000);
    return next(new HttpError(429, `Demasiados intentos fallidos. Intenta de nuevo en ${minutes} min.`));
  }
  next();
}

export function recordFailedLogin(ip) {
  const entry = getEntry(ip) || { count: 0, resetAt: Date.now() + WINDOW_MS };
  entry.count += 1;
  failedAttempts.set(ip, entry);
}

export function clearFailedLogins(ip) {
  failedAttempts.delete(ip);
}

// Limpieza periódica para que el Map no crezca indefinidamente
setInterval(() => {
  for (const ip of failedAttempts.keys()) getEntry(ip);
}, WINDOW_MS).unref();
