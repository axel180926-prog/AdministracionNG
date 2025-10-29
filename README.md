# 🏪 Sistema de Administración Multi-Negocio (AdministracionNG)

[![GitHub](https://img.shields.io/badge/GitHub-axel180926--prog-black?logo=github)](https://github.com/axel180926-prog/AdministracionNG)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0--alpha-blue)]()

Sistema adaptativo de gestión empresarial que se configura automáticamente según el tipo de negocio (restaurantes, panaderías, pollerías, taquerías, etc.).

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API](#-api)
- [Base de Datos](#-base-de-datos)
- [Despliegue](#-despliegue)
- [Roadmap](#-roadmap)
- [Recursos](#-recursos)

## ✨ Características

### 🎯 Adaptabilidad
- **Módulos Dinámicos**: La app se reconfigura según el tipo de negocio
- **Tipos de Negocio**: Restaurante, Pollería, Panadería, Taquería, etc.
- **Configuración en Tiempo Real**: Activa/desactiva módulos sin reiniciar

### 💼 Módulos Disponibles
- **Ventas Rápidas** (Quick Sale)
- **Gestión de Inventario** (Stock, movimientos, historial)
- **Control de Mesas** (Restaurantes)
- **Órdenes de Comanda** (Kitchen Display)
- **Meseros/Empleados** (Gestión de personal)
- **Entregas a Domicilio** (Delivery)
- **Reportes de Ventas** (Analytics)
- **Gestión de Productos** (Categorías, precios)
- **Producción** (Panaderías)

### 🔐 Seguridad
- Autenticación JWT
- Roles y permisos (owner, admin, employee, cashier)
- Encriptación de contraseñas (bcrypt)
- Aislamiento de datos por negocio

### 📊 Funcionalidades Técnicas
- API REST con Express.js
- Base de datos PostgreSQL
- React Native + Expo (Mobile)
- Sincronización en tiempo real
- Historial completo de movimientos
- Multi-negocio por usuario

## 🏗️ Arquitectura

```
AdministracionNG/
├── backend/                  # API REST (Node.js + Express)
│   ├── config/              # Configuración BD
│   ├── middleware/          # Autenticación JWT
│   ├── routes/              # Endpoints API
│   ├── services/            # Lógica de negocio
│   ├── database/            # Schema SQL
│   └── server.js            # Punto de entrada
│
├── frontend/                # Mobile App (React Native + Expo)
│   ├── screens/             # Pantallas de la app
│   ├── contexts/            # Estado global (ConfigContext)
│   ├── navigation/          # Navegación adaptativa
│   ├── services/            # Llamadas a API
│   └── App.js               # Punto de entrada
│
├── ARQUITECTURA.md          # Documentación detallada
├── COMIENZA_AQUI.md         # Guía rápida
└── README.md                # Este archivo
```

## 📋 Requisitos

### Desarrollo Local
- **Node.js** 14+ (https://nodejs.org)
- **PostgreSQL** 12+ (https://www.postgresql.org)
- **npm** o **yarn**
- **Git** (https://git-scm.com)

### Producción
- **VPS con SSH** (Ubuntu 20.04+)
- **Dominio** (opcional pero recomendado)
- **SSL Certificate** (Let's Encrypt - gratis)

## 🚀 Instalación

### 1️⃣ Clonar Repositorio

```bash
git clone https://github.com/axel180926-prog/AdministracionNG.git
cd AdministracionNG
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus valores
nano .env  # o usa tu editor favorito

# Ejecutar migraciones BD
npm run db:migrate

# Iniciar servidor
npm run dev  # desarrollo
npm start    # producción
```

**El backend estará disponible en**: `http://localhost:3000`

### 3️⃣ Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npx expo install

# Iniciar aplicación
npx expo start

# En terminal:
# - Presiona 'a' para abrir en Android Emulator
# - Presiona 'i' para abrir en iOS Simulator
# - Escanea QR con Expo Go app en tu teléfono
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=business_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@email.com
SMTP_PASS=tu_contraseña
```

### Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# En la consola psql:
CREATE DATABASE business_db;
\c business_db

# Ejecutar schema
\i backend/database/schema.sql

# Verificar tablas
\dt
```

## 💻 Uso

### Backend - Endpoints Principales

#### Salud (Sin autenticación)
```bash
GET /api/health                    # Estado del servidor
GET /api/version                   # Versión de la API
```

#### Autenticación
```bash
POST   /api/auth/register          # Registrar usuario
POST   /api/auth/login             # Iniciar sesión
POST   /api/auth/refresh           # Renovar token
```

#### Configuración (Requiere autenticación)
```bash
GET    /api/config/business-config       # Obtener config del negocio
GET    /api/config/business-types        # Listar tipos de negocio
POST   /api/config/toggle-module         # Activar/desactivar módulo
PUT    /api/config/business-settings     # Actualizar configuración
```

#### Próximos (En desarrollo)
```bash
GET    /api/products                     # Listar productos
POST   /api/sales                        # Registrar venta
GET    /api/sales/today                  # Ventas del día
GET    /api/inventory                    # Inventario actual
POST   /api/inventory/add-stock          # Agregar stock
```

### Frontend - Pantallas

| Pantalla | Descripción | Módulo |
|----------|-------------|--------|
| **Login** | Autenticación de usuario | - |
| **Quick Sale** | Venta rápida de productos | `quick_sale` |
| **Inventory** | Gestión de stock | `inventory` |
| **Tables** | Control de mesas (restaurante) | `tables` |
| **Orders** | Comanda de cocina | `orders` |
| **Delivery** | Entregas a domicilio | `delivery` |
| **Reports** | Reportes de ventas | `reports` |
| **Settings** | Configuración y módulos | - |

## 🗄️ Base de Datos

### Tablas Principales

```sql
-- Configuración
business_types           -- Tipos de negocio (Restaurante, Pollería, etc.)
business_type_modules    -- Módulos por tipo de negocio
business_settings        -- Configuración visual y operativa

-- Usuarios y Negocios
businesses               -- Negocios registrados
users                    -- Usuarios del sistema
business_modules         -- Módulos activos por negocio

-- Productos e Inventario
categories               -- Categorías de productos
products                 -- Catálogo de productos
inventory                -- Stock actual
inventory_movements      -- Historial de cambios de stock

-- Ventas
sales                    -- Registro de ventas
sale_items               -- Items por venta

-- Restaurante (Opcional)
tables                   -- Mesas del restaurante
waiters                  -- Meseros
orders                   -- Órdenes de comanda
order_items              -- Items por orden
deliveries               -- Entregas a domicilio
```

**Ver estructura completa**: `backend/database/schema.sql`

## 📦 Despliegue

### Opción 1: Hostinger VPS

Guía completa en: `VPS_SETUP_GUIDE.md`

```bash
# 1. SSH en VPS
ssh root@tu_ip_vps

# 2. Actualizar sistema
apt update && apt upgrade -y

# 3. Instalar Node.js y PostgreSQL
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt install -y nodejs postgresql postgresql-contrib

# 4. Clonar repositorio
git clone https://github.com/axel180926-prog/AdministracionNG.git
cd AdministracionNG/backend

# 5. Configurar
npm install
cp .env.example .env
# Editar .env con valores de VPS

# 6. Base de datos
sudo -u postgres psql
CREATE DATABASE business_db;
\c business_db
\i schema.sql

# 7. Iniciar con PM2
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save
```

### Opción 2: Heroku

```bash
# Inicializar Heroku
heroku create tu-app-name
git push heroku main
```

### Opción 3: Docker

```bash
docker-compose up -d
```

## 🚦 Verificación

### Verificar Backend
```bash
curl http://localhost:3000/api/health
# Respuesta: {"status":"OK","message":"Servidor funcionando correctamente"}
```

### Verificar Base de Datos
```bash
psql -U postgres -d business_db -c "SELECT COUNT(*) FROM modules;"
```

### Verificar Frontend
```bash
npm start
# Escanea QR con Expo Go
```

## 🎯 Tipos de Negocio

### Restaurante
Módulos: quick_sale, inventory, tables, orders, waiters, delivery, reports

### Pollería
Módulos: quick_sale, inventory, delivery, reports

### Panadería
Módulos: quick_sale, inventory, production, recipes, reports

### Taquería
Módulos: quick_sale, inventory, tables, delivery, reports

## 🔄 Flujo de Usuario

### 1. Primer Acceso
```
1. Usuario se registra (email, contraseña)
2. Selecciona tipo de negocio
3. Backend configura módulos automáticamente
4. App carga con módulos habilitados
5. Listo para usar
```

### 2. Operación Diaria
```
1. Abrir app
2. Efectuar ventas (Quick Sale)
3. Gestionar inventario
4. Ver reportes
5. Cambiar configuración (Settings)
```

### 3. Cambiar Tipo de Negocio
```
1. Settings → Cambiar tipo de negocio
2. Seleccionar nuevo tipo
3. Backend reconfigura automáticamente
4. App se refresca con nuevos módulos
```

## 🛠️ Desarrollo

### Scripts Disponibles

**Backend:**
```bash
npm run dev              # Ejecutar en modo desarrollo (nodemon)
npm start               # Ejecutar en producción
npm run db:migrate      # Ejecutar migraciones
npm run db:seed         # Cargar datos de ejemplo
npm run db:reset        # Limpiar y recargar BD
```

**Frontend:**
```bash
npx expo start          # Iniciar en desarrollo
npx expo build:android  # Compilar APK
npx expo build:ios      # Compilar IPA
npx expo publish        # Publicar en Expo
```

### Estructura de Código

```
backend/
├── middleware/auth.js           # Autenticación JWT
├── routes/
│   ├── config.js               # Configuración dinámica ⭐
│   ├── auth.js                 # Autenticación
│   ├── products.js             # Productos
│   ├── sales.js                # Ventas
│   ├── reports.js              # Reportes
│   └── users.js                # Usuarios
├── services/
│   └── inventoryService.js     # Lógica de inventario
└── config/
    └── database.js             # Conexión BD

frontend/
├── contexts/
│   └── ConfigContext.js        # Estado global ⭐
├── navigation/
│   └── DynamicNavigator.js     # Nav. adaptativa ⭐
├── screens/
│   ├── LoginScreen.js
│   ├── QuickSaleScreen.js
│   ├── InventoryScreen.js
│   ├── TablesScreen.js
│   ├── OrdersScreen.js
│   ├── DeliveryScreen.js
│   └── SettingsScreen.js
└── services/
    └── api.js                  # Llamadas HTTP
```

## 📚 Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| **ARQUITECTURA.md** | Diseño completo del sistema |
| **COMIENZA_AQUI.md** | Guía de inicio rápido |
| **GITHUB_SETUP.md** | Cómo subir a GitHub |
| **VPS_SETUP_GUIDE.md** | Despliegue en VPS Hostinger |
| **backend/README.md** | Instalación backend |
| **backend/database/schema.sql** | Esquema SQL completo |

## 🚦 Roadmap

### ✅ Fase 1 (Actual)
- [x] Arquitectura base
- [x] Autenticación JWT
- [x] Sistema de módulos dinámicos
- [x] API de configuración
- [x] Estructura de BD

### ⏳ Fase 2
- [ ] Rutas de ventas, inventario, productos
- [ ] Pantallas de venta rápida completa
- [ ] Gestión de inventario con movimientos
- [ ] Sistema de usuarios/empleados
- [ ] Reportes básicos

### ⏳ Fase 3
- [ ] WebSockets para tiempo real
- [ ] Reportes avanzados (gráficos)
- [ ] Programa de lealtad/puntos
- [ ] Pasarelas de pago integradas
- [ ] Multi-idioma

### ⏳ Fase 4
- [ ] App iOS (además de Android)
- [ ] PWA web para desktop
- [ ] Backups automáticos
- [ ] API de terceros

## 🐛 Solución de Problemas

### Backend no conecta a BD
```bash
# Verificar PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar variables .env
cat .env | grep DB_

# Verificar conexión
psql -U postgres -d business_db
```

### Frontend no conecta a API
```bash
# Verificar backend está corriendo
curl http://localhost:3000/api/health

# Verificar CORS en backend/server.js
# Verificar BASE_URL en frontend/services/api.js
```

### Errores de token JWT
```bash
# Generar nuevo JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Actualizar .env y reiniciar backend
npm run dev
```

## 📞 Soporte

- **Documentación**: Ver archivos .md en la raíz
- **Issues**: https://github.com/axel180926-prog/AdministracionNG/issues
- **Contacto**: axel180926@gmail.com

## 📝 Licencia

Este proyecto está bajo la licencia MIT - Ver archivo [LICENSE](LICENSE)

## 👨‍💻 Autor

**Axel** - [GitHub](https://github.com/axel180926-prog)

## 🙏 Agradecimientos

- Express.js - Framework web
- React Native - Framework mobile
- PostgreSQL - Base de datos
- Expo - Herramienta de compilación
- JWT - Autenticación segura

---

## 📊 Estado del Proyecto

```
├─ Backend: ✅ Core completado
├─ Frontend: 🔄 En desarrollo
├─ BD: ✅ Schema completado
├─ Docs: ✅ Documentación en progreso
└─ Testing: 🔄 Próximamente
```

**Última actualización**: 2025-10-29  
**Versión**: 1.0.0-alpha  
**Estado**: En desarrollo activo
