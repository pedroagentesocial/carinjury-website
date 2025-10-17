#!/bin/bash

# Script de deploy manual para Hostinger
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando proceso de deploy..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración del servidor
HOST="31.170.166.253"
USERNAME="u193371499.carinjuryclinics.com"
REMOTE_PATH="~/public_html"

echo -e "${YELLOW}📦 Construyendo el proyecto...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build. Abortando deploy.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado exitosamente${NC}"

echo -e "${YELLOW}📤 Subiendo archivos al servidor...${NC}"

# Crear backup en el servidor
echo -e "${YELLOW}💾 Creando backup del sitio actual...${NC}"
sshpass -p "Card3nas1!" ssh -o StrictHostKeyChecking=no ${USERNAME}@${HOST} "
    mkdir -p ~/backups
    if [ -d ~/public_html ]; then
        tar -czf ~/backups/backup-\$(date +%Y%m%d-%H%M%S).tar.gz ~/public_html
        echo 'Backup creado exitosamente'
    fi
"

# Limpiar directorio remoto
echo -e "${YELLOW}🧹 Limpiando directorio remoto...${NC}"
sshpass -p "Card3nas1!" ssh -o StrictHostKeyChecking=no ${USERNAME}@${HOST} "
    rm -rf ~/public_html/*
    echo 'Directorio limpiado'
"

# Subir archivos
echo -e "${YELLOW}📁 Transfiriendo archivos...${NC}"
sshpass -p "Card3nas1!" scp -r -o StrictHostKeyChecking=no dist/* ${USERNAME}@${HOST}:${REMOTE_PATH}/

# Establecer permisos correctos
echo -e "${YELLOW}🔐 Estableciendo permisos...${NC}"
sshpass -p "Card3nas1!" ssh -o StrictHostKeyChecking=no ${USERNAME}@${HOST} "
    find ~/public_html -type d -exec chmod 755 {} \;
    find ~/public_html -type f -exec chmod 644 {} \;
    echo 'Permisos establecidos correctamente'
"

# Verificar deploy
echo -e "${YELLOW}🔍 Verificando deploy...${NC}"
sshpass -p "Card3nas1!" ssh -o StrictHostKeyChecking=no ${USERNAME}@${HOST} "
    echo 'Contenido del directorio público:'
    ls -la ~/public_html/
    echo ''
    echo 'Archivos principales:'
    ls -la ~/public_html/index.html ~/public_html/formulario/ ~/public_html/en/ 2>/dev/null || echo 'Algunos archivos no encontrados'
"

echo -e "${GREEN}🎉 Deploy completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Tu sitio debería estar disponible en: http://carinjuryclinics.com${NC}"

echo -e "${YELLOW}📋 Resumen del deploy:${NC}"
echo "- Host: ${HOST}"
echo "- Usuario: ${USERNAME}"
echo "- Directorio: ${REMOTE_PATH}"
echo "- Fecha: $(date)"