# 🔍 DIAGNÓSTICO - ¿POR QUÉ NO VEO MI APP EN chapibot.pro?

Ejecuta estos comandos EN ORDEN para identificar el problema.

---

## PASO 1: Verificar que el Backend está corriendo

Conecta por SSH:
```powershell
ssh usuario@chapibot.pro
# O si tienes IP específica:
ssh usuario@tu-ip-vps
```

Una vez adentro del VPS:

```bash
# Ver si PM2 está corriendo
pm2 status

# Debería mostrar algo como:
# ┌─ business-api ┬──────────┐
# │ id │ name  │ status   │
# └─ 0  business-api online   └
```

**Si NO ves "online":**
```bash
# Ver logs del error
pm2 logs business-api --lines 50

# O reiniciar
pm2 restart business-api
```

---

## PASO 2: Verificar que el Puerto 3000 responde

En el VPS:
```bash
# Verificar que puerto 3000 está escuchando
sudo lsof -i :3000

# O con netstat
sudo netstat -tulpn | grep 3000

# Debería mostrar algo con :3000 y proceso node
```

**Si NO ves nada:**
```bash
# Ver logs nuevamente
pm2 logs business-api
```

---

## PASO 3: Verificar Nginx

En el VPS:
```bash
# Ver estado de Nginx
sudo systemctl status nginx

# Debería mostrar: "active (running)"

# Si no está corriendo:
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## PASO 4: Verificar configuración de Nginx

En el VPS:
```bash
# Ver configuración actual
sudo cat /etc/nginx/sites-available/default

# O en sites-enabled
sudo cat /etc/nginx/sites-enabled/default
```

**Debe tener algo así:**
```nginx
server {
    listen 80;
    server_name chapibot.pro www.chapibot.pro;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Si es diferente o está vacío, hay que configurarlo:**
```bash
sudo nano /etc/nginx/sites-available/default
```

Pegar (CAMBIAR chapibot.pro si es necesario):
```nginx
server {
    listen 80;
    server_name chapibot.pro www.chapibot.pro;

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

Guardar (Ctrl+O, Enter, Ctrl+X)

Luego validar y reiniciar:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## PASO 5: Verificar Base de Datos

En el VPS:
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Debería mostrar: "active (running)"

# Conectar a la BD
psql -U admin -d business_db -c "SELECT COUNT(*) FROM users;"

# Debería retornar un número (puede ser 0)
```

**Si da error de conexión:**
```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar archivo .env
cat ~/business-api/backend/.env

# Buscar líneas de BD
grep "^DB_" ~/business-api/backend/.env
```

---

## PASO 6: Verificar Variables de Entorno

En el VPS:
```bash
# Ver variables del .env
cat ~/business-api/backend/.env

# Debe tener:
# NODE_ENV=production
# PORT=3000
# BASE_URL=https://chapibot.pro
# DB_HOST=localhost
# DB_USER=admin
# DB_PASSWORD=...
# JWT_SECRET=...
```

**Si algo falta o está mal:**
```bash
nano ~/business-api/backend/.env
# Editar y guardar
```

---

## PASO 7: Probar desde tu PC

En tu PowerShell (Windows):

```powershell
# Test 1: Health check por HTTP
curl http://chapibot.pro/api/health
# Debería retornar: {"status":"OK","message":"..."}

# Test 2: Health check por HTTPS (si tienes SSL)
curl https://chapibot.pro/api/health

# Test 3: Ver business types
curl https://chapibot.pro/api/config/business-types
```

**Si da error de conexión:**
- El dominio NO apunta al VPS
- Nginx no está corriendo
- Backend no está corriendo

---

## PASO 8: Verificar DNS

En tu PC (PowerShell):

```powershell
# Ver a qué IP apunta chapibot.pro
nslookup chapibot.pro

# Debería mostrar: tu IP del VPS

# Ejemplo:
# Name: chapibot.pro
# Address: 123.45.67.89
```

**Si la IP es diferente a tu VPS:**
- Ir al host (Namecheap, GoDaddy, etc)
- Cambiar A record a tu IP del VPS

---

## PASO 9: Si hay SSL/HTTPS

En el VPS:

```bash
# Ver estado de SSL
sudo certbot certificates

# Si el certificado expiró:
sudo certbot renew

# Verificar configuración de Nginx con SSL
sudo cat /etc/nginx/sites-available/default
```

---

## 🎯 CHECKLIST DE DIAGNOSTICO RÁPIDO

Ejecuta EN EL VPS:

```bash
echo "=== 1. PM2 ==="
pm2 status

echo "=== 2. PUERTO 3000 ==="
sudo lsof -i :3000 | grep node || echo "❌ No hay nodo corriendo"

echo "=== 3. NGINX ==="
sudo systemctl status nginx | grep Active

echo "=== 4. POSTGRESQL ==="
sudo systemctl status postgresql | grep Active

echo "=== 5. PRUEBA HTTP ==="
curl http://localhost:3000/api/health || echo "❌ Backend no responde"

echo "=== 6. LOGS BACKEND ==="
pm2 logs business-api --lines 5
```

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:3000"

**Significa**: Nginx NO puede conectar al backend

**Solución**:
```bash
# Verificar que backend está corriendo
pm2 status

# Si no está:
cd ~/business-api/backend
pm2 start server.js --name "business-api"
pm2 save

# Reiniciar Nginx
sudo systemctl restart nginx
```

### ❌ "Error: listen EADDRINUSE :::3000"

**Significa**: Puerto 3000 ya está en uso

**Solución**:
```bash
# Ver qué está usando el puerto
sudo lsof -i :3000

# Matar el proceso
sudo kill -9 <PID>

# O cambiar puerto en .env y reiniciar
```

### ❌ "502 Bad Gateway"

**Significa**: Nginx está corriendo pero no puede alcanzar backend

**Solución**:
```bash
# 1. Ver logs de Nginx
sudo tail -20 /var/log/nginx/error.log

# 2. Verificar backend está corriendo
pm2 logs business-api

# 3. Reiniciar ambos
pm2 restart business-api
sudo systemctl restart nginx
```

### ❌ "Error: connect ECONNREFUSED ... (base de datos)"

**Significa**: Backend no puede conectar a PostgreSQL

**Solución**:
```bash
# 1. Verificar PostgreSQL está corriendo
sudo systemctl status postgresql

# 2. Iniciar si está detenido
sudo systemctl start postgresql

# 3. Verificar credenciales en .env
grep "^DB_" ~/business-api/backend/.env

# 4. Probar conexión manual
psql -U admin -d business_db -c "SELECT 1;"

# 5. Revisar logs
sudo tail -50 /var/log/postgresql/postgresql.log
```

### ❌ "DNS resolution failed"

**Significa**: chapibot.pro NO apunta a tu VPS

**Solución**:
```bash
# En tu PC verificar DNS
nslookup chapibot.pro

# Debe mostrar tu IP del VPS
# Si no, cambiar en tu host (Namecheap, etc)
```

---

## 📋 LISTA DE VERIFICACIÓN COMPLETA

- [ ] PM2 muestra `business-api` con status `online`
- [ ] Puerto 3000 está escuchando (comando lsof)
- [ ] Nginx está activo (systemctl status nginx)
- [ ] PostgreSQL está activo
- [ ] .env tiene valores correctos
- [ ] `curl http://localhost:3000/api/health` funciona en VPS
- [ ] `curl https://chapibot.pro/api/health` funciona desde tu PC
- [ ] DNS apunta a tu IP del VPS

Si TODOS están marcados ✅ → tu app debería verse en chapibot.pro

---

## 🔄 REINICIO COMPLETO (NUCLEAR OPTION)

Si nada funciona, hacer reinicio completo:

```bash
# En el VPS:

# 1. Detener todo
pm2 stop all
pm2 delete all
sudo systemctl stop nginx
sudo systemctl stop postgresql

# 2. Esperar 10 segundos
sleep 10

# 3. Iniciar en orden
sudo systemctl start postgresql
sleep 5

# 4. Ir al backend y reiniciar
cd ~/business-api/backend
pm2 start server.js --name "business-api"
pm2 startup
pm2 save

# 5. Reiniciar Nginx
sudo systemctl restart nginx

# 6. Ver logs
pm2 logs business-api
```

---

## 📞 INFORMACIÓN QUE NECESITO PARA AYUDARTE

Cuando respondas, dime:

1. **¿Qué ves cuando accedes a chapibot.pro?**
   - Página en blanco
   - Error 502
   - Error de DNS
   - Connection refused
   - Otra cosa

2. **Output de estos comandos (desde VPS):**
   ```bash
   pm2 status
   sudo lsof -i :3000
   sudo systemctl status nginx
   pm2 logs business-api --lines 10
   ```

3. **Output de esto desde tu PC:**
   ```powershell
   curl https://chapibot.pro/api/health
   nslookup chapibot.pro
   ```

Con esa información puedo identificar exactamente dónde está el problema y repararlo.

---

**¿Ejecutaste los comandos? Comparte los resultados y te lo reparo inmediatamente 🔧**
