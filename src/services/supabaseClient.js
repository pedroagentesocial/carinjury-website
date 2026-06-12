import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Si falta alguna env var, los clientes quedan en null y los consumidores
// deben hacer fallback. NO lanzar error en el import: eso rompía rutas que
// solo importan el módulo de forma transitiva (ej. /api/rates/current).
const missing = [];
if (!supabaseUrl) missing.push('SUPABASE_URL');
if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

export const isSupabaseConfigured = missing.length === 0;

if (!isSupabaseConfigured) {
  console.warn(
    `[supabaseClient] Supabase no configurado (faltan: ${missing.join(', ')}). ` +
    `Los consumidores deben usar fallback. Configura las variables en .env o en Vercel → Settings → Environment Variables.`
  );
}

// Cliente para frontend (usando anon key)
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente para backend (usando service role key)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export default supabase;