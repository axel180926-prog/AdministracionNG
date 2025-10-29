# ⚡ GitHub - Guía Rápida (5 minutos)

## ✅ Lo que Necesitas

1. Git instalado (descargar de https://git-scm.com si no lo tienes)
2. Cuenta GitHub (https://github.com)
3. Este comando funciona: `git --version`

---

## 🚀 6 Comandos Para Subirlo

### PASO 1: Configurar (una sola vez)
```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@gmail.com"
```

### PASO 2: Ir a tu carpeta
```powershell
cd C:\Users\jovan\Desktop\AdministracionNG
```

### PASO 3: Inicializar
```powershell
git init
```

### PASO 4: Crear .gitignore
Copia esto en un archivo `.gitignore` en tu carpeta:
```
node_modules/
backend/.env
backend/.env.local
backend/.env.production
frontend/.env
frontend/.env.local
frontend/.env.production
.DS_Store
Thumbs.db
*.log
.expo/
```

### PASO 5: Agregar todo
```powershell
git add .
```

### PASO 6: Primer commit
```powershell
git commit -m "Initial commit: Sistema multi-modular"
```

---

## 🔗 Crear Repositorio en GitHub

1. Ve a https://github.com
2. Clic en "+" → "New repository"
3. Nombre: `negocio-admin-pwa`
4. Descripción: `Sistema de administración de negocios multi-modular`
5. Clic "Create repository"

---

## 📤 Conectar y Subir

En tu PowerShell, ejecuta:

```powershell
git branch -M main
git remote add origin https://github.com/TU-USUARIO/negocio-admin-pwa.git
git push -u origin main
```

**Reemplaza `TU-USUARIO` con tu usuario de GitHub**

---

## ✅ Verificar

Abre: `https://github.com/TU-USUARIO/negocio-admin-pwa`

Deberías ver tus archivos! ✨

---

## 🔄 Próximas Veces (más fácil)

Cuando hagas cambios:

```powershell
git add .
git commit -m "Tu descripción"
git push
```

---

## 🤖 Alternativa: Usar Script Automático

Si creaste el archivo `push-to-github.ps1`, usa:

```powershell
# Primero, permitir scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Luego ejecutar:
.\push-to-github.ps1 -Message "Tu mensaje"
```

---

## ❓ Errores Comunes

### "Permission denied"
→ Usa HTTPS en lugar de SSH (arriba usamos HTTPS, está bien)

### "fatal: 'origin' does not appear"
→ Ejecuta: `git remote add origin https://github.com/TU-USUARIO/negocio-admin-pwa.git`

### "No changes added to commit"
→ Primero: `git add .`

---

## 📞 Links Útiles

- Descargar Git: https://git-scm.com
- Tu GitHub: https://github.com
- Mi Repo: https://github.com/TU-USUARIO/negocio-admin-pwa

---

**¡Listo en 5 minutos!** ✨
