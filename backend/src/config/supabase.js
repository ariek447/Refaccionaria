import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Único punto de conexión con Supabase. Usa la service key (rol service_role),
// que omite RLS: por eso solo debe existir en el servidor, nunca en el frontend.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
