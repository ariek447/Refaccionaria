import dotenv from 'dotenv';

// Carga las variables definidas en backend/.env (solo existe en desarrollo;
// en Render se configuran desde el panel "Environment").
dotenv.config({ quiet: true });

const REQUIRED_VARIABLES = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ADMIN_PASSWORD', 'AUTH_SECRET'];

const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  console.error('Copia backend/.env.example a backend/.env y completa los valores.');
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

// En producción no se aceptan contraseñas/secretos cortos
const MIN_LENGTHS = { ADMIN_PASSWORD: 12, AUTH_SECRET: 32 };
if (nodeEnv === 'production') {
  const tooShort = Object.entries(MIN_LENGTHS).filter(([name, min]) => process.env[name].length < min);
  if (tooShort.length > 0) {
    tooShort.forEach(([name, min]) => console.error(`${name} debe tener al menos ${min} caracteres en producción.`));
    process.exit(1);
  }
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  adminPassword: process.env.ADMIN_PASSWORD,
  authSecret: process.env.AUTH_SECRET, // llave para firmar los tokens de sesión
  // Permite uno o varios dominios separados por coma, sin "/" final
  frontendUrls: (process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),
};
