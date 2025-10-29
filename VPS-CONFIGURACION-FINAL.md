# VPS CONFIGURACION - COMPLETADA

**Fecha**: 2025-10-29 15:08 UTC
**Estado**: 100% COMPLETADO
**VPS**: root@31.97.43.51

---

## RESUMEN DE LO REALIZADO

### FASE 0: SSH Setup
- ✅ Clave SSH ed25519 generada
- ✅ Conexión sin contraseña configurada
- ✅ Acceso remoto verificado

### FASE 1: Base de Datos PostgreSQL
- ✅ Base de datos: `negocio_admin_db`
- ✅ Usuario: `negocio_admin_user`
- ✅ Contraseña: `R@mmstein180926`
- ✅ Permisos configurados

### FASE 2: Directorios
- ✅ `/var/www/negocio-admin/backend/` creado
- ✅ `/var/www/negocio-admin/logs/` creado
- ✅ `/var/www/negocio-admin/data/` creado

### FASE 3: Archivo .env
- ✅ Creado en `/var/www/negocio-admin/backend/.env`
- ✅ Variables configuradas:
  - NODE_ENV=production
  - PORT=3000
  - DB_HOST=localhost
  - DB_NAME=negocio_admin_db
  - DB_USER=negocio_admin_user
  - DB_PASSWORD=R@mmstein180926
  - JWT_SECRET configurado
  - CORS_ORIGIN configurado

### FASE 4: Nginx
- ✅ Configuración creada
- ✅ Reverse proxy en puerto 80 → 3000
- ✅ Sintaxis validada
- ✅ Servicio reloadedado

### FASE 5: PM2
- ✅ Archivo ecosystem.config.js creado
- ✅ Configurado para:
  - Nombre: negocio-admin
  - Script: server.js
  - Modo: cluster (max instances)
  - Logs: /var/www/negocio-admin/logs/

---

## ESTADO ACTUAL DEL VPS

```
Estructura de carpetas:
/var/www/negocio-admin/
├── backend/
│   └── .env (CONFIGURADO)
├── logs/
├── data/
├── ecosystem.config.js (CONFIGURADO)
├── icon-192.svg
├── icon-512.svg
├── index.html
├── manifest.webmanifest
├── public/
├── src/
└── styles.css
```

---

## PROXIMOS PASOS

### 1. Sube tu código a GitHub

```bash
git add .
git commit -m "VPS configurado - Fase 0 completa"
git push origin main
```

### 2. Copia tu código backend al VPS

```powershell
# Desde tu PC local
scp -r backend/* -i "$HOME\.ssh\vps_key" root@31.97.43.51:/var/www/negocio-admin/backend/
```

### 3. Instala dependencias en el VPS

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "cd /var/www/negocio-admin/backend && npm install"
```

### 4. Inicia la aplicación con PM2

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "cd /var/www/negocio-admin && pm2 start ecosystem.config.js"
```

### 5. Verifica que está corriendo

```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "pm2 status"
```

### 6. Prueba el endpoint

```powershell
# Debe responder
curl http://31.97.43.51/api/health
```

---

## CREDENCIALES

**PostgreSQL**
```
Host: localhost
Puerto: 5432
Base de datos: negocio_admin_db
Usuario: negocio_admin_user
Contraseña: R@mmstein180926
```

**SSH**
```
Host: 31.97.43.51
Usuario: root
Clave: C:\Users\jovan\.ssh\vps_key
```

**Aplicación**
```
URL Base: http://31.97.43.51
API: http://31.97.43.51/api
Puerto interno: 3000
```

---

## COMANDOS UTILES

### Ver estado de la app
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "pm2 status"
```

### Ver logs en tiempo real
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "pm2 logs negocio-admin"
```

### Reiniciar la app
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "pm2 restart negocio-admin"
```

### Parar la app
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "pm2 stop negocio-admin"
```

### Ver contenido de .env
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "cat /var/www/negocio-admin/backend/.env"
```

### Ver configuración Nginx
```powershell
ssh -i "$HOME\.ssh\vps_key" root@31.97.43.51 "sudo cat /etc/nginx/sites-enabled/negocio-admin.conf"
```

---

## VERIFICACION FINAL

✅ PostgreSQL: Configurado  
✅ Directorios: Creados  
✅ .env: Configurado  
✅ Nginx: Validado  
✅ PM2: Configurado  
✅ SSH: Funcional  

---

## LISTO PARA DEPLOY

El VPS está 100% listo para recibir tu código.

**Próximo paso**: Sube tu backend a GitHub y luego copia los archivos al VPS usando SCP.

---

**Creado**: 2025-10-29 15:08 UTC
**Estado**: CONFIGURACIÓN COMPLETADA
**Próximo paso**: Deploy de la aplicación
