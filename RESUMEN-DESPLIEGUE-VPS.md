# 🚀 RESUMEN RÁPIDO - DESPLIEGUE EN VPS

Si quieres ver tu aplicación en el VPS HOY, aquí está lo CRÍTICO que debes revisar:

---

## ⚡ CHECKLIST EN 15 MINUTOS

### 1️⃣ LOCAL (Tu PC - Windows)

```powershell
# Verificar Node.js
node --version        # Debe ser v20+
npm --version

# Instalar dependencias del backend
cd C:\Users\jovan\Desktop\AdministracionNG\backend
npm install

# Crear archivo .env
copy .env.example .env
# Editar .env con:
# - NODE_ENV=development
# - PORT=3000
# - DB_HOST=localhost (si tienes BD local)
# - Otros valores

# Probar que funciona
npm run dev
# Debería ver: "🚀 Servidor corriendo en puerto 3000"
```

**✓ Si funciona localmente → puedes subir a VPS**

---

### 2️⃣ VPS HOSTINGER

#### Conectar por SSH desde PowerShell:
```powershell
ssh usuario@123.45.67.89
# Reemplazar con tu IP real del VPS
```

#### Instalar dependencias:
```bash
# Actualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

#### Crear Base de Datos:
```bash
sudo -u postgres psql

# Dentro de psql:
CREATE DATABASE business_db;
CREATE USER admin WITH ENCRYPTED PASSWORD 'MiPassword123Fuerte!';
GRANT ALL PRIVILEGES ON DATABASE business_db TO admin;
\q
```

#### Cargar esquema de BD:
```bash
cd ~/business-api/backend  # o donde clonaste el repo
psql -U admin -d business_db -f database/schema.sql
psql -U admin -d business_db -f database/seed.sql
```

#### Clonar tu repositorio:
```bash
cd ~
git clone https://github.com/tu-usuario/tu-repo.git business-api
cd business-api/backend
npm install --production
```

#### Crear .env para VPS:
```bash
nano .env
```

Pegar (CAMBIAR VALORES):
```
NODE_ENV=production
PORT=3000
BASE_URL=https://tu-dominio.com

DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=MiPassword123Fuerte!
DB_NAME=business_db
DB_PORT=5432

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

#### Probar servidor:
```bash
npm start
# Debería ver: "🚀 Servidor corriendo en puerto 3000"
# Presionar Ctrl+C para salir
```

#### Iniciar con PM2:
```bash
pm2 start server.js --name "business-api"
pm2 startup
pm2 save
```

#### Configurar Nginx:
```bash
sudo nano /etc/nginx/sites-available/default
```

Reemplazar contenido con:
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
    }
}
```

Guardar (Ctrl+O, Enter, Ctrl+X)

#### Recargar Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Agregar SSL (HTTPS):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
# Aceptar términos cuando te pregunte
```

---

## ✅ PROBAR QUE FUNCIONA

Desde tu PC (PowerShell):
```powershell
# Reemplazar tu-dominio.com
curl https://tu-dominio.com/api/health

# Debería retornar:
# {"status":"OK","message":"Servidor funcionando correctamente"}
```

---

## 🎯 CHECKLIST FINAL

- [ ] SSH conecta al VPS
- [ ] Node.js v20+ instalado en VPS
- [ ] PostgreSQL corriendo en VPS
- [ ] Base de datos `business_db` creada
- [ ] Repositorio clonado en VPS
- [ ] npm install completo
- [ ] .env configurado en VPS
- [ ] `npm start` funciona sin errores
- [ ] PM2 iniciado y guardado
- [ ] Nginx configurado
- [ ] SSL generado con Certbot
- [ ] `curl https://tu-dominio.com/api/health` funciona

---

## 🆘 SI ALGO FALLA

### Error: "ECONNREFUSED" (BD)
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Error: "Port 3000 already in use"
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Error: Nginx no responde
```bash
sudo nginx -t
sudo systemctl restart nginx
pm2 logs business-api
```

### Error: Certificado SSL
```bash
sudo certbot renew --dry-run
```

---

## 📝 IMPORTANTE

1. **Reemplaza valores en .env**: No copies literalmente, cambia:
   - `tu-dominio.com` → tu dominio real
   - `admin` → tu usuario de BD
   - `MiPassword123Fuerte!` → contraseña segura

2. **Seguridad JWT**: Generá claves seguras:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Backups BD**: Haz backups regularmente:
   ```bash
   pg_dump -U admin -d business_db > backup_$(date +%Y%m%d).sql
   ```

---

## 🎉 PRÓXIMO PASO

Una vez que Backend esté funcionando en VPS:

1. **Configura el Frontend** para conectarse a tu dominio
2. **Compila APK** con Expo
3. **Usuarios descargan la app**

---

**¡Listo! Tu app está en producción 🚀**
