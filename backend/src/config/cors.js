import { env } from './env.js';

const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (env.frontendUrls.includes(origin)) return true;
  // En desarrollo se permite cualquier puerto de localhost
  return !env.isProduction && LOCALHOST_ORIGIN.test(origin);
}

export const corsOptions = {
  origin(origin, callback) {
    // Peticiones sin cabecera Origin (curl, health check de Render) no vienen de un navegador
    if (!origin) return callback(null, true);
    return callback(null, isAllowedOrigin(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
