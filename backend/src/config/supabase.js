import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Único punto de conexión con Supabase. Solo el backend conoce las credenciales.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
