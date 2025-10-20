#!/bin/bash

# Script de deploy rápido via FTP para resolver error 403
# Uso: ./quick_deploy.sh

set -e

echo "🚀 Deploy rápido para resolver error 403..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración del servidor
HOST="31.170.166.253"
USERNAME="u193371499.carinjuryclinics.com"
PASSWORD="Card3nas1!"
REMOTE_PATH="public_html"

echo -e "${YELLOW}📦 Construyendo el proyecto...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build. Abortando deploy.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado exitosamente${NC}"

echo -e "${YELLOW}📤 Subiendo archivos principales al servidor...${NC}"

# Usar lftp para mejor manejo de FTP
lftp -c "
set ftp:ssl-allow no
open ftp://${USERNAME}:${PASSWORD}@${HOST}
cd ${REMOTE_PATH}
put dist/index.html
put dist/favicon.ico
mirror -R dist/_astro _astro
mirror -R dist/assets assets
mirror -R dist/i18n i18n
mirror -R dist/video video
mirror -R dist/images images
mirror -R dist/utils utils
mirror -R dist/en en
mirror -R dist/formulario formulario
mirror -R dist/services services
mirror -R dist/aboutus aboutus
mirror -R dist/faq faq
mirror -R dist/gracias gracias
mirror -R dist/lawyer-approved lawyer-approved
mirror -R dist/privacy privacy
mirror -R dist/schedule schedule
mirror -R dist/api api
chmod 644 index.html
chmod 644 favicon.ico
chmod -R 644 _astro/*
chmod -R 644 assets/*
chmod -R 644 i18n/*
chmod -R 644 video/*
chmod -R 644 images/*
chmod -R 644 utils/*
chmod -R 755 en
chmod -R 755 formulario
chmod -R 755 services
chmod -R 755 aboutus
chmod -R 755 faq
chmod -R 755 gracias
chmod -R 755 lawyer-approved
chmod -R 755 privacy
chmod -R 755 schedule
chmod -R 755 api
quit
"

echo -e "${GREEN}🎉 Deploy completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Tu sitio debería estar disponible en: https://carinjuryclinics.com${NC}"

echo -e "${YELLOW}📋 Resumen del deploy:${NC}"
echo "- Host: ${HOST}"
echo "- Usuario: ${USERNAME}"
echo "- Directorio: ${REMOTE_PATH}"
echo "- Fecha: $(date)"

echo -e "${YELLOW}🔍 Verificando sitio...${NC}"
sleep 3
curl -I https://carinjuryclinics.com