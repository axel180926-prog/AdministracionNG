# 🚀 COMIENZA AHORA - 3 PASOS

**Estado**: Todo está listo. Solo necesitas ejecutar.  
**Tiempo**: 15-20 minutos para completar FASE 0

---

## ⚡ PASO 1: LEE ESTO (2 min)

Estás aquí:
- ✅ Documentación completa
- ✅ Scripts automáticos listos
- ✅ Proyecto 100% preparado

Necesitas:
- PowerShell (Windows)
- Conexión SSH al VPS

---

## 🎯 PASO 2: EJECUTA SETUP VPS (10 min)

### 2.1 Abre PowerShell como ADMIN

```powershell
# Click derecho en PowerShell → "Ejecutar como administrador"
```

### 2.2 Ve al directorio del proyecto

```powershell
cd C:\Users\jovan\Desktop\AdministracionNG
```

### 2.3 Permite ejecutar scripts

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Presiona 'S' o 'Sí' cuando te pregunte
```

### 2.4 EJECUTA EL SETUP

```powershell
.\setup-vps.ps1
```

### 2.5 Responde las preguntas

**Pregunta 1**: "¿Crear alias en PowerShell? (s/n):"
- Respuesta: `s` (sí, para facilitar SSH)

**Pregunta 2**: "¿Cuál es la contraseña para PostgreSQL?"
- Respuesta: Ingresa una contraseña segura (12+ caracteres)
- ⚠️ **GUARDA ESTA CONTRASEÑA** - La necesitarás después

### 2.6 ESPERA ~10 MINUTOS

El script hará automáticamente:
```
✓ SSH sin contraseña configurado
✓ VPS limpiado (removidos servicios innecesarios)
✓ Node.js v20 instalado
✓ PostgreSQL configurado
✓ Nginx como reverse proxy
✓ PM2 instalado
✓ Archivo .env creado
✓ Base de datos lista
```

**Verás esto al final:**
```
█ ✓ CONFIGURACIÓN COMPLETADA

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
│ 3. Verifica que todo funcione                          │
│ 4. Agrega certificado SSL (Let's Encrypt)              │
│ 5. Cambia contraseñas por defecto                      │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ PASO 3: VERIFICA QUE FUNCIONA (5 min)

### 3.1 Verifica SSH sin contraseña

```powershell
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "echo 'SSH OK'"
```

**Deberías ver:** `SSH OK`

### 3.2 Verifica PostgreSQL

```powershell
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "psql -U negocio_admin_user -d negocio_admin_db -c 'SELECT NOW();'"
```

**Deberías ver:** Una fecha/hora (confirmando que PostgreSQL está corriendo)

### 3.3 Verifica PM2

```powershell
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 status"
```

**Deberías ver:** Estado de procesos PM2

### 3.4 Verifica Nginx

```powershell
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "nginx -t"
```

**Deberías ver:** `nginx: configuration file test successful`

---

## 🎉 ¡LISTO!

Si todos los comandos anteriores funcionaron, tu VPS está **100% configurado**.

---

## 📋 PRÓXIMO PASO (Mañana)

Lee: `NEXT_STEPS.md`

Luego:
1. Implementa **Auth API** (3 horas)
2. Implementa **Products API** (2 horas)
3. Implementa **Sales API** (4 horas)

---

## ❌ SI ALGO NO FUNCIONA

### Error: "Permission denied (publickey)"

La llave SSH no se copió correctamente. Intenta esto:

```powershell
# Genera la llave manualmente
ssh-keygen -t ed25519 -f $HOME/.ssh/vps_key -N ""

# Copia la llave al VPS
cat $HOME/.ssh/vps_key.pub | ssh root@31.97.43.51 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Intenta conectar
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "echo 'SSH OK'"
```

### Error: "PowerShell ExecutionPolicy"

Vuelve a ejecutar:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Presiona `S` cuando te pregunte, luego ejecuta `setup-vps.ps1` de nuevo.

### Error: "No se puede conectar al VPS"

```powershell
# Verifica que tienes SSH instalado
ssh -V

# Verifica que puedes alcanzar el VPS
ping 31.97.43.51

# Intenta conectar con contraseña (para verificar conectividad)
ssh root@31.97.43.51
```

### Script se quedó pegado

- Presiona `Ctrl+C` para cancelar
- Verifica logs: `ssh root@31.97.43.51 "tail -50 /var/log/syslog"`

---

## 📞 INFORMACIÓN IMPORTANTE

### Contraseña PostgreSQL

**Guardaste esto ¿verdad?**
```
Contraseña DB: [LA QUE INGRESASTE]
Usuario: negocio_admin_user
Base de datos: negocio_admin_db
Servidor: localhost:5432
```

### Clave SSH

**Ubicación:**
```
~/.ssh/vps_key          ← Clave privada (GUARDA BIEN)
~/.ssh/vps_key.pub      ← Clave pública
```

### Configuración VPS

**Ubicación en el VPS:**
```
/var/www/negocio-admin/backend/     ← Tu código irá aquí
/var/www/negocio-admin/logs/         ← Logs de la app
/var/www/negocio-admin/.env          ← Variables de entorno
```

---

## 🎯 RESUMEN RÁPIDO

```
AHORA (15-20 min):
├─ Ejecuta setup-vps.ps1
├─ Espera a que termine
└─ Verifica con los 4 comandos

RESULTADO:
├─ SSH sin contraseña ✓
├─ PostgreSQL corriendo ✓
├─ Nginx configurado ✓
├─ PM2 listo ✓
└─ .env template ✓

SIGUIENTE (Mañana):
├─ Implementa Auth API
├─ Implementa Products API
├─ Implementa Sales API
└─ Deploy cuando esté todo listo
```

---

## 🚀 LET'S GO!

Ejecuta ahora:
```powershell
cd C:\Users\jovan\Desktop\AdministracionNG
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-vps.ps1
```

**Espera 10 minutos. Eso es todo para FASE 0.**

Luego ven y pide ayuda con Auth API.

---

**¿Necesitas ayuda?** Lee:
- `VPS_QUICK_START.md` - Guía rápida (2 min)
- `VPS_SETUP_GUIDE.md` - Guía detallada (por fases)
- `NEXT_STEPS.md` - Próximos pasos después de VPS

---

**Creado**: 2025-10-29 14:00 UTC  
**Estado**: ✅ Listo para comenzar  
**Próximo**: 🚀 Ejecuta setup-vps.ps1
