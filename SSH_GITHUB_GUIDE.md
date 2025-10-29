# 🔐 Configuración SSH para GitHub

Guía rápida para configurar SSH y conectar tu repositorio en GitHub sin contraseña.

## ✅ Lo que ya hiciste

- ✅ Generaste clave SSH: `id_ed25519_axel`
- ✅ Subiste tu código a GitHub usando SSH
- ✅ Tu repositorio está en: https://github.com/axel180926-prog/AdministracionNG

## 🎯 Verificación Final

Asegúrate de que todo funciona correctamente:

```bash
# Verificar que tu clave existe
ls ~/.ssh/id_ed25519_axel*

# Probar conexión SSH a GitHub
ssh -i ~/.ssh/id_ed25519_axel -T git@github.com
# Debe responder: "Hi axel180926-prog! You've successfully authenticated..."
```

## 📝 Configuración de SSH Config

Ya creaste `/Users/jovan/.ssh/config` con esto:

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_axel
```

Esto significa:
- Cuando haces `git push`, SSH automáticamente usa `id_ed25519_axel`
- No necesitas especificar `-i ~/.ssh/id_ed25519_axel` cada vez

## 🚀 Comandos Git Normales

Ahora puedes usar Git normalmente:

```bash
# Clonar repositorio
git clone git@github.com:axel180926-prog/AdministracionNG.git

# Hacer cambios y subir
git add .
git commit -m "Mi mensaje"
git push origin main

# Traer cambios
git pull origin main
```

## 🔑 Manejo de Múltiples Cuentas

Si tienes múltiples cuentas de GitHub, puedes configurar SSH así:

```
# Para tu cuenta axel180926-prog
Host github-axel
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_axel

# Para otra cuenta
Host github-otro
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa_otro
```

Entonces usarías:
```bash
git clone git@github-axel:axel180926-prog/AdministracionNG.git
```

## 🛠️ Problemas Comunes

### Error: "Permission denied (publickey)"

**Solución:**
```bash
# Verificar que la clave está agregada a GitHub
# 1. Ve a https://github.com/settings/keys
# 2. Verifica que tu clave public esté allí
# 3. Si no está, agrégala

# Ver tu clave pública
cat ~/.ssh/id_ed25519_axel.pub
```

### Error: "No such identity"

**Solución:**
```bash
# Verifica la ruta en tu config
cat ~/.ssh/config

# La ruta debe ser ~/. ssh/id_ed25519_axel (sin espacios)
# O la ruta absoluta: /Users/jovan/.ssh/id_ed25519_axel
```

### Error: "No such file or directory"

**Solución:**
```bash
# Asegúrate de estar en el directorio correcto
pwd
cd C:\Users\jovan\Desktop\AdministracionNG

# O usa la ruta completa
git -C C:\Users\jovan\Desktop\AdministracionNG push origin main
```

## 📚 Referencia Rápida

| Tarea | Comando |
|-------|---------|
| **Ver claves SSH** | `ls ~/.ssh/` |
| **Verificar conexión SSH** | `ssh -T git@github.com` |
| **Ver configuración SSH** | `cat ~/.ssh/config` |
| **Generar nueva clave** | `ssh-keygen -t ed25519 -C "email@example.com"` |
| **Agregar clave a agent** | `ssh-add ~/.ssh/id_ed25519_axel` |
| **Copiar clave pública** | `cat ~/.ssh/id_ed25519_axel.pub` |

## 🔐 Seguridad

- **Nunca compartas** tu clave privada (`id_ed25519_axel`)
- **Solo comparte** tu clave pública (`id_ed25519_axel.pub`)
- **Protege** tu carpeta `~/.ssh` (permisos 700)
- **Usa passphrases** para más seguridad (opcional)

## ✨ ¿Qué significa la clave?

```
id_ed25519_axel
├─ id        → Identidad (clave privada)
├─ ed25519   → Algoritmo de encriptación (seguro y rápido)
└─ axel      → Nombre único para identificar

id_ed25519_axel.pub
├─ .pub      → Pública (seguro compartir)
```

## 🎓 Próximos Pasos

1. **Hacer cambios** en tu código
2. **Ejecutar**: 
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin main
   ```
3. **Ver cambios** en GitHub en línea

## 📞 Ayuda

Si tienes problemas:

1. Verifica que la clave está en `~/.ssh/`
2. Verifica que está agregada a GitHub Settings
3. Intenta: `ssh -T git@github.com`
4. Lee: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

**Configuración completada**: ✅  
**Fecha**: 2025-10-29  
**Usuario**: axel180926-prog  
**Repositorio**: https://github.com/axel180926-prog/AdministracionNG
