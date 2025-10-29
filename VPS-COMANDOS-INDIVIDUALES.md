# VPS COMANDOS - COPIA Y PEGA UNO A UNO

**Contraseña BD**: R@mmstein180926 (ya integrada)

---

## PASO 1: Configurar PostgreSQL

Copia y pega TODO esto en PowerShell:

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 @"
sudo -u postgres psql -c "CREATE DATABASE negocio_admin_db;"
sudo -u postgres psql -c "CREATE USER negocio_admin_user WITH PASSWORD 'R@mmstein180926';"
sudo -u postgres psql -c "ALTER ROLE negocio_admin_user SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE negocio_admin_user SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE negocio_admin_user CREATEDB;"
sudo -u postgres psql -d negocio_admin_db -c "GRANT ALL PRIVILEGES ON SCHEMA public TO negocio_admin_user;"
echo 'BASE DE DATOS CREADA'
"@
```

Presiona Enter. Debe decir `BASE DE DATOS CREADA`.

---

## PASO 2: Crear directorios

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 @"
mkdir -p /var/www/negocio-admin/backend
mkdir -p /var/www/negocio-admin/logs
mkdir -p /var/www/negocio-admin/data
ls -la /var/www/negocio-admin/
echo 'DIRECTORIOS CREADOS'
"@
```

Presiona Enter.

---

## PASO 3: Crear archivo .env

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 @"
cat > /var/www/negocio-admin/backend/.env << 'ENV'
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

DB_HOST=localhost
DB_PORT=5432
DB_NAME=negocio_admin_db
DB_USER=negocio_admin_user
DB_PASSWORD=R@mmstein180926
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

APP_NAME=NegocioAdmin
APP_URL=http://31.97.43.51
API_URL=http://31.97.43.51/api

CORS_ORIGIN=http://31.97.43.51,http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

ENV

chmod 600 /var/www/negocio-admin/backend/.env
echo 'ARCHIVO .env CREADO'
"@
```

Presiona Enter.

---

## PASO 4: Configurar Nginx

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 @"
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

sudo ln -sf /etc/nginx/sites-available/negocio-admin.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
echo 'NGINX CONFIGURADO'
"@
```

Presiona Enter.

---

## PASO 5: Configurar PM2

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 @"
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

echo 'PM2 CONFIG CREADO'
"@
```

Presiona Enter.

---

## VERIFICACIONES (Opcional)

### Verificar PostgreSQL
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "psql -U negocio_admin_user -d negocio_admin_db -c 'SELECT NOW();'"
```

### Verificar directorios
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "ls -la /var/www/negocio-admin/"
```

### Verificar .env
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "head -10 /var/www/negocio-admin/backend/.env"
```

### Verificar Nginx
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "sudo nginx -t"
```

---

## RESUMEN

**Estado después de completar todos los pasos:**

- ✓ PostgreSQL configurado
- ✓ Base de datos creada
- ✓ Usuario BD: negocio_admin_user
- ✓ Contraseña: R@mmstein180926
- ✓ Directorios en /var/www/negocio-admin/
- ✓ Archivo .env con todas las variables
- ✓ Nginx configurado como reverse proxy
- ✓ PM2 config listo

**Listo para:** Subir código y ejecutar `pm2 start ecosystem.config.js`
