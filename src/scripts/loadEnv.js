import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Cargar variables de entorno desde .env (solo en dev local).
 * En serverless (Vercel/Lambda) las env vars vienen del runtime,
 * así que skipeamos silenciosamente.
 */
export function loadEnv() {
  // Saltar en entornos serverless: las env vars ya están inyectadas
  if (process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return;
  }

  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    // Parsear el archivo .env
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Ignorar comentarios y líneas vacías
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Buscar el patrón KEY=VALUE
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        continue;
      }
      
      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();
      
      // Remover comillas si existen
      value = value.replace(/^["']|["']$/g, '');
      
      // Establecer la variable de entorno (sobrescribir si existe)
      process.env[key] = value;
    }
    
    console.log('✅ Variables de entorno cargadas correctamente');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
  } catch (error) {
    // Solo log si NO es ENOENT (archivo no existe es esperado en algunos entornos)
    if (error.code !== 'ENOENT') {
      console.warn('⚠️  Error cargando .env:', error.message);
    }
  }
}