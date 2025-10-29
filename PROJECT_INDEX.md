# 🗂️ ÍNDICE MAESTRO DEL PROYECTO

**IMPORTANTE**: Lee esto primero en cualquier nueva sesión.

---

## 🎯 Resumen Ejecutivo

**Proyecto**: Sistema Multi-Modular de Administración de Negocios
**Estado**: Fase 1 Completa (100%) | Fase 2 Iniciando (0%)
**GitHub**: https://github.com/sergio180926-max/negocio-admin_pwa
**VPS**: root@31.97.43.51 (SSH sin contraseña configurado)
**Responsable**: Sergio
**Última actualización**: 2025-10-29 13:25 UTC

---

## 📚 DOCUMENTACIÓN PRINCIPAL (LEE PRIMERO)

### Para Entender el Proyecto (En Orden)
1. **README_PROGRESO.md** ← COMIENZA AQUÍ
   - Estado actual de fases
   - Qué está hecho, qué falta
   - Checklist de tareas pendientes

2. **COPILOT_INSTRUCTIONS.md** ← CRÍTICO
   - Reglas de código (seguridad, patrones)
   - Ejemplos correctos/incorrectos
   - Convenciones del proyecto

3. **ARQUITECTURA.md**
   - Visión general del sistema
   - Flujos de datos
   - Estructura de BD (18 tablas)

4. **RECOMENDACIONES.md**
   - Mejores prácticas
   - Patrones de código
   - Performance y seguridad

5. **INDICE_DOCUMENTACION.md**
   - Índice completo de todos los docs
   - Búsqueda rápida por tema

### Otros Documentos Útiles
- `GITHUB_RAPIDO.md` - Cómo subir a GitHub
- `GITHUB_SETUP.md` - Guía detallada de GitHub
- `VPS_SETUP_GUIDE.md` - **Guía completa para configurar VPS**
- `setup-vps.ps1` - **Script automático para configurar VPS**
- `RESUMEN_EJECUTIVO.md` - Resumen ejecutivo
- `.copilot-context` - Contexto para Copilot
- `TODO_LO_CREADO.md` - Qué se generó

---

## 🏗️ ESTRUCTURA DE CARPETAS

```
C:\Users\jovan\Desktop\AdministracionNG\
│
├── 📚 DOCUMENTACIÓN (Lee primero)
│   ├── README_PROGRESO.md         ⭐ ESTADO ACTUAL DEL PROYECTO
│   ├── COPILOT_INSTRUCTIONS.md    ⭐ REGLAS PARA COPILOT
│   ├── PROJECT_INDEX.md           ← Este archivo
│   ├── ARQUITECTURA.md
│   ├── RECOMENDACIONES.md
│   ├── INDICE_DOCUMENTACION.md
│   ├── RESUMEN_EJECUTIVO.md
│   ├── TODO_LO_CREADO.md
│   ├── COMIENZA_AQUI.md
│   ├── GITHUB_RAPIDO.md
│   └── GITHUB_SETUP.md
│
├── 💻 BACKEND (Node.js + Express + PostgreSQL)
│   ├── server.js                  🚀 Punto de entrada
│   ├── package.json               📦 Dependencias
│   ├── .env.example               ⚙️ Variables de ejemplo
│   │
│   ├── config/
│   │   └── database.js            🔗 Conexión PostgreSQL
│   │
│   ├── middleware/
│   │   └── auth.js                🔐 Autenticación JWT
│   │
│   ├── routes/
│   │   ├── config.js              ✅ IMPLEMENTADO (config dinámico)
│   │   ├── auth.js                ⏳ PENDIENTE (login/registro)
│   │   ├── products.js            ⏳ PENDIENTE (productos)
│   │   ├── sales.js               ⏳ PENDIENTE (ventas)
│   │   ├── inventory.js           ⏳ PENDIENTE (inventario detalle)
│   │   ├── reports.js             ⏳ PENDIENTE (reportes)
│   │   ├── users.js               ⏳ PENDIENTE (empleados)
│   │   └── customers.js           ⏳ PENDIENTE (clientes)
│   │
│   ├── services/
│   │   ├── inventoryService.js    ✅ IMPLEMENTADO (transacciones)
│   │   ├── salesService.js        ⏳ PENDIENTE
│   │   ├── authService.js         ⏳ PENDIENTE
│   │   └── reportService.js       ⏳ PENDIENTE
│   │
│   ├── database/
│   │   ├── schema.sql             ✅ 18 tablas definidas
│   │   ├── seed.sql               ✅ Datos iniciales
│   │   └── migrations/            📁 Para futuras versiones
│   │
│   ├── scripts/
│   │   └── migrate.js             ✅ Script de migración
│   │
│   └── README.md                  📖 Instrucciones VPS
│
├── 📱 FRONTEND (React Native + Expo)
│   ├── App.js                     ⏳ PENDIENTE
│   ├── SETUP_REACT_NATIVE.md      📖 Guía de setup
│   │
│   ├── contexts/
│   │   ├── ConfigContext.js       ⏳ Configuración dinámica
│   │   ├── AuthContext.js         ⏳ Estado de auth
│   │   └── ThemeContext.js        ⏳ Temas
│   │
│   ├── navigation/
│   │   ├── DynamicNavigator.js    ⏳ Nav adaptativa por módulos
│   │   ├── AuthNavigator.js       ⏳ Stack de auth
│   │   └── AppNavigator.js        ⏳ Stack principal
│   │
│   ├── screens/
│   │   ├── LoginScreen.js         ⏳ CRÍTICO
│   │   ├── QuickSaleScreen.js     ⏳ CRÍTICO
│   │   ├── InventoryScreen.js     ⏳ CRÍTICO
│   │   ├── SettingsScreen.js      ⏳ Configuración de módulos
│   │   └── ReportsScreen.js       ⏳ Reportes
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   └── LoadingSpinner.js
│   │   └── ... más componentes
│   │
│   └── services/
│       ├── api.js                 ⏳ Cliente HTTP
│       ├── authService.js         ⏳ Servicios auth
│       └── salesService.js        ⏳ Servicios ventas
│
├── 🔧 CONFIGURACIÓN
│   ├── .vscode/
│   │   └── settings.json          ✅ Configuración Copilot
│   │
│   ├── .gitignore                 ✅ Archivos a ignorar
│   ├── push-to-github.ps1         ✅ Script de push automático
│   └── .env.example               ✅ Variables de ejemplo
│
└── 📊 ESPECIFICACIONES
    ├── 18 Tablas de BD definidas
    ├── 18 Módulos disponibles
    ├── 10 Tipos de negocio
    ├── 30+ Rutas API planeadas
    └── 4 Pantallas principales
```

---

## 🔑 ARCHIVOS MÁS IMPORTANTES

### Para IA/Copilot
1. **COPILOT_INSTRUCTIONS.md** - Léelo SIEMPRE
2. **README_PROGRESO.md** - Estado actual del trabajo
3. **.copilot-context** - Contexto adicional

### Para Entender el Sistema
1. **ARQUITECTURA.md** - Diseño general
2. **backend/database/schema.sql** - Estructura de BD
3. **backend/services/inventoryService.js** - Lógica crítica

### Para Implementar
1. **README_PROGRESO.md** - Qué hacer
2. **COPILOT_INSTRUCTIONS.md** - Cómo hacerlo
3. **backend/routes/config.js** - Ejemplo de ruta

---

## 🔄 FLUJO DE TRABAJO

### Cuando Inicies una Nueva Sesión

1. **Lee** `README_PROGRESO.md` (2 minutos)
   - Entiende en qué fase estamos
   - Qué está completado
   - Qué es lo siguiente

2. **Revisa** `COPILOT_INSTRUCTIONS.md` (3 minutos)
   - Las 5 reglas críticas
   - Ejemplos de código correcto
   - Convenciones

3. **Busca** la tarea en `README_PROGRESO.md`
   - Encuentra la sección relevante
   - Lee los requisitos
   - Empieza a implementar

4. **Actualiza** `README_PROGRESO.md` cuando termines
   - Marca ✅ lo completado
   - Agrega nuevos requisitos si identifiques

5. **Pushea** a GitHub
   - `git add .`
   - `git commit -m "Descripción del cambio"`
   - `git push origin main`

---

## ⚡ TAREAS PENDIENTES (ORDENADAS POR PRIORIDAD)

### FASE 2: Backend APIs (COMENZAR AHORA)

**1. auth.js** 🔴 CRÍTICO
- Rutas: register, login, logout, refresh, me
- Ver: `README_PROGRESO.md` línea 105-125

**2. products.js** 🔴 CRÍTICO
- Rutas: GET, POST, PUT, DELETE
- Ver: `README_PROGRESO.md` línea 129-149

**3. sales.js** 🔴 CRÍTICO
- Rutas: POST, GET, GET detail, cancel
- Ver: `README_PROGRESO.md` línea 153-174

**4. reports.js** 🟡 IMPORTANTE
- Rutas: daily, weekly, inventory, top-products
- Ver: `README_PROGRESO.md` línea 178-198

**5. users.js** 🟡 IMPORTANTE
- Rutas: CRUD + sales per user
- Ver: `README_PROGRESO.md` línea 202-221

**6. customers.js** ⚪ OPCIONAL
- Rutas: CRUD + sales history
- Ver: `README_PROGRESO.md` línea 225-238

---

## 🔐 REGLAS CRÍTICAS (MEMORIZAR)

```
1. NUNCA: req.body.businessId
   SIEMPRE: req.user.businessId

2. NUNCA: Query sin WHERE business_id
   SIEMPRE: Filtrar por business_id

3. NUNCA: Validar solo en frontend
   SIEMPRE: Validar en backend

4. NUNCA: Inventario sin transacciones
   SIEMPRE: BEGIN → COMMIT/ROLLBACK

5. NUNCA: Stock negativo
   SIEMPRE: Validar antes de restar
```

---

## 🌐 ENDPOINTS IMPLEMENTADOS

### ✅ Completados
```
GET    /api/health
GET    /api/version
GET    /api/config/business-config
GET    /api/config/business-types
POST   /api/config/toggle-module
PUT    /api/config/business-settings
```

### ⏳ Pendientes (PRÓXIMOS)
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/products
POST   /api/products
POST   /api/sales
GET    /api/inventory
GET    /api/reports/sales/daily
```

---

## 📊 PROGRESO VISUAL

```
Fase 1: ████████████████████ 100% ✅
Fase 2: ░░░░░░░░░░░░░░░░░░░░   0% 🟡
Fase 3: ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Fase 4: ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## 📞 INFORMACIÓN DE CONTACTO/VPS

**VPS Hostinger**
- IP: `31.97.43.51`
- User: `root`
- SSH: ⏳ Pendiente configurar (leer VPS_SETUP_GUIDE.md)
- Llave: ed25519 (se generará con setup-vps.ps1)
- Estructura: `/var/www/negocio-admin/backend`
- Estado: ⏳ Setup automático disponible
- **Pasos**: Ver VPS_SETUP_GUIDE.md o ejecuta setup-vps.ps1

**GitHub**
- Repo: https://github.com/sergio180926-max/negocio-admin_pwa
- SSH: ✅ Configurado
- Branch: main
- Commits: 3

**Archivos Críticos**
- Documentación: 10 archivos
- Backend: 11 archivos
- DB Schema: ✅ Completo

---

## 🎯 CÓMO USAR ESTE ÍNDICE

**Para IA (Copilot)**:
- Consulta esto al inicio de cada sesión
- Entiende qué está hecho vs. pendiente
- Localiza archivos relevantes rápidamente

**Para Humano (Sergio)**:
- Sabe dónde encontrar todo
- Actualiza este índice conforme avanzas
- Comparte esto con cualquier IA nueva

**Para Nuevos Colaboradores**:
- Punto de entrada único
- Comprenden el estado del proyecto
- Saben qué hacer a continuación

---

## 🔗 REFERENCIAS RÁPIDAS

| Necesito | Archivo |
|---------|----------|
| Entender el estado | README_PROGRESO.md |
| Saber cómo codificar | COPILOT_INSTRUCTIONS.md |
| Entender la arquitectura | ARQUITECTURA.md |
| Ver qué se creó | TODO_LO_CREADO.md |
| Setup backend local | backend/README.md |
| Setup frontend | frontend/SETUP_REACT_NATIVE.md |
| Subir a GitHub | GITHUB_RAPIDO.md |
| Configurar VPS | VPS_SETUP_GUIDE.md |
| Ejecutar setup VPS auto | setup-vps.ps1 |
| Buscar un tema | INDICE_DOCUMENTACION.md |

---

## ✨ NOTA FINAL

Este archivo es el "mapa maestro" del proyecto. Actualízalo conforme avances:

- Cuando completes una tarea → marca ✅
- Cuando agregues un archivo → documéntalo aquí
- Cuando encuentres un problema → agrega notas

De esta forma, cualquier IA (o persona) que lea esto entenderá exactamente:
- ✅ Qué está hecho
- ⏳ Qué falta
- 📍 Dónde buscar

---

**Última actualización**: 2025-10-29 13:25 UTC
**Versión**: 1.0.0
**Mantenedor**: Sergio
**Estado**: 🟢 Fase 1 Completa | 🟡 Fase 2 Iniciando
