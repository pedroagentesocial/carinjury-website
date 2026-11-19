// COMPILAR EN WINDOWS SIN PERMISOS DE SYMLINK.
//
// Al terminar `astro build`, el adaptador de Vercel copia las dependencias de la
// función a `.vercel/output/functions/_render.func` y recrea los enlaces de pnpm
// con `fs.symlink`. En Windows crear un symlink exige el "Modo de
// desarrollador" o una consola de administrador; sin eso la compilación truena
// con `EPERM: operation not permitted, symlink ...` aunque las páginas ya se
// hayan generado bien.
//
// Aquí, solo en Windows y solo si el symlink falla por permisos:
//   - carpetas: se crea una "junction", que Windows permite sin permisos
//     especiales y que Node sigue igual que un symlink;
//   - archivos: se copia el archivo de destino.
//
// En Vercel (Linux) este archivo no hace nada: la compilación de producción no
// cambia.
import { createRequire, syncBuiltinESMExports } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform === 'win32') {
  const require = createRequire(import.meta.url);
  const fsp = require('node:fs/promises');
  const original = fsp.symlink;

  fsp.symlink = async function symlinkConRespaldo(target, ruta, tipo) {
    try {
      return await original(target, ruta, tipo);
    } catch (err) {
      if (err?.code !== 'EPERM') throw err;
      const destinoRuta = ruta instanceof URL ? fileURLToPath(ruta) : String(ruta);
      const absoluto = path.resolve(path.dirname(destinoRuta), String(target));
      if (tipo === 'dir' || tipo === 'junction') {
        return original(absoluto, ruta, 'junction');
      }
      return fsp.copyFile(absoluto, ruta);
    }
  };

  // `@astrojs/internal-helpers` importa `node:fs/promises` como módulo ES; esto
  // hace que su `fs.symlink` apunte a la versión de arriba.
  syncBuiltinESMExports();
}
