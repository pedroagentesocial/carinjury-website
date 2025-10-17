#!/bin/bash

# Script de deploy via FTP para Hostinger
# Uso: ./ftp_deploy.sh

set -e

echo "🚀 Iniciando proceso de deploy via FTP..."

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

echo -e "${YELLOW}📤 Subiendo archivos al servidor via FTP...${NC}"

# Crear script FTP temporal
cat > /tmp/ftp_script.txt << EOF
open ${HOST}
user ${USERNAME} ${PASSWORD}
binary
cd ${REMOTE_PATH}
prompt off
mdelete *
rmdir aboutus
rmdir en
rmdir faq
rmdir formulario
rmdir lawyer-approved
rmdir schedule
rmdir services
mput dist/*
mkdir aboutus
cd aboutus
mput dist/aboutus/*
cd ..
mkdir en
cd en
mput dist/en/*
cd ..
mkdir faq
cd faq
mput dist/faq/*
cd ..
mkdir formulario
cd formulario
mput dist/formulario/*
cd ..
mkdir lawyer-approved
cd lawyer-approved
mput dist/lawyer-approved/*
cd ..
mkdir schedule
cd schedule
mput dist/schedule/*
cd ..
mkdir services
cd services
mput dist/services/*
cd ..
mkdir _astro
cd _astro
mput dist/_astro/*
cd ..
mkdir assets
cd assets
mkdir img
cd img
mput dist/assets/img/*
cd ..
cd ..
ls -la
quit
EOF

# Ejecutar FTP
ftp -n < /tmp/ftp_script.txt

# Limpiar archivo temporal
rm -f /tmp/ftp_script.txt

echo -e "${GREEN}🎉 Deploy completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Tu sitio debería estar disponible en: http://carinjuryclinics.com${NC}"

echo -e "${YELLOW}📋 Resumen del deploy:${NC}"
echo "- Host: ${HOST}"
echo "- Usuario: ${USERNAME}"
echo "- Directorio: ${REMOTE_PATH}"
echo "- Fecha: $(date)"