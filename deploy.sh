#!/bin/bash

# Variables
VPS_IP="31.97.43.51"
VPS_USER="root"
REPO_URL="https://github.com/axel180926-prog/AdministracionNG.git"
PROJECT_PATH="/var/www/negocio-admin"

echo "🚀 Iniciando despliegue en VPS Hostinger..."

# Actualizar el sistema
echo "📦 Actualizando el sistema..."
apt update && apt upgrade -y

# Instalar dependencias necesarias
echo "📚 Instalando dependencias..."
apt install -y nginx postgresql postgresql-contrib nodejs npm

# Configurar PostgreSQL
echo "🗄️ Configurando PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Clonar/Actualizar repositorio
echo "📥 Clonando/Actualizando repositorio..."
if [ -d "$PROJECT_PATH" ]; then
    cd $PROJECT_PATH
    git pull
else
    git clone $REPO_URL $PROJECT_PATH
fi

# Instalar dependencias de Node
echo "📦 Instalando dependencias de Node..."
cd $PROJECT_PATH/backend
npm install
npm run build

# Configurar variables de entorno
echo "⚙️ Configurando variables de entorno..."
cp .env.production .env

# Configurar Nginx
echo "🌐 Configurando Nginx..."
cp nginx-default.conf /etc/nginx/sites-available/default
systemctl restart nginx

# Instalar y configurar PM2
echo "🔄 Configurando PM2..."
npm install -g pm2
pm2 delete negocio-admin || true
pm2 start dist/server.js --name negocio-admin
pm2 save
pm2 startup

echo "✅ ¡Despliegue completado!"
echo "🌍 La aplicación debería estar accesible en http://$VPS_IP"
