# VPS CONFIGURACION COMPLETA - COPIA Y PEGA
# Este script configura TODO el VPS en 5 pasos

$SSH_KEY = "$HOME\.ssh\vps_key"
$VPS = "root@31.97.43.51"
$DB_PASSWORD = "R@mmstein180926"

Write-Host "=== CONFIGURACION VPS ===" -ForegroundColor Green
Write-Host "VPS: $VPS" -ForegroundColor Cyan
Write-Host "Contraseña BD: (configurada)" -ForegroundColor Cyan

# PASO 1: Configurar PostgreSQL
Write-Host "`nPASO 1: Configurando PostgreSQL..." -ForegroundColor Yellow

ssh -i $SSH_KEY $VPS << 'EOF'

sudo -u postgres psql << 'PSQL'
CREATE DATABASE negocio_admin_db;
CREATE USER negocio_admin_user WITH PASSWORD 'R@mmstein180926';
ALTER ROLE negocio_admin_user SET client_encoding TO 'utf8';
ALTER ROLE negocio_admin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE negocio_admin_user CREATEDB;

\c negocio_admin_db
GRANT ALL PRIVILEGES ON SCHEMA public TO negocio_admin_user;

PSQL

echo "BASE DE DATOS CREADA"

EOF

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PASO 1 COMPLETADO" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR EN PASO 1" -ForegroundColor Red
    exit 1
}

# PASO 2: Crear directorios
Write-Host "`nPASO 2: Creando directorios..." -ForegroundColor Yellow

ssh -i $SSH_KEY $VPS << 'EOF'

mkdir -p /var/www/negocio-admin/backend
mkdir -p /var/www/negocio-admin/logs
mkdir -p /var/www/negocio-admin/data

ls -la /var/www/negocio-admin/

echo "DIRECTORIOS CREADOS"

EOF

Write-Host "✓ PASO 2 COMPLETADO" -ForegroundColor Green

# PASO 3: Crear archivo .env
Write-Host "`nPASO 3: Creando archivo .env..." -ForegroundColor Yellow

ssh -i $SSH_KEY $VPS << 'EOF'

cat > /var/www/negocio-admin/backend/.env << 'ENV'
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=negocio_admin_db
DB_USER=negocio_admin_user
DB_PASSWORD=R@mmstein180926
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Aplicacion
APP_NAME=NegocioAdmin
APP_URL=http://31.97.43.51
API_URL=http://31.97.43.51/api

# Seguridad
CORS_ORIGIN=http://31.97.43.51,http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

ENV

chmod 600 /var/www/negocio-admin/backend/.env
echo "ARCHIVO .env CREADO"

EOF

Write-Host "✓ PASO 3 COMPLETADO" -ForegroundColor Green

# PASO 4: Configurar Nginx
Write-Host "`nPASO 4: Configurando Nginx..." -ForegroundColor Yellow

ssh -i $SSH_KEY $VPS << 'EOF'

sudo tee /etc/nginx/sites-available/negocio-admin.conf > /dev/null << 'NGINX'
upstream negocio_admin_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name _;
    
    client_max_body_size 10M;
    
    location /api/ {
        proxy_pass http://negocio_admin_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        proxy_pass http://negocio_admin_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/negocio-admin.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "NGINX CONFIGURADO"

EOF

Write-Host "✓ PASO 4 COMPLETADO" -ForegroundColor Green

# PASO 5: Crear PM2 ecosystem
Write-Host "`nPASO 5: Configurando PM2..." -ForegroundColor Yellow

ssh -i $SSH_KEY $VPS << 'EOF'

cat > /var/www/negocio-admin/ecosystem.config.js << 'PM2'
module.exports = {
  apps: [{
    name: 'negocio-admin',
    script: './server.js',
    cwd: '/var/www/negocio-admin/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/negocio-admin/logs/error.log',
    out_file: '/var/www/negocio-admin/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    ignore_watch: ['node_modules', 'logs']
  }]
};
PM2

echo "PM2 CONFIG CREADO"

EOF

Write-Host "✓ PASO 5 COMPLETADO" -ForegroundColor Green

# RESUMEN
Write-Host "`n=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "`nVerificaciones:" -ForegroundColor Cyan

Write-Host "`n1. Base de Datos:"
ssh -i $SSH_KEY $VPS "psql -U negocio_admin_user -d negocio_admin_db -c 'SELECT NOW();'"

Write-Host "`n2. Directorios:"
ssh -i $SSH_KEY $VPS "ls -la /var/www/negocio-admin/"

Write-Host "`n3. Archivo .env:"
ssh -i $SSH_KEY $VPS "head -5 /var/www/negocio-admin/backend/.env"

Write-Host "`n4. Nginx:"
ssh -i $SSH_KEY $VPS "sudo nginx -t"

Write-Host "`n=== LISTO PARA DEPLOY ===" -ForegroundColor Green
Write-Host "`nProximos pasos:" -ForegroundColor Yellow
Write-Host "1. Sube tu codigo a GitHub"
Write-Host "2. Copia los archivos al VPS"
Write-Host "3. Ejecuta: npm install"
Write-Host "4. Inicia con PM2: pm2 start ecosystem.config.js"
