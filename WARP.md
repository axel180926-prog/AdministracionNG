# WARP.md

Este archivo proporciona orientación a WARP (warp.dev) al trabajar con código en este repositorio.

---

## Descripción General del Proyecto

**AdministracionNG** es un sistema modular dinámico de administración de negocios que se adapta automáticamente a diferentes tipos de negocio (Restaurante, Panadería, Pollería, Taquería, Carnicería, Heladería, etc.). El sistema está construido con:
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React Native + Expo + Context API
- **Arquitectura**: Multi-negocio con datos aislados, sincronización de inventario en tiempo real, autenticación JWT

---

## Comandos de Desarrollo Comunes

### Backend
```bash
npm run dev                    # Desarrollo con nodemon (recarga automática)
npm start                      # Servidor en producción
npm run db:migrate             # Crear/actualizar tablas de BD
npm run db:seed                # Cargar datos iniciales
```

### Frontend
```bash
npx expo start                 # Iniciar servidor de desarrollo
npx expo start --clear         # Limpiar caché y reiniciar
```

### Base de Datos (PostgreSQL)
```bash
psql -U usuario -d business_db        # Conectar a la base de datos
\dt                                    # Listar todas las tablas
SELECT * FROM business_modules;        # Verificar módulos activos
\q                                     # Salir
```

### Linting/TypeCheck
Actualmente no hay scripts explícitos de lint/typecheck configurados. Agrega ESLint/Prettier al proyecto si lo necesitas.

---

## Descripción General de la Arquitectura

### Concepto Central: Módulos Dinámicos
El sistema carga solo los módulos (características) habilitados para un negocio específico. Un restaurante obtiene módulos de "mesas" y "órdenes", mientras que una panadería obtiene módulos de "producción" y "recetas".

### Componentes Clave

#### 1. ConfigContext (Frontend - **Crítico**)
**Ubicación**: `frontend/contexts/ConfigContext.js`

- Carga la configuración del negocio desde la API al iniciar la app
- Proporciona `config`, `loading`, `error`, `isModuleActive()` y `reloadConfig()` a toda la app
- Utilizado por DynamicNavigator para determinar qué pantallas renderizar
- Cachea la configuración localmente en AsyncStorage para funcionalidad offline

**Uso en pantallas**:
```javascript
const { config, isModuleActive, reloadConfig } = useConfig();
if (!isModuleActive('codigo_modulo')) return <Text>No disponible</Text>;
```

#### 2. DynamicNavigator (Frontend - **Muy Importante**)
**Ubicación**: `frontend/navigation/DynamicNavigator.js`

- Navegador de pestañas inferiores que solo renderiza pantallas de módulos activos
- Se re-renderiza automáticamente cuando ConfigContext cambia
- Mapea códigos de módulos a componentes de pantalla usando objeto `MODULE_SCREENS`
- Siempre incluye SettingsScreen para gestión de módulos

#### 3. InventoryService (Backend - **Crítico**)
**Ubicación**: `backend/services/inventoryService.js`

- Gestiona todas las actualizaciones de inventario con transacciones ACID
- Métodos clave:
  - `updateStockAfterSale()` - Reduce stock después de venta, previene negativos
  - `addStock()` - Añade inventario con registro de usuario
  - `getLowStockProducts()` - Alertas de stock bajo
  - `getWeeklyInventoryReport()` - Análisis
- Todos los cambios se registran en tabla `inventory_movements` para auditoría completa
- Usa transacciones de BD (BEGIN/COMMIT/ROLLBACK) para garantizar consistencia

#### 4. ConfigRoute (Backend)
**Ubicación**: `backend/routes/config.js`

- `GET /api/config/business-config` - Retorna configuración completa del negocio
- `GET /api/config/business-types` - Lista todos los tipos de negocio disponibles
- `POST /api/config/toggle-module` - Habilita/deshabilita un módulo (dispara recarga de ConfigContext)
- `PUT /api/config/business-settings` - Actualiza configuración visual/operacional del negocio

---

## Modelo de Datos - Tablas Principales

| Tabla | Propósito |
|-------|----------|
| `business_modules` ⭐ | Qué módulos están activos en cada negocio (controla la UI) |
| `business_settings` ⭐ | Colores del negocio, configuración fiscal, banderas de características |
| `inventory_movements` ⭐ | Registro completo de auditoría de todos los cambios de inventario |
| `businesses` | Soporte multi-negocio con datos aislados |
| `business_types` | Tipos: restaurante, panadería, pollería, etc. |
| `modules` | Módulos disponibles en el sistema |
| `users` | Empleados/gerentes con roles y permisos |
| `products` | Catálogo de productos |
| `inventory` | Niveles de stock actuales |
| `sales` | Transacciones de ventas |
| `sale_items` | Items de cada venta |
| `tables` | Mesas del restaurante (si módulo está activo) |
| `orders` | Órdenes del restaurante (si módulo está activo) |
| `deliveries` | Seguimiento de entregas (si módulo está activo) |

**Regla de Seguridad Crítica**: Toda consulta DEBE filtrar por `business_id` para mantener aislamiento de datos.

---

## Flujos de Trabajo Clave

### Flujo 1: Cambio de Módulo (Cambios en Tiempo Real)
```
Usuario activa/desactiva módulo en SettingsScreen
    ↓ (POST /api/config/toggle-module)
Backend actualiza tabla business_modules
    ↓ (SettingsScreen llama a reloadConfig())
ConfigContext obtiene nueva config del API
    ↓ (ConfigContext notifica a todos los suscriptores)
DynamicNavigator se re-renderiza con nuevos módulos
    ↓
Pestañas de navegación inferiores aparecen/desaparecen instantáneamente
```

### Flujo 2: Registrar una Venta
```
Usuario agrega productos en QuickSaleScreen
    ↓ (POST /api/sales)
Backend inicia transacción
    ↓
Crea filas sale + sale_items
    ↓
InventoryService.updateStockAfterSale()
    ↓
Reduce stock del producto, registra en inventory_movements
    ↓ (Transacción se confirma)
Frontend actualiza pantalla de inventario
```

### Flujo 3: Inicio de App
```
App.js verifica token en AsyncStorage
    ↓
Si autenticado: ConfigProvider carga config del negocio
    ↓ (GET /api/config/business-config)
ConfigContext cachea config localmente
    ↓
DynamicNavigator determina qué pantallas mostrar
    ↓
Solo módulos activos visibles en pestañas inferiores
```

---

## Reglas de Seguridad y Validación

### Endpoints del Backend
1. **Siempre validar entrada** - Nunca confíes en req.body directamente
2. **Siempre usar business_id del token JWT** - NUNCA del cuerpo del request:
   ```javascript
   const businessId = req.user.businessId;  // ✓ Correcto
   const businessId = req.body.businessId;  // ✗ Riesgo de seguridad
   ```
3. **Filtrar todas las consultas por business_id** - Previene fugas de datos:
   ```javascript
   SELECT * FROM products WHERE business_id = $1 AND id = $2
   ```
4. **Usar transacciones para operaciones multi-paso** - Previene inconsistencias:
   ```javascript
   BEGIN → Update1 → Update2 → COMMIT (o ROLLBACK en error)
   ```
5. **Prevenir inventario negativo** - Validar stock antes de venta

### Autenticación Frontend
- Tokens JWT almacenados en AsyncStorage
- Token expira en 7 días (configurado en backend)
- Token Bearer en encabezado Authorization: `Authorization: Bearer {token}`

---

## Tipos de Negocio y Módulos Habilitados

| Tipo de Negocio | Módulos por Defecto |
|---|---|
| Restaurante | quick_sale, inventory, tables, orders, waiters, delivery |
| Pollería | quick_sale, inventory, delivery, customers |
| Panadería | quick_sale, inventory, production, recipes, customers |
| Taquería | quick_sale, inventory, (tables opcional), delivery |
| Carnicería | quick_sale, inventory, suppliers |
| Heladería | quick_sale, inventory, customers |
| Puesto de Tacos | quick_sale, inventory, delivery |
| Abarrotes | quick_sale, inventory, suppliers, customers |

---

## Convenciones de Nombres

- **Componentes React**: PascalCase (e.g., `QuickSaleScreen.js`, `SettingsScreen.js`)
- **Servicios**: camelCase (e.g., `inventoryService.js`, `api.js`)
- **Constantes**: UPPER_SNAKE_CASE (e.g., `MAX_STOCK_ALERT`, `JWT_EXPIRES_IN`)
- **Hooks**: `useNombreHook` (e.g., `useConfig.js`)
- **Funciones async**: camelCase descriptivo (e.g., `updateStockAfterSale`, `toggleModule`)

---

## Reglas Importantes de Documentación Existente

### De COPILOT_INSTRUCTIONS.md (Crítico)
- **Validación en backend**: Nunca confíes en datos del frontend
- **Filtrado de Business ID**: Toda consulta debe tener `WHERE business_id = $1`
- **JWT sobre cuerpo del request**: Siempre extrae businessId del token
- **Transacciones de inventario**: Todas las operaciones multi-paso deben usar BEGIN/COMMIT/ROLLBACK
- **Sin stock negativo**: Valida antes de permitir reducción de inventario
- **Manejo de errores**: Backend retorna `{ error: 'mensaje' }`, Frontend usa `Alert.alert()`

### De ARQUITECTURA.md (Arquitectura)
- **ConfigContext** es el corazón del sistema - se recarga cuando cambian módulos
- **DynamicNavigator** se adapta automáticamente basado en enabledModules
- **InventoryService** garantiza integridad transaccional
- **UI basada en módulos** - cada negocio solo ve sus características habilitadas

---

## Referencia de Estructura de Archivos

```
backend/
├── server.js                           # Punto de entrada de Express
├── config/
│   └── database.js                    # Conexión a PostgreSQL
├── middleware/
│   └── auth.js                        # Middleware de autenticación JWT
├── routes/
│   ├── config.js                      # ⭐ Endpoints de configuración dinámica
│   ├── sales.js                       # (por hacer) Endpoints de ventas
│   ├── inventory.js                   # (por hacer) Endpoints de inventario
│   └── products.js                    # (por hacer) Endpoints de productos
├── services/
│   └── inventoryService.js            # ⭐ Lógica de negocio del inventario
├── database/
│   ├── schema.sql                     # ⭐ Esquema de BD (18 tablas)
│   └── seed.sql                       # Datos iniciales (tipos de negocio, módulos)
├── package.json
└── .env.example

frontend/
├── App.js                             # ⭐ Punto de entrada, verificación auth, enrutamiento
├── contexts/
│   └── ConfigContext.js               # ⭐ Estado global de configuración
├── navigation/
│   └── DynamicNavigator.js            # ⭐ Navegador de pestañas adaptativo
├── screens/
│   ├── LoginScreen.js                 # Autenticación
│   ├── SplashScreen.js                # Pantalla de inicio
│   ├── QuickSaleScreen.js             # Punto de venta (todos los negocios)
│   ├── TablesScreen.js                # Específico de restaurante
│   ├── InventoryScreen.js             # Gestión de stock
│   ├── OrdersScreen.js                # Órdenes de restaurante
│   ├── DeliveryScreen.js              # Seguimiento de entregas
│   ├── ProductionScreen.js            # Producción de panadería
│   └── SettingsScreen.js              # UI de cambio de módulos ⭐
├── services/
│   └── api.js                         # Cliente HTTP con interceptores
└── app.json                           # Configuración de Expo
```

---

## Consejos de Desarrollo

### Al Agregar una Nueva Característica
1. **En Backend**: Agrega ruta con middleware de auth + filtrado de businessId + validación
2. **En Frontend**: Verifica que módulo está activo en pantalla + usa ConfigContext
3. **En Base de Datos**: Asegura pista de auditoría (inventory_movements) si afecta stock
4. **Prueba**: Verifica aislamiento multi-negocio - no accedas datos de otros negocios

### Al Depurar
- Verifica `pm2 logs business-api` para errores del backend
- Verifica consola de React Native para errores del frontend
- Verifica que businessId se extrae correctamente del JWT en backend
- Asegura que inventory_movements captura todos los cambios de stock

### Antes de Hacer Commit
- Valida que filtrado por business_id está presente en todas las consultas
- Verifica que operaciones de inventario usan transacciones
- Asegura que mensajes de error son amigables para el usuario
- Verifica que recarga de config funciona después de cambios en business_modules

---

## Documentación Externa

- `ARQUITECTURA.md` - Descripción general de arquitectura del sistema (detallado)
- `COPILOT_INSTRUCTIONS.md` - Reglas para generación de código con IA
- `.copilot-context` - Contexto para GitHub Copilot
- `backend/README.md` - Instrucciones de despliegue en VPS
- `frontend/SETUP_REACT_NATIVE.md` - Detalles de configuración de React Native
- `RECOMENDACIONES.md` - Mejores prácticas y patrones de código
