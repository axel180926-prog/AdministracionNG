# Arquitectura del Sistema de Administración de Negocios

## 📋 Visión General

Sistema modular y adaptativo que se configura automáticamente según el tipo de negocio. Una aplicación móvil que se transforma para restaurantes, panaderías, pollerías, taquerías, etc.

## 🏗️ Componentes Principales

### 1. Backend (Node.js + Express + PostgreSQL)

**Ubicación**: `/backend`

**Funcionalidades**:
- API REST con autenticación JWT
- Configuración dinámica de módulos
- Gestión multi-negocio
- Sincronización de inventario en tiempo real
- Historial completo de movimientos

**Archivos clave**:
```
backend/
├── server.js              # Punto de entrada Express
├── package.json           # Dependencias
├── .env.example          # Configuración de ejemplo
├── config/
│   └── database.js       # Conexión a PostgreSQL
├── middleware/
│   └── auth.js           # Autenticación JWT
├── routes/
│   ├── config.js         # Configuración dinámica ⭐
│   ├── sales.js          # Gestión de ventas (próximo)
│   ├── inventory.js      # Gestión de inventario (próximo)
│   └── products.js       # Gestión de productos (próximo)
├── services/
│   └── inventoryService.js  # Lógica de inventario
└── database/
    ├── schema.sql        # Estructura de BD
    └── seed.sql          # Datos iniciales
```

### 2. Frontend (React Native + Expo)

**Ubicación**: `/frontend`

**Funcionalidades**:
- Interfaz adaptativa según tipo de negocio
- Sincronización con configuración del backend
- Almacenamiento local con AsyncStorage
- Navegación dinámica

**Archivos clave**:
```
frontend/
├── App.js                          # Punto de entrada
├── app.json                        # Configuración Expo
├── contexts/
│   └── ConfigContext.js            # Contexto dinámico ⭐
├── navigation/
│   └── DynamicNavigator.js         # Navegación adaptativa ⭐
├── screens/
│   ├── SplashScreen.js             # Pantalla de inicio
│   ├── LoginScreen.js              # Autenticación
│   ├── QuickSaleScreen.js          # Venta rápida
│   ├── TablesScreen.js             # Control de mesas (restaurante)
│   ├── InventoryScreen.js          # Gestión de inventario
│   ├── OrdersScreen.js             # Órdenes (restaurante)
│   ├── DeliveryScreen.js           # Entregas a domicilio
│   ├── ProductionScreen.js         # Producción (panadería)
│   └── SettingsScreen.js           # Configuración ⭐
└── services/
    └── api.js                      # Servicios HTTP
```

## 🗄️ Base de Datos

### Tablas Principales

```
1. business_types          → Tipos de negocio (Restaurante, Panadería, etc.)
2. businesses              → Negocios registrados
3. users                   → Usuarios del sistema
4. modules                 → Módulos disponibles del sistema
5. business_type_modules   → Configuración por tipo de negocio
6. business_modules        → Módulos activos por negocio ⭐
7. business_settings       → Configuración visual y operativa ⭐
8. categories              → Categorías de productos
9. products                → Productos
10. inventory              → Stock actual
11. inventory_movements    → Historial de cambios
12. sales                  → Ventas registradas
13. sale_items             → Items de cada venta
14. tables                 → Mesas del restaurante
15. waiters                → Meseros
16. orders                 → Órdenes de restaurante
17. order_items            → Items de cada orden
18. deliveries             → Entregas a domicilio
```

## 🔄 Flujo de Datos

### 1. Inicialización de Aplicación

```
App inicia
    ↓
Verifica token en AsyncStorage
    ↓
Si autenticado → ConfigContext carga config desde API
    ↓
DynamicNavigator obtiene módulos activos
    ↓
Renderiza solo pantallas habilitadas
```

### 2. Cambio de Módulos en Tiempo Real

```
Usuario abre SettingsScreen
    ↓
Activa/desactiva módulo (POST /api/config/toggle-module)
    ↓
Backend actualiza business_modules en BD
    ↓
SettingsScreen llama reloadConfig()
    ↓
ConfigContext obtiene nueva config del API
    ↓
DynamicNavigator se re-renderiza
    ↓
App muestra/oculta pantallas
```

### 3. Registro de Venta

```
Usuario en QuickSaleScreen agrega productos
    ↓
Registra venta (POST /api/sales)
    ↓
Backend crea sale + sale_items
    ↓
InventoryService actualiza stock automáticamente
    ↓
Registra movimientos en inventory_movements
    ↓
App actualiza pantalla de inventario
```

## 🎯 Tipos de Negocio y Módulos

### Restaurante
Módulos habilitados:
- ✅ quick_sale (Ventas)
- ✅ inventory (Inventario)
- ✅ tables (Mesas)
- ✅ orders (Órdenes)
- ✅ waiters (Meseros)
- ✅ delivery (Entregas)
- ✅ sales_reports (Reportes)

### Pollería
- ✅ quick_sale
- ✅ inventory
- ✅ delivery (opcional)
- ✅ sales_reports

### Panadería
- ✅ quick_sale
- ✅ inventory
- ✅ production (Producción)
- ✅ recipes (Recetas)
- ✅ sales_reports

### Taquería
- ✅ quick_sale
- ✅ inventory
- ⚠️ tables (opcional)
- ✅ delivery (opcional)
- ✅ sales_reports

## 🌐 Endpoints API

### Configuración (Base de datos dinámmica)
```
GET    /api/config/business-config       → Obtener configuración completa
GET    /api/config/business-types        → Listar tipos de negocio
POST   /api/config/toggle-module         → Activar/desactivar módulo
PUT    /api/config/business-settings     → Actualizar configuración
```

### Salud
```
GET    /api/health                       → Estado del servidor
GET    /api/version                      → Versión del API
```

### Próximos (en desarrollo)
```
POST   /api/sales                        → Registrar venta
GET    /api/sales/today                  → Ventas del día
GET    /api/inventory                    → Inventario completo
POST   /api/inventory/add-stock          → Agregar stock
GET    /api/products                     → Listar productos
```

## 🔐 Seguridad

### Autenticación
- JWT (JSON Web Tokens)
- Tokens con expiración de 7 días
- Renovación automática

### Autorización
- Roles: owner, admin, employee, cashier
- Permisos por rol
- Validación en cada endpoint protegido

### Base de Datos
- Contraseñas encriptadas con bcrypt
- Aislamiento de datos por negocio
- Índices para optimización

## 📱 Flujo de Usuario

### 1. Nuevo Negocio

```
1. Usuario se registra (email, nombre, contraseña)
2. Selecciona tipo de negocio (Restaurante, Panadería, etc.)
3. Backend crea:
   - businesses
   - users (role: owner)
   - business_settings
   - business_modules (según tipo)
   - categories (por defecto)
4. App carga ConfigContext con módulos activados
5. DynamicNavigator muestra pantallas correspondientes
```

### 2. Operación Diaria

```
1. Usuario abre app
2. ConfigContext carga módulos activos
3. Ve dashboard con módulos habilitados
4. Puede vender, gestionar inventario, etc.
5. Desde SettingsScreen puede cambiar módulos
6. Cambios se aplican inmediatamente
```

### 3. Cambiar Tipo de Negocio

```
1. Owner va a SettingsScreen
2. Selecciona "Cambiar tipo de negocio"
3. Elige nuevo tipo
4. Backend reconfigura business_modules
5. App se reinicia con nuevos módulos
```

## 🚀 Despliegue

### VPS Hostinger

```
1. SSH en VPS
2. Instalar Node.js, PostgreSQL, Nginx
3. Clonar repositorio
4. npm install
5. Configurar .env
6. npm run db:migrate
7. pm2 start server.js
8. Configurar Nginx como proxy
9. SSL con Certbot
```

### APK/iOS

```
1. Usar Expo CLI
2. npx expo publish
3. Usuarios descargan de Play Store/App Store
4. Conectan automáticamente a API de VPS
```

## 📊 Estructura de Datos - Ejemplo

### ConfigContext (Lo que carga la app)

```javascript
{
  business: {
    id: 1,
    name: "Mi Pollería",
    type: {
      name: "chicken_shop",
      display: "Pollería",
      icon: "egg"
    }
  },
  settings: {
    colors: {
      primary: "#ef4444",
      secondary: "#fbbf24"
    },
    currency: "MXN",
    tax: { enabled: false, rate: 0 },
    features: {
      tables: false,
      delivery: true,
      loyaltyPoints: false
    }
  },
  modules: {
    sales: [
      { code: "quick_sale", name: "Venta Rápida", ... },
      { code: "sales_history", name: "Historial", ... }
    ],
    inventory: [ ... ],
    operations: [ ... ]
  },
  enabledModules: ["quick_sale", "inventory", "delivery", "sales_reports"]
}
```

## 🔧 Configuración Local

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
npx expo install
npx expo start
```

## 📞 Próximas Fases

### Fase 2
- [ ] Rutas de sales, inventory, products, auth
- [ ] Pantallas de venta rápida
- [ ] Gestión de inventario completa
- [ ] Sistema de usuarios/empleados

### Fase 3
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Reportes avanzados (gráficos, análisis)
- [ ] Programa de puntos/lealtad
- [ ] Integración con pasarelas de pago

### Fase 4
- [ ] App iOS (además de Android)
- [ ] PWA web para desktop
- [ ] Backups automáticos
- [ ] Multi-idioma

## 📚 Documentación Adicional

- `/backend/README.md` - Instalación en VPS
- `/frontend/SETUP_REACT_NATIVE.md` - Configuración React Native
- `/backend/database/schema.sql` - Esquema SQL
- Este archivo - Arquitectura general

## ✅ Verificación

Para verificar que todo está corriendo:

```bash
# Backend
curl http://localhost:3000/api/health

# Frontend
npx expo start -c

# Base de datos
psql -U usuario -d business_db
\dt
SELECT COUNT(*) FROM modules;
```

---

**Última actualización**: 2025-10-29
**Versión**: 1.0.0 (Alpha)
