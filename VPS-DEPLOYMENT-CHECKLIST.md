# 📋 CHECKLIST DE DESPLIEGUE EN VPS

Este documento contiene todo lo que necesitas revisar antes de desplegar tu aplicación en el VPS de Hostinger.

---

## 🔴 FASE 1: PREPARACIÓN LOCAL (ANTES DE SUBIR A VPS)

### 1.1 Validar Backend

- [ ] **Node.js instalado**: `node --version` debe mostrar v20+
- [ ] **npm actualizado**: `npm --version` 
- [ ] **Dependencias backend instaladas**: `cd backend && npm install`
- [ ] **Variables de entorno configuradas**: 
  ```bash
  cp backend/.env.example backend/.env
  # Editar backend/.env con valores correctos
  ```
- [ ] **Base de datos local funcionando** (si pruebas localmente)
- [ ] **Servidor arranca sin errores**: `npm run dev`
- [ ] **Prueba endpoint health**: `curl http://localhost:3000/api/health`

### 1.2 Validar Rutas Existentes

Las siguientes rutas YA EXISTEN y están funcionales:

- [ ] **auth.js** (✅ Completo)
  - `POST /api/auth/register` - Registro de usuarios
  - `POST /api/auth/login` - Inicio de sesión
  - `POST /api/auth/refresh` - Renovar token

- [ ] **config.js** (✅ Completo)
  - `GET /api/config/business-config` - Obtener configuración del negocio
  - `GET /api/config/business-types` - Listar tipos de negocio
  - `POST /api/config/toggle-module` - Cambiar módulo
  - `PUT /api/config/business-settings` - Actualizar configuración

- [ ] **products.js** (📝 Revisar si existe)
- [ ] **sales.js** (📝 Revisar si existe)
- [ ] **reports.js** (📝 Revisar si existe)
- [ ] **users.js** (📝 Revisar si existe)

### 1.3 Revisar Configuración de Seguridad

- [ ] **JWT_SECRET**: No usar el valor por defecto
  ```bash
  # Generar secreto seguro
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **JWT_REFRESH_SECRET**: También debe ser único y seguro

- [ ] **BASE_URL**: Apunta a tu dominio real (ej: `https://tudominio.com`)

- [ ] **NODE_ENV**: En VPS debe ser `production`

- [ ] **DB_PASSWORD**: Contraseña fuerte para PostgreSQL (mínimo 16 caracteres)

- [ ] **CORS habilitado correctamente**: Revisar que `cors()` incluya tu dominio

### 1.4 Revisar Configuración de Base de Datos

En `backend/config/database.js`:

- [ ] **DB_HOST**: Correcto para tu VPS
- [ ] **DB_PORT**: 5432 (PostgreSQL estándar) o 5433 si lo configuraste así
- [ ] **DB_NAME**: `business_db` (o tu nombre personalizado)
- [ ] **Pool de conexiones**: max: 20 es razonable para empezar

### 1.5 Revisar Archivo .gitignore

- [ ] **`.env` está en .gitignore** (NO subir variables de entorno)
- [ ] **`node_modules/` está en .gitignore**
- [ ] **`logs/` está en .gitignore** (si los generas)

---

## 🟡 FASE 2: INFRAESTRUCTURA DEL VPS

### 2.1 Verificar Acceso SSH

```bash
# En PowerShell
ssh usuario@tu-ip-vps
# Debería conectarse sin problemas
```

- [ ] **SSH conecta correctamente**
- [ ] **Usuario tiene permisos sudo**
- [ ] **Key-based auth configurado** (recomendado)

### 2.2 Verificar Node.js en VPS

```bash
ssh usuario@tu-ip-vps
node --version
npm --version
```

- [ ] **Node.js v20+** instalado
- [ ] **npm** funciona correctamente

### 2.3 Verificar PostgreSQL en VPS

```bash
ssh usuario@tu-ip-vps
sudo systemctl status postgresql
```

- [ ] **PostgreSQL está corriendo**
- [ ] **PostgreSQL inicia automáticamente** (enable): 
  ```bash
  sudo systemctl enable postgresql
  ```

### 2.4 Crear Base de Datos en VPS

```bash
ssh usuario@tu-ip-vps

# Conectar a PostgreSQL
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE business_db;
CREATE USER tu_usuario WITH ENCRYPTED PASSWORD 'tu_password_fuerte';
GRANT ALL PRIVILEGES ON DATABASE business_db TO tu_usuario;
\q
```

- [ ] **Base de datos `business_db` creada**
- [ ] **Usuario con permisos en la BD**
- [ ] **Contraseña configurada correctamente**

### 2.5 Crear Esquema de BD

```bash
ssh usuario@tu-ip-vps
cd ~/business-api/backend
psql -U tu_usuario -d business_db -f database/schema.sql
psql -U tu_usuario -d business_db -f database/seed.sql
```

- [ ] **Esquema cargado exitosamente** (18 tablas)
- [ ] **Datos iniciales cargados** (tipos de negocio, módulos)
- [ ] **Verificar tablas**: 
  ```bash
  psql -U tu_usuario -d business_db -c "\dt"
  ```

### 2.6 Instalar PM2 (Gestor de Procesos)

```bash
ssh usuario@tu-ip-vps
sudo npm install -g pm2
```

- [ ] **PM2 instalado globalmente**
- [ ] **PM2 disponible en PATH**

### 2.7 Verificar Nginx

```bash
ssh usuario@tu-ip-vps
sudo systemctl status nginx
```

- [ ] **Nginx está corriendo**
- [ ] **Nginx inicia automáticamente**:
  ```bash
  sudo systemctl enable nginx
  ```

---

## 🟢 FASE 3: DESPLEGAR APLICACIÓN

### 3.1 Clonar Repositorio en VPS

```bash
ssh usuario@tu-ip-vps
cd ~
git clone https://tu-repo-github.git business-api
cd business-api/backend
```

- [ ] **Repositorio clonado correctamente**
- [ ] **Todos los archivos presentes**
- [ ] **`.git` está presente** (permite hacer `git pull` después)

### 3.2 Instalar Dependencias

```bash
ssh usuario@tu-ip-vps
cd ~/business-api/backend
npm install --production
```

- [ ] **npm install completa sin errores**
- [ ] **`node_modules/` creado correctamente**
- [ ] **No hay warnings críticos**

### 3.3 Crear Archivo .env en VPS

```bash
ssh usuario@tu-ip-vps
cd ~/business-api/backend
nano .env
```

Copiar contenido (CAMBIAR VALORES):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://tu-dominio.com

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password_fuerte
DB_NAME=business_db
DB_PORT=5432

JWT_SECRET=tu_clave_secreta_segura_muy_larga_2025
JWT_REFRESH_SECRET=tu_refresh_secret_seguro_2025
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

- [ ] **Variables de entorno completas**
- [ ] **BASE_URL apunta a tu dominio**
- [ ] **DB_PASSWORD es fuerte**
- [ ] **JWT_SECRET es único y seguro**
- [ ] **NODE_ENV es `production`**

### 3.4 Probar Servidor Antes de PM2

```bash
ssh usuario@tu-ip-vps
cd ~/business-api/backend
npm start
# Debería ver: "🚀 Servidor corriendo en puerto 3000"
# Presionar Ctrl+C para salir
```

- [ ] **Servidor inicia sin errores**
- [ ] **No hay errores de conexión a BD**
- [ ] **Mensajes de inicio se muestran correctamente**

### 3.5 Iniciar con PM2

```bash
ssh usuario@tu-ip-vps
cd ~/business-api/backend
pm2 start server.js --name "business-api"
pm2 startup
pm2 save
```

- [ ] **PM2 inicia el servidor**
- [ ] **`pm2 status` muestra el servidor activo**
- [ ] **PM2 startup configurado** (reinicia automáticamente)
- [ ] **PM2 guardado para persistencia**

### 3.6 Verificar Logs

```bash
ssh usuario@tu-ip-vps
pm2 logs business-api
# Debería ver logs sin errores críticos
```

- [ ] **Logs no muestran errores**
- [ ] **Conexión a BD exitosa**
- [ ] **Server escuchando en puerto 3000**

---

## 🔵 FASE 4: NGINX COMO PROXY REVERSO

### 4.1 Configurar Nginx

```bash
ssh usuario@tu-ip-vps
sudo nano /etc/nginx/sites-available/default
```

Reemplazar con (CAMBIAR `tu-dominio.com`):
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- [ ] **Archivo editado correctamente**
- [ ] **Dominio puesto en place of `tu-dominio.com`**

### 4.2 Probar Configuración Nginx

```bash
ssh usuario@tu-ip-vps
sudo nginx -t
# Debería mostrar: "nginx: configuration file test is successful"
```

- [ ] **Sintaxis de Nginx correcta**
- [ ] **Sin errores de configuración**

### 4.3 Recargar Nginx

```bash
ssh usuario@tu-ip-vps
sudo systemctl restart nginx
```

- [ ] **Nginx reinicia sin errores**
- [ ] **Nginx sigue corriendo**: `sudo systemctl status nginx`

---

## 🟣 FASE 5: SSL/TLS (HTTPS)

### 5.1 Instalar Certbot

```bash
ssh usuario@tu-ip-vps
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

- [ ] **Certbot instalado**
- [ ] **Plugin de Nginx disponible**

### 5.2 Generar Certificado SSL

```bash
ssh usuario@tu-ip-vps
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
# Seguir prompts, aceptar términos, etc.
```

- [ ] **Certificado SSL generado**
- [ ] **Auto-renovación configurada**
- [ ] **HTTPS funcionando**: `https://tu-dominio.com`

### 5.3 Verificar Certificado

```bash
# En tu navegador o:
curl https://tu-dominio.com/api/health
```

- [ ] **HTTPS responde correctamente**
- [ ] **No hay warnings de certificado**
- [ ] **Certificado válido por 90 días** (se renueva automáticamente)

---

## 🟠 FASE 6: TESTING Y VALIDACIÓN

### 6.1 Probar Endpoints Públicos

```bash
# Health check
curl https://tu-dominio.com/api/health

# Version info
curl https://tu-dominio.com/api/version

# Business types (no requiere auth)
curl https://tu-dominio.com/api/config/business-types
```

- [ ] **`/api/health` retorna status OK**
- [ ] **`/api/version` retorna versión correcta**
- [ ] **`/api/config/business-types` retorna tipos**

### 6.2 Probar Autenticación

```bash
# Registro (obtener token)
curl -X POST https://tu-dominio.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!","fullName":"Test"}'

# Login
curl -X POST https://tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}'
```

- [ ] **Registro funciona**
- [ ] **Login retorna tokens**
- [ ] **Token tiene formato JWT**

### 6.3 Probar Endpoint Protegido

```bash
# Reemplazar {TOKEN} con el token real obtenido
curl https://tu-dominio.com/api/config/business-config \
  -H "Authorization: Bearer {TOKEN}"
```

- [ ] **Endpoint protegido requiere token**
- [ ] **Con token válido, retorna configuración**
- [ ] **Sin token, retorna error 401**

### 6.4 Revisar Logs en VPS

```bash
ssh usuario@tu-ip-vps
pm2 logs business-api --lines 50
```

- [ ] **Sin errores de conexión a BD**
- [ ] **Requests se ven en logs**
- [ ] **Sin excepciones no capturadas**

---

## 🔴 FASE 7: MONITOREO Y MANTENIMIENTO

### 7.1 Configurar Rotación de Logs

```bash
ssh usuario@tu-ip-vps
pm2 install pm2-logrotate
pm2 save
```

- [ ] **pm2-logrotate instalado**
- [ ] **Logs no se descontrolan en tamaño**

### 7.2 Monitoreo Básico

```bash
ssh usuario@tu-ip-vps
pm2 monit
```

- [ ] **CPU normal** (< 50%)
- [ ] **Memoria normal** (< 200MB inicialmente)
- [ ] **Proceso activo y sin restarts**

### 7.3 Actualizar Aplicación

Cuando hagas cambios:
```bash
ssh usuario@tu-ip-vps
cd ~/business-api
git pull origin main
cd backend
npm install --production
pm2 restart business-api
pm2 save
```

- [ ] **Script de actualización funciona**
- [ ] **Cambios se reflejan sin downtime**

### 7.4 Backups de BD

```bash
ssh usuario@tu-ip-vps

# Backup manual
pg_dump -U tu_usuario -d business_db > ~/backups/backup_$(date +%Y%m%d).sql

# O usar script automático (próximas fases)
```

- [ ] **Backup de BD realizado**
- [ ] **Archivos guardados en lugar seguro**

---

## ✅ CHECKLIST FINAL

Antes de considerar producción lista:

- [ ] **API responde en dominio HTTPS**
- [ ] **Auth funciona (register/login/refresh)**
- [ ] **Endpoints protegidos requieren token**
- [ ] **BD tiene datos iniciales**
- [ ] **PM2 auto-reinicia si falla**
- [ ] **Nginx redirige HTTP → HTTPS**
- [ ] **SSL válido por 90+ días**
- [ ] **Logs limpios sin errores**
- [ ] **Base de datos optimizada** (índices presentes)
- [ ] **Variables de entorno seguras**

---

## 📱 SIGUIENTE PASO: FRONTEND

Una vez que el backend esté en producción:

1. **Configurar URL en Frontend**: 
   ```javascript
   // frontend/services/api.js
   const BASE_URL = 'https://tu-dominio.com/api';
   ```

2. **Compilar APK con Expo**:
   ```bash
   cd frontend
   eas build --platform android
   ```

3. **Usuarios descargan desde Play Store o link directo**

---

## 🆘 TROUBLESHOOTING

### Error: "ECONNREFUSED" en BD
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Error: "Port 3000 already in use"
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000
# Matar el proceso
sudo kill -9 <PID>
```

### Nginx no redirige HTTPS
```bash
sudo nginx -t
sudo systemctl reload nginx
# Verificar certificado Certbot
sudo certbot renew --dry-run
```

### PM2 no reinicia automáticamente
```bash
pm2 startup
pm2 save
sudo systemctl status pm2-root
```

### BD sin datos iniciales
```bash
psql -U tu_usuario -d business_db -f ~/business-api/backend/database/schema.sql
psql -U tu_usuario -d business_db -f ~/business-api/backend/database/seed.sql
```

---

**Versión**: 1.0.0  
**Última actualización**: 2025-10-29  
**Estado**: Listo para producción
