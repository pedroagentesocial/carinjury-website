# 🚀 Instrucciones de Deploy - Car Injury Clinics

## 📋 Configuración Inicial

### 1. Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com) y crea un nuevo repositorio
2. Nombra el repositorio: `carinjury-website` (o el nombre que prefieras)
3. **NO** inicialices con README, .gitignore o licencia (ya los tenemos)
4. Copia la URL del repositorio (ejemplo: `https://github.com/tuusuario/carinjury-website.git`)

### 2. Conectar Proyecto Local con GitHub

Ejecuta estos comandos en tu terminal:

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/TUUSUARIO/TUREPOSITORIO.git

# Verificar que se agregó correctamente
git remote -v

# Subir el código inicial
git push -u origin main
```

### 3. Configurar Secrets en GitHub

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions → New repository secret

Agrega estos 3 secrets:

| Nombre | Valor |
|--------|-------|
| `HOST` | `31.170.166.253` |
| `USERNAME` | `u193371499.carinjuryclinics.com` |
| `PASSWORD` | `Card3nas1!` |

## 🔄 Métodos de Deploy

### Método 1: Deploy Automático (GitHub Actions)

**✅ Recomendado para producción**

1. Haz cambios en tu código
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```
3. GitHub Actions se ejecutará automáticamente
4. En 2-3 minutos tu sitio estará actualizado

### Método 2: Deploy Manual

**🛠️ Para testing o emergencias**

Ejecuta el script de deploy:
```bash
./deploy.sh
```

**Nota:** Necesitas instalar `sshpass` primero:
```bash
# En macOS
brew install hudochenkov/sshpass/sshpass

# En Ubuntu/Debian
sudo apt-get install sshpass
```

## 📁 Estructura de Deploy

```
Hostinger (~/public_html/)
├── index.html              # Página principal (español)
├── en/
│   ├── index.html          # Página principal (inglés)
│   ├── formulario/         # Formulario (inglés)
│   └── ...
├── formulario/
│   └── index.html          # Formulario (español)
├── gracias/
│   └── index.html          # Página de agradecimiento
├── _astro/                 # Assets optimizados
├── i18n/                   # Archivos de traducción
├── assets/                 # Imágenes y recursos
└── video/                  # Videos del sitio
```

## 🔍 Verificación del Deploy

### Después del Deploy Automático:
1. Ve a GitHub → Actions → Verifica que el workflow se ejecutó correctamente
2. Visita tu sitio web para confirmar los cambios

### Después del Deploy Manual:
1. El script mostrará el estado de cada paso
2. Al final verás un resumen con la URL del sitio

## 🌐 URLs del Sitio

- **Sitio Principal:** http://carinjuryclinics.com
- **Formulario (ES):** http://carinjuryclinics.com/formulario
- **Formulario (EN):** http://carinjuryclinics.com/en/formulario
- **Página de Gracias:** http://carinjuryclinics.com/gracias

## 🛠️ Comandos Útiles

```bash
# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline

# Crear nueva rama para desarrollo
git checkout -b nueva-funcionalidad

# Volver a la rama principal
git checkout main

# Actualizar desde GitHub
git pull origin main

# Ver archivos que serán ignorados
git ls-files --others --ignored --exclude-standard
```

## 🚨 Solución de Problemas

### Error: "Permission denied (publickey)"
```bash
# Usar HTTPS en lugar de SSH
git remote set-url origin https://github.com/TUUSUARIO/TUREPOSITORIO.git
```

### Error en GitHub Actions
1. Ve a Actions → Selecciona el workflow fallido
2. Revisa los logs para identificar el error
3. Verifica que los secrets estén configurados correctamente

### Error en Deploy Manual
1. Verifica que `sshpass` esté instalado
2. Confirma que las credenciales sean correctas
3. Asegúrate de que el build se completó sin errores

## 📞 Contacto de Soporte

Si necesitas ayuda adicional:
- Revisa los logs de GitHub Actions
- Verifica la conectividad con el servidor
- Confirma que el directorio `dist/` se generó correctamente

---

**¡Listo! Tu sitio web está configurado para deploys automáticos.** 🎉

Cada vez que hagas `git push origin main`, tu sitio se actualizará automáticamente en Hostinger.