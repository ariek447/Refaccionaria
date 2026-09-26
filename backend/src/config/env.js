import dotenv from 'dotenv';

// Carga las variables definidas en backend/.env (solo existe en desarrollo;
// en Render se configuran desde el panel "Environment").
dotenv.config({ quiet: true });

const REQUIRED_VARIABLES = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  console.error('Copia backend/.env.example a backend/.env y completa los valores.');
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  // Permite uno o varios dominios separados por coma, sin "/" final
  frontendUrls: (process.env.FRONTEND_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean),
};
