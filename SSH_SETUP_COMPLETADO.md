# SSH SETUP COMPLETADO - FASE 0

**Fecha**: 2025-10-29 14:36 UTC
**Estado**: COMPLETADO
**VPS**: root@31.97.43.51

---

## QUE HICIMOS

### Paso 1: Generar clave SSH ed25519
```powershell
ssh-keygen -t ed25519 -f $HOME\.ssh\vps_key -N '""'
```

**Resultado**:
- Clave privada: `C:\Users\jovan\.ssh\vps_key`
- Clave pública: `C:\Users\jovan\.ssh\vps_key.pub`
- Fingerprint: SHA256:+8EKRd26JYH5p+OVCq1cYw7ePFbM5Y+3prIcBjphf+k

### Paso 2: Copiar clave pública al VPS
```powershell
$pubkey = Get-Content "$HOME\.ssh\vps_key.pub"; $pubkey | ssh root@31.97.43.51 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Resultado**:
- Clave pública añadida a `~/.ssh/authorized_keys` en el VPS
- Permisos configurados correctamente

### Paso 3: Probar SSH sin contraseña
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "echo 'SSH OK'"
```

**Resultado**: ✓ SSH OK

---

## ESTADO ACTUAL

### SSH
- ✓ Clave privada generada
- ✓ Clave pública en VPS
- ✓ Conexión sin contraseña funcionando
- ✓ Fingerprint verificado

### VPS
- ✓ Accesible por SSH sin contraseña
- ✓ Node.js v20.19.5 instalado
- ✓ PostgreSQL 16.10 instalado
- ✓ PM2 disponible
- ✓ Nginx disponible

---

## PROXIMOS PASOS

### PASO 1: Configurar Base de Datos PostgreSQL

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 << 'EOF'

sudo -u postgres psql << 'PSQL'
CREATE DATABASE negocio_admin_db;
CREATE USER negocio_admin_user WITH PASSWORD 'TuContraseñaSegura123!';
ALTER ROLE negocio_admin_user SET client_encoding TO 'utf8';
ALTER ROLE negocio_admin_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE negocio_admin_user CREATEDB;

\c negocio_admin_db
GRANT ALL PRIVILEGES ON SCHEMA public TO negocio_admin_user;

PSQL

echo "BASE DE DATOS CREADA"

EOF
```

**Nota**: Cambia `TuContraseñaSegura123!` por una contraseña real (mínimo 12 caracteres).

---

### PASO 2: Crear directorios para la aplicación

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 << 'EOF'

mkdir -p /var/www/negocio-admin/backend
mkdir -p /var/www/negocio-admin/logs
mkdir -p /var/www/negocio-admin/data

ls -la /var/www/negocio-admin/

EOF
```

---

### PASO 3: Crear archivo .env en VPS

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 << 'EOF'

cat > /var/www/negocio-admin/backend/.env << 'ENV'
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=negocio_admin_db
DB_USER=negocio_admin_user
DB_PASSWORD=TuContraseñaSegura123!
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT
JWT_SECRET=tu_secreto_jwt_de_32_caracteres_minimo
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
```

---

### PASO 4: Configurar Nginx

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 << 'EOF'

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

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/negocio-admin.conf /etc/nginx/sites-enabled/

# Probar configuracion
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx

echo "NGINX CONFIGURADO"

EOF
```

---

### PASO 5: Crear PM2 ecosystem config

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 << 'EOF'

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
```

---

## ORDEN DE EJECUCION

**Para completar la configuración del VPS, ejecuta en PowerShell EN ESTE ORDEN**:

1. Paso 1: Base de datos
2. Paso 2: Directorios
3. Paso 3: .env
4. Paso 4: Nginx
5. Paso 5: PM2

Cada paso debe completarse correctamente antes de pasar al siguiente.

---

## COMANDOS UTILES PARA VERIFICAR

### Ver estado de PostgreSQL
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "psql -U negocio_admin_user -d negocio_admin_db -c 'SELECT NOW();'"
```

### Ver directorios creados
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "ls -la /var/www/negocio-admin/"
```

### Ver configuracion Nginx
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "sudo nginx -t"
```

### Ver PM2 ecosystem
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "cat /var/www/negocio-admin/ecosystem.config.js"
```

---

## INFORMACION IMPORTANTE

### Ubicacion de archivos SSH
```
Clave privada:  C:\Users\jovan\.ssh\vps_key
Clave publica:  C:\Users\jovan\.ssh\vps_key.pub
```

### Conexion al VPS
```powershell
# Comando base para todas las conexiones
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51
```

### Base de datos
- Usuario: `negocio_admin_user`
- BD: `negocio_admin_db`
- Host: `localhost:5432`
- Contraseña: (la que configuraste)

### Rutas en VPS
```
/var/www/negocio-admin/backend/    - Código de la aplicación
/var/www/negocio-admin/logs/       - Logs
/var/www/negocio-admin/.env        - Variables de entorno
```

---

## RESUMEN

### Completado
- ✓ SSH sin contraseña configurado
- ✓ Clave ed25519 generada
- ✓ Acceso al VPS verificado

### Pendiente
- [ ] Configurar PostgreSQL
- [ ] Crear directorios
- [ ] Crear .env
- [ ] Configurar Nginx
- [ ] Configurar PM2
- [ ] Subir código a GitHub
- [ ] Deploy de aplicación

---

**Creado**: 2025-10-29 14:36 UTC
**Estado**: SSH SETUP COMPLETADO
**Proximo**: Ejecutar los 5 pasos de configuracion VPS
