# 🚀 VPS SETUP - QUICK START

## 📍 Ubicación: Tu máquina local (Windows con PowerShell)

---

## 🔧 OPCIÓN 1: CONFIGURACIÓN AUTOMÁTICA (RECOMENDADO)

### Un comando = Todo configurado

```powershell
# En PowerShell (como admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-vps.ps1
```

**Qué hace automáticamente:**
- ✅ SSH sin contraseña
- ✅ Limpia el VPS (remover MongoDB, n8n, etc.)
- ✅ Actualiza Node.js a v20
- ✅ Configura PostgreSQL
- ✅ Configura Nginx
- ✅ Instala y configura PM2
- ✅ Crea archivo .env

**Tiempo**: ~10 minutos

---

## 🔧 OPCIÓN 2: MANUAL (SI NECESITAS CONTROL)

Lee **VPS_SETUP_GUIDE.md** y ejecuta fase por fase:

1. **FASE 1**: Preparar SSH
   ```bash
   ssh-keygen -t ed25519 -f $HOME/.ssh/vps_key -N ""
   cat $HOME/.ssh/vps_key.pub | ssh root@31.97.43.51 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   ```

2. **FASE 2**: Limpiar VPS
   - Ver "FASE 2" en VPS_SETUP_GUIDE.md

3. **FASE 3-7**: Completar según la guía

---

## ✅ DESPUÉS DE SETUP

### Verificar que todo está bien

```powershell
# Ver estado de PM2
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 status"

# Ver logs
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 logs"

# Conectar directamente
ssh -i $HOME/.ssh/vps_key root@31.97.43.51
```

### Próximos pasos

1. **Sube tu código a GitHub** (si no lo has hecho)
   ```bash
   git add .
   git commit -m "Setup VPS completado"
   git push origin main
   ```

2. **Crea deploy.sh** en tu PC (ver VPS_SETUP_GUIDE.md)
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Verifica que la app esté corriendo**
   ```bash
   # Debería responder en http://31.97.43.51/api/health
   curl http://31.97.43.51/api/health
   ```

4. **Cambia contraseñas por defecto**
   ```bash
   ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "nano /var/www/negocio-admin/backend/.env"
   ```

---

## 📁 ARCHIVOS RELACIONADOS

| Archivo | Propósito |
|---------|-----------|
| **VPS_SETUP_GUIDE.md** | Guía detallada paso a paso |
| **setup-vps.ps1** | Script automático (EJECUTAR) |
| **deploy.sh** | Deploy de tu aplicación (CREATE AFTER SETUP) |
| **ecosystem.config.js** | Config PM2 (generado en VPS) |

---

## 🆘 TROUBLESHOOTING

### "Connection refused"
```bash
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 logs negocio-admin | tail -50"
```

### "Permission denied (publickey)"
SSH sin contraseña no está configurado. Intenta:
```bash
ssh -i $HOME/.ssh/vps_key root@31.97.43.51
```

### Nginx 502 Bad Gateway
```bash
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 status"
# Backend no está corriendo, revisa logs
```

### PostgreSQL error
```bash
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "psql -U negocio_admin_user -d negocio_admin_db -c 'SELECT version();'"
```

---

## 📞 CHEATSHEET DE COMANDOS

```powershell
# Conectar al VPS
ssh -i $HOME/.ssh/vps_key root@31.97.43.51

# Ver estado app
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 status"

# Ver logs en tiempo real
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 logs negocio-admin"

# Reiniciar app
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 restart negocio-admin"

# Parar app
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 stop negocio-admin"

# Ver espacio disco
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "df -h"

# Ver procesos
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "ps aux | grep node"
```

---

## 🎯 RESUMEN DEL FLUJO

```
1. Ejecuta setup-vps.ps1 (o sigue VPS_SETUP_GUIDE.md manualmente)
   ↓
2. Espera ~10 minutos (auto-config todo)
   ↓
3. Verifica: ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 status"
   ↓
4. Sube código: git push origin main
   ↓
5. Ejecuta deploy.sh (copia archivos al VPS)
   ↓
6. App corriendo en: http://31.97.43.51/api
```

---

**¿Listo?** Ejecuta:
```powershell
.\setup-vps.ps1
```

**¿Necesitas detalles?** Lee:
```
VPS_SETUP_GUIDE.md
```
