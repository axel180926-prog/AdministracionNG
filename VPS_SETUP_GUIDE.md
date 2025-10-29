# 🚀 GUÍA DE CONFIGURACIÓN VPS HOSTINGER

**VPS**: root@31.97.43.51 (Ubuntu 24.04.3 LTS)

---

## 📊 ESTADO ACTUAL DEL VPS (Actualizado)

### ✅ YA INSTALADO
- ✅ Node.js (cualquier versión)
- ✅ PostgreSQL (historial de MySQL sugiere experiencia BD)
- ✅ PM2 (gestor de procesos)
- ✅ Docker (carpeta .docker existe)
- ✅ Git (archivo .gitconfig existe)
- ✅ Nginx (archivo nginx-chapibot.conf)
- ✅ n8n (automatización)
- ✅ MongoDB (carpeta .mongodb)

### ⚠️ REVISAR/ACTUALIZAR
- ⏳ Node.js - Verificar versión (recomendado v18+ o v20)
- ⏳ PostgreSQL - Verificar versión (recomendado v14+)
- ⏳ PM2 - Verificar si está configurado
- ⏳ Nginx - Hacer backup de config actual

### 🔴 LIMPIAR/REMOVER
- ❌ MongoDB - No necesario (usamos PostgreSQL)
- ❌ n8n - No es parte del proyecto
- ❌ .cursor/.cursor-server - Editores no necesarios
- ❌ nginx-chapibot.conf - Vieja configuración
- ❌ config-backup-*.tgz - Backups viejos (198MB)

---

## 🛠️ CHECKLIST DE CONFIGURACIÓN VPS

### FASE 1: PREPARACIÓN (SSH + Dependencias)

**1. Configurar SSH sin contraseña**
```bash
# En tu máquina local (PowerShell)
ssh-keygen -t ed25519 -f $HOME/.ssh/vps_key -N ""
cat $HOME/.ssh/vps_key.pub | ssh root@31.97.43.51 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**2. Crear alias en PowerShell** (opcional pero recomendado)
```powershell
# Agregar a tu $PROFILE de PowerShell:
function ssh-vps { ssh -i $HOME/.ssh/vps_key root@31.97.43.51 $args }
function scp-vps { scp -i $HOME/.ssh/vps_key $args }
```

**3. Verificar versiones instaladas**
```bash
ssh root@31.97.43.51 "node --version && npm --version && psql --version && pm2 --version && nginx -v"
```

---

### FASE 2: LIMPIAR EL VPS

**Remover lo que no necesitamos:**

```bash
ssh root@31.97.43.51 << 'EOF'

# 1. Parar servicios que no necesitamos
systemctl stop n8n 2>/dev/null || true
systemctl disable n8n 2>/dev/null || true

# 2. Remover directorios de desarrollo innecesarios
rm -rf ~/.cursor ~/.cursor-server ~/.claude

# 3. Remover archivos viejos
rm -f ~/config-backup-*.tgz ~/chapibot.zone.txt
rm -f ~/nginx-chapibot.conf/*.conf

# 4. Crear estructura para el proyecto
mkdir -p /var/www/negocio-admin/backend
mkdir -p /var/www/negocio-admin/logs
mkdir -p /var/www/negocio-admin/data

# 5. Verificar espacio liberado
du -sh ~
echo "✅ Limpieza completada"

EOF
```

---

### FASE 3: ACTUALIZAR DEPENDENCIAS

**Node.js (usar NVM para fácil actualización)**
```bash
ssh root@31.97.43.51 << 'EOF'

# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version  # v20.x.x
npm --version   # 10.x.x

EOF
```

**PostgreSQL (si no está en v14+)**
```bash
ssh root@31.97.43.51 << 'EOF'

psql --version

# Si está en versión vieja, considerar upgrade:
# apt update && apt upgrade postgresql-client postgresql

EOF
```

---

### FASE 4: CONFIGURAR BASE DE DATOS

**Crear BD y usuario para el proyecto:**

```bash
ssh root@31.97.43.51 << 'EOF'

sudo -u postgres psql << PSQL
-- Crear base de datos
CREATE DATABASE negocio_admin_db;

-- Crear usuario
CREATE USER negocio_admin_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';

-- Permisos
ALTER ROLE negocio_admin_user SET client_encoding TO 'utf8';
ALTER ROLE negocio_admin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE negocio_admin_user SET default_transaction_deferrable TO on;
ALTER ROLE negocio_admin_user CREATEDB;

-- Conectar con BD
\c negocio_admin_db
GRANT ALL PRIVILEGES ON SCHEMA public TO negocio_admin_user;

PSQL

echo "✅ Base de datos creada"

EOF
```

---

### FASE 5: CONFIGURAR NGINX

**Crear configuración para el proyecto:**

```bash
ssh root@31.97.43.51 << 'EOF'

cat > /etc/nginx/sites-available/negocio-admin.conf << NGINX
upstream negocio_admin_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name _;
    
    # Redirect a 443 cuando tengas SSL
    # return 301 https://\$server_name\$request_uri;
    
    client_max_body_size 10M;
    
    location /api/ {
        proxy_pass http://negocio_admin_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location / {
        proxy_pass http://negocio_admin_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
NGINX

# Habilitar sitio
ln -sf /etc/nginx/sites-available/negocio-admin.conf /etc/nginx/sites-enabled/

# Deshabilitar default si existe
rm -f /etc/nginx/sites-enabled/default

# Probar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx

echo "✅ Nginx configurado"

EOF
```

---

### FASE 6: CONFIGURAR PM2

**Crear ecosystem.config.js en el VPS:**

```bash
ssh root@31.97.43.51 << 'EOF'

cat > /var/www/negocio-admin/ecosystem.config.js << PM2
module.exports = {
  apps: [{
    name: 'negocio-admin',
    script: './server.js',
    cwd: '/var/www/negocio-admin/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'negocio_admin_db',
      DB_USER: 'negocio_admin_user',
      DB_PASSWORD: 'CHANGE_THIS_PASSWORD',
      JWT_SECRET: 'CHANGE_THIS_SECRET_KEY'
    },
    error_file: '/var/www/negocio-admin/logs/error.log',
    out_file: '/var/www/negocio-admin/logs/out.log',
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

echo "✅ PM2 configurado"

EOF
```

---

### FASE 7: CONFIGURAR .env EN VPS

```bash
ssh root@31.97.43.51 << 'EOF'

cat > /var/www/negocio-admin/backend/.env << ENV
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=negocio_admin_db
DB_USER=negocio_admin_user
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=CHANGE_THIS_SECRET_KEY_MIN_32_CHARS
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# Aplicación
APP_NAME=NegocioAdmin
APP_URL=http://31.97.43.51
API_URL=http://31.97.43.51/api

# Seguridad
CORS_ORIGIN=http://31.97.43.51,http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Email (opcional, agregar después)
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=

ENV

chmod 600 /var/www/negocio-admin/backend/.env
echo "✅ .env configurado (CAMBIAR CONTRASEÑAS DESPUÉS)"

EOF
```

---

## 📋 CHECKLIST DE CONFIGURACIÓN

### Antes de subir tu aplicación

- [ ] **SSH sin contraseña configurado**
  ```bash
  ssh root@31.97.43.51 echo "SSH OK"
  ```

- [ ] **Versiones correctas**
  ```bash
  ssh root@31.97.43.51 "node --version && psql --version"
  ```
  - Node.js: v18+ (mejor v20)
  - PostgreSQL: v14+

- [ ] **Base de datos creada**
  ```bash
  ssh root@31.97.43.51 "sudo -u postgres psql -l | grep negocio"
  ```

- [ ] **Directorios creados**
  ```bash
  ssh root@31.97.43.51 "ls -la /var/www/negocio-admin/"
  ```

- [ ] **Nginx configurado**
  ```bash
  ssh root@31.97.43.51 "nginx -t"
  ```

- [ ] **.env configurado**
  ```bash
  ssh root@31.97.43.51 "cat /var/www/negocio-admin/backend/.env | head -5"
  ```

- [ ] **PM2 instalado globalmente**
  ```bash
  ssh root@31.97.43.51 "npm list -g pm2"
  ```

---

## 🚀 DEPLOY SCRIPT (Cuando esté todo listo)

Crea este archivo en tu local: `deploy.sh`

```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

VPS="root@31.97.43.51"
APP_PATH="/var/www/negocio-admin/backend"

# 1. Copiar archivos
echo "📁 Copiando archivos..."
scp -r backend/* $VPS:$APP_PATH/

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
ssh $VPS "cd $APP_PATH && npm ci --production"

# 3. Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
ssh $VPS "cd $APP_PATH && node scripts/migrate.js"

# 4. Iniciar/Reiniciar con PM2
echo "▶️ Iniciando aplicación..."
ssh $VPS "cd $APP_PATH && pm2 restart negocio-admin || pm2 start ecosystem.config.js"

# 5. Hacer backup de PM2
echo "💾 Guardando configuración PM2..."
ssh $VPS "pm2 save"

echo "✅ Deploy completado"
```

---

## 🔐 SEGURIDAD - CAMBIAR DESPUÉS DE DEPLOY

**En el VPS, después de subir la app:**

```bash
# 1. Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Cambiar contraseña PostgreSQL
ssh root@31.97.43.51 "sudo -u postgres psql -c \"ALTER USER negocio_admin_user PASSWORD 'NEW_SECURE_PASSWORD';\""

# 3. Actualizar .env con nuevos valores
ssh root@31.97.43.51 "nano /var/www/negocio-admin/backend/.env"

# 4. Reinstanciar PM2
ssh root@31.97.43.51 "pm2 restart negocio-admin"
```

---

## 📞 TROUBLESHOOTING

### "Connection refused" en 3000
```bash
ssh root@31.97.43.51 "pm2 logs negocio-admin | tail -50"
```

### Nginx devuelve 502
```bash
ssh root@31.97.43.51 "sudo tail -50 /var/log/nginx/error.log"
```

### PostgreSQL no responde
```bash
ssh root@31.97.43.51 "sudo systemctl status postgresql"
```

### Revisar espacio en disco
```bash
ssh root@31.97.43.51 "df -h"
```

---

## 📞 PRÓXIMOS PASOS

1. ✅ Configura SSH sin contraseña
2. ✅ Ejecuta los scripts de FASE 1 a FASE 7
3. ✅ Verifica el checklist
4. ✅ Sube tu código a GitHub
5. ✅ Ejecuta el deploy script
6. ✅ Cambia las contraseñas por defecto
7. ✅ Agrega un certificado SSL (Let's Encrypt)

---

**Última actualización**: 2025-10-29 13:35 UTC
**VPS**: root@31.97.43.51 | Ubuntu 24.04.3 LTS
**Estado**: ✅ Listo para configurar
