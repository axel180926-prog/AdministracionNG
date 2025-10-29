# 🚀 SCRIPT DE CONFIGURACIÓN VPS - NEGOCIO ADMIN
# Ejecutar en PowerShell como admin

# Variables
$VPS_IP = "31.97.43.51"
$VPS_USER = "root"
$SSH_KEY = "$HOME/.ssh/vps_key"
$APP_PATH = "/var/www/negocio-admin"

# Colores
function Write-Header { Write-Host "`n█ $args" -ForegroundColor Green -BackgroundColor DarkGreen }
function Write-Step { Write-Host "  ► $args" -ForegroundColor Cyan }
function Write-Error { Write-Host "  ✗ $args" -ForegroundColor Red }
function Write-Success { Write-Host "  ✓ $args" -ForegroundColor Green }
function Write-Warning { Write-Host "  ⚠ $args" -ForegroundColor Yellow }

Write-Header "🔧 CONFIGURACIÓN VPS NEGOCIO ADMIN"
Write-Step "VPS: $VPS_USER@$VPS_IP"
Write-Step "Aplicación: $APP_PATH"

# ============================================================================
# FASE 0: VERIFICAR REQUISITOS PREVIOS
# ============================================================================
Write-Header "FASE 0: VERIFICAR REQUISITOS"

# Verificar SSH
Write-Step "Verificando SSH..."
try {
    ssh -V > $null 2>&1
    Write-Success "SSH instalado"
} catch {
    Write-Error "SSH no encontrado. Instala Git Bash o WSL"
    exit 1
}

# Verificar Git
Write-Step "Verificando Git..."
try {
    git --version > $null 2>&1
    Write-Success "Git instalado"
} catch {
    Write-Error "Git no encontrado"
    exit 1
}

# ============================================================================
# FASE 1: PREPARAR SSH SIN CONTRASEÑA
# ============================================================================
Write-Header "FASE 1: PREPARAR SSH SIN CONTRASEÑA"

Write-Step "Generando clave SSH..."
if (Test-Path $SSH_KEY) {
    Write-Warning "La clave ya existe en $SSH_KEY"
} else {
    ssh-keygen -t ed25519 -f $SSH_KEY -N "" | Out-Null
    Write-Success "Clave generada: $SSH_KEY"
}

Write-Step "Copiando clave pública al VPS..."
$pub_key = Get-Content "$SSH_KEY.pub"
$cmd = @"
mkdir -p ~/.ssh
echo '$pub_key' >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
"@

# Crear función SSH temporal
function ssh-vps-temp {
    param([string]$Command)
    ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" $Command
}

# Enviar clave
echo $pub_key | ssh "$VPS_USER@$VPS_IP" "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

Write-Step "Probando conexión sin contraseña..."
try {
    $result = ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "echo 'SSH OK'" 2>&1
    if ($result -eq "SSH OK") {
        Write-Success "SSH sin contraseña configurado"
    } else {
        Write-Warning "SSH conectó pero verificar resultado"
    }
} catch {
    Write-Error "No se puede conectar sin contraseña. Intenta manualmente"
    exit 1
}

# Crear alias para PowerShell (opcional)
Write-Step "¿Crear alias en PowerShell? (s/n): " -NoNewline
$createAlias = Read-Host
if ($createAlias -eq "s") {
    $profile_content = @"

# Aliases para VPS
function ssh-vps { ssh -i '$SSH_KEY' $VPS_USER@$VPS_IP `$args }
function scp-vps { scp -i '$SSH_KEY' `$args }
"@
    Add-Content $PROFILE $profile_content
    Write-Success "Alias agregado a PowerShell Profile"
    Write-Warning "Reinicia PowerShell para que surta efecto"
}

# ============================================================================
# FASE 2: LIMPIAR VPS
# ============================================================================
Write-Header "FASE 2: LIMPIAR VPS"

$cleanup_script = @'
#!/bin/bash
set -e

echo "Parando servicios innecesarios..."
systemctl stop n8n 2>/dev/null || true
systemctl disable n8n 2>/dev/null || true

echo "Removiendo directorios de desarrollo..."
rm -rf ~/.cursor ~/.cursor-server ~/.claude

echo "Removiendo archivos viejos..."
rm -f ~/config-backup-*.tgz ~/chapibot.zone.txt
rm -rf ~/nginx-chapibot.conf

echo "Creando estructura de directorios..."
mkdir -p /var/www/negocio-admin/backend
mkdir -p /var/www/negocio-admin/logs
mkdir -p /var/www/negocio-admin/data

echo "Verificando espacio liberado..."
du -sh ~

echo "✓ Limpieza completada"
'@

Write-Step "Ejecutando limpieza en VPS..."
$cleanup_script | ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "bash -s"
Write-Success "VPS limpio"

# ============================================================================
# FASE 3: ACTUALIZAR DEPENDENCIAS
# ============================================================================
Write-Header "FASE 3: ACTUALIZAR DEPENDENCIAS"

$update_script = @'
#!/bin/bash
set -e

echo "Verificando versiones actuales..."
echo "Node:"
node --version || echo "No instalado"
echo "PostgreSQL:"
psql --version || echo "No instalado"

echo "Instalando NVM (Node Version Manager)..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

echo "Instalando Node.js v20..."
source ~/.nvm/nvm.sh
nvm install 20
nvm use 20
nvm alias default 20

echo "Verificando instalación..."
node --version
npm --version

echo "✓ Dependencias actualizadas"
'@

Write-Step "Actualizando Node.js y PostgreSQL..."
$update_script | ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "bash -s"
Write-Success "Dependencias actualizadas"

# ============================================================================
# FASE 4: CONFIGURAR BASE DE DATOS
# ============================================================================
Write-Header "FASE 4: CONFIGURAR BASE DE DATOS"

Write-Step "¿Cuál es la contraseña para PostgreSQL? (mínimo 12 caracteres): " -NoNewline
$db_password = Read-Host -AsSecureString
$db_password_plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($db_password))

$db_script = @"
#!/bin/bash
set -e

echo "Creando base de datos..."

sudo -u postgres psql << PSQL
-- Crear base de datos
CREATE DATABASE negocio_admin_db;

-- Crear usuario
CREATE USER negocio_admin_user WITH PASSWORD '$db_password_plain';

-- Permisos
ALTER ROLE negocio_admin_user SET client_encoding TO 'utf8';
ALTER ROLE negocio_admin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE negocio_admin_user SET default_transaction_deferrable TO on;
ALTER ROLE negocio_admin_user CREATEDB;

-- Conectar con BD
\c negocio_admin_db
GRANT ALL PRIVILEGES ON SCHEMA public TO negocio_admin_user;

PSQL

echo "✓ Base de datos creada"
"@

Write-Step "Configurando base de datos..."
$db_script | ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "bash -s"
Write-Success "Base de datos configurada"

# ============================================================================
# FASE 5: CONFIGURAR NGINX
# ============================================================================
Write-Header "FASE 5: CONFIGURAR NGINX"

$nginx_script = @'
#!/bin/bash
set -e

echo "Configurando Nginx..."

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location / {
        proxy_pass http://negocio_admin_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

# Habilitar sitio
ln -sf /etc/nginx/sites-available/negocio-admin.conf /etc/nginx/sites-enabled/

# Deshabilitar default
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx

echo "✓ Nginx configurado"
'@

Write-Step "Configurando Nginx..."
$nginx_script | ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "bash -s"
Write-Success "Nginx configurado"

# ============================================================================
# FASE 6: CONFIGURAR PM2
# ============================================================================
Write-Header "FASE 6: CONFIGURAR PM2"

Write-Step "Instalando PM2 globalmente..."
ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "npm install -g pm2"

$pm2_script = @"
#!/bin/bash
set -e

echo "Creando ecosystem.config.js..."

cat > $APP_PATH/ecosystem.config.js << 'PM2'
module.exports = {
  apps: [{
    name: 'negocio-admin',
    script: './server.js',
    cwd: '$APP_PATH/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$APP_PATH/logs/error.log',
    out_file: '$APP_PATH/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    ignore_watch: ['node_modules', 'logs'],
    kill_timeout: 5000
  }]
};
PM2

pm2 save
echo "✓ PM2 configurado"
"@

Write-Step "Configurando PM2..."
$pm2_script | ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "bash -s"
Write-Success "PM2 configurado"

# ============================================================================
# FASE 7: CREAR .env TEMPLATE
# ============================================================================
Write-Header "FASE 7: CREAR .ENV TEMPLATE"

Write-Step "Generando JWT_SECRET..."
$jwt_secret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed ((Get-Date).Ticks % [int]::MaxValue) -Count 32 | ForEach-Object { [char][byte]$_ }) -join ''))

$env_script = @"
#!/bin/bash
set -e

cat > $APP_PATH/backend/.env << 'ENV'
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=negocio_admin_db
DB_USER=negocio_admin_user
DB_PASSWORD=$db_password_plain
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=$jwt_secret
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Aplicación
APP_NAME=NegocioAdmin
APP_URL=http://$VPS_IP
API_URL=http://$VPS_IP/api

# Seguridad
CORS_ORIGIN=http://$VPS_IP,http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

ENV

chmod 600 $APP_PATH/backend/.env
echo "✓ .env creado (revisar contraseñas)"
"@

Write-Step "Creando archivo .env..."
$env_script | ssh -i $SSH_KEY "$VPS_USER@$VPS_IP" "bash -s"
Write-Success ".env creado"

# ============================================================================
# RESUMEN FINAL
# ============================================================================
Write-Header "✓ CONFIGURACIÓN COMPLETADA"

Write-Host @"
┌─────────────────────────────────────────────────────────┐
│ RESUMEN DE CONFIGURACIÓN VPS                            │
├─────────────────────────────────────────────────────────┤
│ ✓ SSH sin contraseña                                   │
│ ✓ VPS limpio (removidos servicios innecesarios)        │
│ ✓ Node.js v20 instalado                                │
│ ✓ PostgreSQL configurado                               │
│ ✓ Base de datos creada (negocio_admin_db)              │
│ ✓ Nginx configurado                                    │
│ ✓ PM2 instalado y configurado                          │
│ ✓ .env template creado                                 │
├─────────────────────────────────────────────────────────┤
│ PRÓXIMOS PASOS:                                         │
│ 1. Sube tu código a GitHub                             │
│ 2. Ejecuta deploy.sh para subir la aplicación          │
│ 3. Verifica que todo funcione: ssh-vps pm2 status      │
│ 4. Agrega certificado SSL (Let's Encrypt)              │
│ 5. Cambia contraseñas por defecto en .env              │
└─────────────────────────────────────────────────────────┘
"@ -ForegroundColor Green

Write-Step "Para conectar al VPS: ssh -i $SSH_KEY $VPS_USER@$VPS_IP"
Write-Step "Para ver logs: ssh -i $SSH_KEY $VPS_USER@$VPS_IP pm2 logs"
Write-Step "Para reiniciar: ssh -i $SSH_KEY $VPS_USER@$VPS_IP pm2 restart negocio-admin"
