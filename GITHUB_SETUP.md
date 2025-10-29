# 🚀 Guía: Subir Proyecto a GitHub

## ✅ Requisitos Previos

- [ ] Tener Git instalado: `git --version`
- [ ] Tener cuenta en GitHub.com
- [ ] Tener SSH configurado (recomendado)

### Verificar Git
```powershell
git --version
# Debería mostrar: git version 2.x.x
```

---

## 📋 Paso 1: Configurar Git (Primera vez)

Solo necesitas hacer esto UNA VEZ en tu computadora.

```powershell
# Configurar nombre
git config --global user.name "Tu Nombre"

# Configurar email (usa el mismo que en GitHub)
git config --global user.email "tu.email@gmail.com"

# Verificar configuración
git config --global --list
```

### Ejemplo
```powershell
git config --global user.name "Jovan"
git config --global user.email "tu.email@gmail.com"
```

---

## 🔐 Paso 2: Configurar SSH (Opcional pero Recomendado)

Permite subir sin escribir contraseña cada vez.

### 2.1 Generar llave SSH

```powershell
ssh-keygen -t rsa -b 4096 -C "tu.email@gmail.com"
```

Presiona Enter 3 veces (sin contraseña para facilitar).

### 2.2 Copiar llave pública

```powershell
# Windows PowerShell
Get-Content $env:USERPROFILE\.ssh\id_rsa.pub | Set-Clipboard
```

### 2.3 Agregar llave a GitHub

1. Ir a: https://github.com/settings/keys
2. Click "New SSH key"
3. Título: "Mi Computadora"
4. Pegar la llave (Ctrl+V)
5. Click "Add SSH key"

### Verificar conexión
```powershell
ssh -T git@github.com
# Debe mostrar: "Hi Jovan! You've successfully authenticated..."
```

---

## 📁 Paso 3: Crear Repositorio en GitHub

### 3.1 Ir a GitHub
1. Entrar a https://github.com
2. Click "+" → "New repository"

### 3.2 Datos del Repositorio

```
Name: negocio-admin-pwa
Description: Sistema de administración de negocios multi-modular
Visibility: Public (si quieres que otros lo vean) o Private
Add .gitignore: Node
Add LICENSE: MIT
```

### Resultado
```
Tu repositorio estará en:
https://github.com/tu-usuario/negocio-admin-pwa
```

---

## 🔧 Paso 4: Inicializar Git Localmente

Abre PowerShell en la carpeta `AdministracionNG`:

```powershell
# Ir a tu proyecto
cd C:\Users\jovan\Desktop\AdministracionNG

# Inicializar Git
git init

# Verificar estado
git status
```

---

## 📝 Paso 5: Crear .gitignore

Este archivo dice a Git qué NO subir.

```powershell
# En PowerShell, crear archivo .gitignore
New-Item -Name ".gitignore" -ItemType File -Force
```

Luego edítalo en VS Code con este contenido:

```text
# Node
node_modules/
npm-debug.log
yarn-error.log
*.tgz

# Backend
backend/.env
backend/.env.local
backend/.env.production
backend/node_modules/
backend/npm-debug.log

# Frontend
frontend/.env
frontend/.env.local
frontend/.env.production
frontend/node_modules/
frontend/.expo/
frontend/.expo-shared/

# Sistema
.DS_Store
Thumbs.db
*.swp
*.swo

# Logs
logs/
*.log

# IDE
.vscode/settings.json
.idea/
*.sublime-project
*.sublime-workspace

# OS
.Trash-1000/
$RECYCLE.BIN/
```

---

## ➕ Paso 6: Agregar Archivos a Git

```powershell
# Agregar TODO
git add .

# O agregar específicos (opcional)
git add backend/
git add frontend/
git add *.md

# Verificar qué se agregó
git status
```

---

## 💾 Paso 7: Primer Commit

```powershell
git commit -m "Initial commit: Sistema multi-modular completamente documentado"
```

### Mensajes de Commit Recomendados
```
"Initial commit: Arquitectura y documentación"
"Backend: API configurada"
"Frontend: ConfigContext implementado"
"Docs: Guías completas para Copilot"
```

---

## 🔗 Paso 8: Conectar con GitHub

Reemplaza `tu-usuario` con tu usuario de GitHub:

```powershell
# Opción A: SSH (Recomendado)
git remote add origin git@github.com:tu-usuario/negocio-admin-pwa.git

# O Opción B: HTTPS (si no configuraste SSH)
git remote add origin https://github.com/tu-usuario/negocio-admin-pwa.git

# Verificar conexión
git remote -v
# Debe mostrar dos líneas con "origin"
```

---

## 🚀 Paso 9: Subir a GitHub

```powershell
# Subir a rama principal
git branch -M main

# Push (subir)
git push -u origin main

# Próximas veces solo necesitas:
git push
```

### Primera vez
Esperará un poco mientras sube. Verás:
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
...
To github.com:tu-usuario/negocio-admin-pwa.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## ✅ Verificar en GitHub

Abre: https://github.com/tu-usuario/negocio-admin-pwa

Deberías ver:
- ✅ Todos tus archivos
- ✅ backend/ con código
- ✅ frontend/ con código
- ✅ Documentación (.md files)
- ✅ .gitignore
- ✅ README.md

---

## 📝 Paso 10: Crear README.md en la Raíz

Crea un archivo `README.md` en `C:\Users\jovan\Desktop\AdministracionNG`:

```markdown
# Sistema de Administración de Negocios Multi-Modular

Sistema adaptativo que se configura dinámicamente según el tipo de negocio (Restaurante, Panadería, Pollería, etc.)

## 🎯 Características

- Módulos dinámicos por tipo de negocio
- Sincronización en tiempo real
- Multi-negocios con datos aislados
- Actualización automática de inventario
- Historial completo de transacciones

## 🏗️ Stack

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React Native + Expo
- **Auth**: JWT
- **Deploy**: VPS Hostinger + PM2

## 📁 Estructura

```
AdministracionNG/
├── backend/              # API REST
├── frontend/             # App React Native
├── ARQUITECTURA.md       # Visión general
├── RECOMENDACIONES.md    # Mejores prácticas
└── .copilot-context      # Contexto para Copilot
```

## 📚 Documentación

- [ARQUITECTURA.md](./ARQUITECTURA.md) - Visión general
- [RECOMENDACIONES.md](./RECOMENDACIONES.md) - Mejores prácticas
- [backend/README.md](./backend/README.md) - Deployment
- [frontend/SETUP_REACT_NATIVE.md](./frontend/SETUP_REACT_NATIVE.md) - Setup

## 🚀 Inicio Rápido

### Backend
```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npx expo install
npx expo start
```

## 📖 Ver Documentación Completa

- Nuevo? → Lee [ARQUITECTURA.md](./ARQUITECTURA.md)
- Copilot? → Abre [.copilot-context](./.copilot-context)
- Usando Copilot? → Lee [RECOMENDACIONES.md](./RECOMENDACIONES.md)

## ✨ Estado

- ✅ Fase 1: Arquitectura y documentación (100%)
- ⏳ Fase 2: Rutas backend (próximo)
- ⏳ Fase 3: Pantallas frontend (próximo)

## 📞 Autor

Jovan

## 📄 Licencia

MIT
```

Luego agrega y commit:
```powershell
git add README.md
git commit -m "Docs: Agregar README en raíz"
git push
```

---

## 🔄 Flujo Diario (Después de la Configuración Inicial)

Una vez todo está configurado, el flujo es simple:

```powershell
# 1. Ver cambios
git status

# 2. Agregar cambios
git add .

# 3. Hacer commit
git commit -m "Descripción del cambio"

# 4. Subir
git push
```

---

## 🐛 Troubleshooting

### Error: "Permission denied (publickey)"
```powershell
# Verificar SSH
ssh -T git@github.com

# O usar HTTPS en lugar de SSH
git remote set-url origin https://github.com/tu-usuario/negocio-admin-pwa.git
```

### Error: "fatal: 'origin' does not appear to be a 'git' repository"
```powershell
# Verificar remoto
git remote -v

# Si está vacío, agregar:
git remote add origin git@github.com:tu-usuario/negocio-admin-pwa.git
```

### Error: "everything up-to-date" pero no ves cambios
```powershell
# Hacer commit primero
git commit -m "Tu mensaje"

# Luego push
git push
```

### No puedo hacer push
```powershell
# Primero traer cambios de GitHub
git pull origin main

# Luego enviar
git push origin main
```

---

## 🔑 Comandos Git Importantes

```powershell
# Ver historial
git log

# Ver cambios sin commitear
git diff

# Ver estado
git status

# Crear rama nueva
git checkout -b mi-rama

# Cambiar de rama
git checkout main

# Ver todas las ramas
git branch -a

# Deshacer último commit (no subido)
git reset --soft HEAD~1

# Ver remoto configurado
git remote -v
```

---

## 🎯 Checklist Final

- [ ] Git instalado
- [ ] Cuenta GitHub creada
- [ ] SSH configurado (opcional)
- [ ] Repositorio creado en GitHub
- [ ] Git inicializado localmente
- [ ] .gitignore creado
- [ ] Primer commit hecho
- [ ] Remoto agregado
- [ ] Push realizado
- [ ] Archivos visibles en GitHub.com
- [ ] README.md agregado

---

## 📞 Verificación Rápida

Ejecuta esto para verificar todo está correcto:

```powershell
# 1. Verificar Git
git --version

# 2. Verificar usuario
git config --global user.name

# 3. Ir a proyecto
cd C:\Users\jovan\Desktop\AdministracionNG

# 4. Verificar repositorio
git status

# 5. Verificar remoto
git remote -v

# 6. Ver último commit
git log -1 --oneline
```

---

## 🚀 ¡Listo!

Tu proyecto está en GitHub. Ahora puedes:

✅ Compartir el link: `https://github.com/tu-usuario/negocio-admin-pwa`
✅ Clonar en otra máquina: `git clone ...`
✅ Colaborar con otros
✅ Hacer backups automáticos
✅ Ver historial completo de cambios

---

**Próximos pasos**:
1. Mantener sincronizado: `git push` después de cambios
2. Crear ramas para features: `git checkout -b feature/nombre`
3. Hacer pull requests para reviews
4. Usar issues para tracking

---

**Fecha**: 2025-10-29
**Versión**: 1.0.0
