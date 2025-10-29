# 📋 Recomendaciones y Mejores Prácticas del Proyecto

## 🎯 Principios Fundamentales

### 1. **Modularidad Dinámica**
- Cada negocio activa solo los módulos que necesita
- Los módulos NO se cargan si están desactivados
- La navegación se adapta automáticamente
- Cambios se aplican sin reiniciar la app

### 2. **Sincronización en Tiempo Real**
- Backend: actualiza base de datos
- Frontend: recarga ConfigContext
- Navegación: se re-renderiza
- UI: muestra/oculta módulos

### 3. **Aislamiento de Datos**
- Cada negocio tiene datos 100% aislados
- Usuarios solo ven su negocio
- Las queries siempre filtran por business_id
- No hay filtrado en frontend (seguridad en backend)

### 4. **Transacciones en Inventario**
- Cada venta actualiza stock automáticamente
- Se registra historial completo
- Si falla → rollback de toda la transacción
- Nunca se permite stock negativo

## 🏗️ Arquitectura Recomendada

### Backend Stack
```
Node.js 20 (LTS)
├── Express 4.18+
├── PostgreSQL 14+
├── JWT para autenticación
├── bcrypt para contraseñas
└── PM2 para producción
```

### Frontend Stack
```
React Native + Expo
├── React Navigation (routing)
├── Context API (estado global)
├── AsyncStorage (caché local)
├── Axios (HTTP requests)
└── Material Icons (UI)
```

### Base de Datos
```
PostgreSQL
├── 18 tablas relacionadas
├── Foreign keys con ON DELETE CASCADE
├── Índices en queries frecuentes
└── JSONB para configuración flexible
```

## 📁 Estructura de Carpetas Recomendada

### Backend
```
backend/
├── config/
│   ├── database.js          # Pool de conexión
│   └── constants.js         # Constantes de la app
├── middleware/
│   ├── auth.js              # Autenticación JWT
│   ├── validation.js        # Validación de datos
│   └── errorHandler.js      # Manejo centralizado de errores
├── routes/
│   ├── index.js             # Exporta todas las rutas
│   ├── config.js            # Configuración de módulos ✨
│   ├── auth.js              # Autenticación y registro
│   ├── sales.js             # Ventas y órdenes
│   ├── inventory.js         # Gestión de inventario
│   ├── products.js          # Gestión de productos
│   └── users.js             # Gestión de usuarios/empleados
├── services/
│   ├── inventoryService.js  # Lógica de inventario ✨
│   ├── salesService.js      # Lógica de ventas
│   ├── authService.js       # Lógica de autenticación
│   └── reportService.js     # Generación de reportes
├── utils/
│   ├── validators.js        # Funciones de validación
│   ├── helpers.js           # Funciones auxiliares
│   └── logger.js            # Logging centralizado
├── database/
│   ├── schema.sql           # Estructura de BD
│   ├── seed.sql             # Datos iniciales
│   └── migrations/          # Scripts de migración futura
├── scripts/
│   ├── migrate.js           # Ejecutar migraciones
│   ├── seed.js              # Cargar datos iniciales
│   └── reset.js             # Resetear BD (dev only)
├── .env.example             # Plantilla de variables
├── .env.local               # Variables locales (NO git)
├── .gitignore               # Archivos a ignorar
├── .env.production          # Variables producción (NO git)
├── server.js                # Punto de entrada
├── package.json
└── README.md
```

### Frontend
```
frontend/
├── app.json                           # Config Expo
├── App.js                             # Punto de entrada principal
├── app/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── home/
│   │   │   ├── HomeScreen.js
│   │   │   └── DashboardScreen.js
│   │   ├── sales/
│   │   │   ├── QuickSaleScreen.js
│   │   │   ├── SalesHistoryScreen.js
│   │   │   └── CashierScreen.js
│   │   ├── inventory/
│   │   │   ├── InventoryScreen.js
│   │   │   ├── ProductDetailScreen.js
│   │   │   └── StockAdjustmentScreen.js
│   │   ├── restaurant/
│   │   │   ├── TablesScreen.js
│   │   │   ├── OrdersScreen.js
│   │   │   └── KitchenDisplayScreen.js
│   │   ├── delivery/
│   │   │   ├── DeliveryScreen.js
│   │   │   └── TrackingScreen.js
│   │   ├── settings/
│   │   │   ├── SettingsScreen.js    # ✨ Configuración de módulos
│   │   │   ├── ProfileScreen.js
│   │   │   └── EmployeesScreen.js
│   │   └── reports/
│   │       ├── ReportsScreen.js
│   │       ├── SalesReportScreen.js
│   │       └── InventoryReportScreen.js
│   ├── navigation/
│   │   ├── RootNavigator.js          # Navigator raíz
│   │   ├── AuthNavigator.js          # Stack de auth
│   │   ├── AppNavigator.js           # Stack de app
│   │   └── DynamicNavigator.js       # ✨ Navegación dinámica
│   ├── contexts/
│   │   ├── AuthContext.js            # Estado de autenticación
│   │   ├── ConfigContext.js          # ✨ Configuración dinámica
│   │   └── ThemeContext.js           # Temas y colores
│   ├── services/
│   │   ├── api.js                    # Cliente HTTP centralizado
│   │   ├── configService.js
│   │   ├── salesService.js
│   │   ├── inventoryService.js
│   │   ├── authService.js
│   │   └── storageService.js         # AsyncStorage helpers
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── LoadingSpinner.js
│   │   │   └── ErrorBoundary.js
│   │   ├── sales/
│   │   │   ├── ProductSelector.js
│   │   │   ├── CartSummary.js
│   │   │   └── PaymentMethod.js
│   │   ├── inventory/
│   │   │   ├── ProductCard.js
│   │   │   ├── StockIndicator.js
│   │   │   └── InventoryList.js
│   │   └── restaurant/
│   │       ├── TableGrid.js
│   │       ├── TableCard.js
│   │       └── OrderItem.js
│   ├── hooks/
│   │   ├── useConfig.js              # ✨ Hook para Config
│   │   ├── useAuth.js
│   │   ├── useSales.js
│   │   ├── useInventory.js
│   │   └── useTheme.js
│   ├── utils/
│   │   ├── formatters.js             # Formato de datos
│   │   ├── validators.js             # Validación
│   │   ├── helpers.js                # Funciones auxiliares
│   │   └── constants.js              # Constantes globales
│   └── styles/
│       ├── colors.js                 # Paleta de colores
│       ├── typography.js             # Estilos de texto
│       ├── spacing.js                # Espaciado
│       └── themes.js                 # Temas por negocio
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── app.json
└── README.md
```

## 🔑 Convenciones de Código

### Nombres de Archivos
```
- Componentes React: PascalCase (Button.js)
- Servicios/utilidades: camelCase (apiService.js)
- Constantes: UPPER_SNAKE_CASE (API_BASE_URL)
- Hooks: useHookName (useConfig.js)
```

### Nombres de Variables
```
// Backend
- Tabla: singular lowercase (user, product, sale)
- Variable: camelCase (businessId, currentStock)
- Constante: UPPER_SNAKE_CASE (MAX_STOCK, DEFAULT_TAX)

// Frontend
- State: camelCase (isLoading, moduleList)
- Props: camelCase (onPress, isVisible)
- Contexto: PascalCase (ConfigContext)
```

### Funciones
```
// Backend
async function updateStockAfterSale(saleId) { }
async function getLowStockProducts(businessId) { }

// Frontend
const loadConfig = async () => { }
const toggleModule = (moduleCode) => { }
```

### Error Handling
```javascript
// Backend - siempre retornar error estructurado
try {
  // código
} catch (error) {
  console.error('Descripción del error:', error);
  res.status(500).json({ 
    error: 'Mensaje para el usuario',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

// Frontend - mostrar alerts al usuario
try {
  // código
} catch (error) {
  Alert.alert('Error', error.response?.data?.error || 'Error desconocido');
  console.error('Error en operación:', error);
}
```

## 🔒 Seguridad - Reglas Críticas

### 1. **Validación en Backend**
```javascript
// ✅ CORRECTO
router.post('/sales', authenticateToken, (req, res) => {
  const { products, total } = req.body;
  
  // Validar tipos
  if (!Array.isArray(products) || typeof total !== 'number') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  
  // Validar rango
  if (total < 0) {
    return res.status(400).json({ error: 'Total no puede ser negativo' });
  }
  
  // Usar businessId del token, NO del request
  const businessId = req.user.businessId;
  // ...
});

// ❌ INCORRECTO
const businessId = req.body.businessId; // Nunca confíes en esto
```

### 2. **Filtrado de Datos**
```javascript
// ✅ CORRECTO - Filtrar por business_id en TODAS las queries
const result = await db.query(
  `SELECT * FROM products WHERE business_id = $1 AND is_active = true`,
  [req.user.businessId]
);

// ❌ INCORRECTO - Sin filtro de negocio
const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
```

### 3. **Autenticación**
```javascript
// ✅ CORRECTO - Token en header
const token = req.headers['authorization']?.split(' ')[1];

// ✅ CORRECTO - Validar antes de usar
if (!token) return res.status(401).json({ error: 'Token requerido' });

// ✅ CORRECTO - No exponer ID de usuario en logs
console.log('Usuario autenticado'); // Bien
console.log(`Usuario ${userId} autenticado`); // Malo si userId es sensible
```

### 4. **Variables de Entorno**
```bash
# ✅ CORRECTO
API_KEY=secreta_aqui
JWT_SECRET=clave_muy_larga_y_aleatoria_aqui

# ✅ CORRECTO - Nunca en git
.env
.env.local
.env.production

# ❌ INCORRECTO
const API_KEY = 'secreto'; // En el código
process.env.API_KEY directamente en lógica crítica sin validar
```

## 📊 Recomendaciones de Base de Datos

### Queries Recomendadas
```sql
-- ✅ CON índices
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_inventory_product ON inventory(product_id);

-- ✅ Usar COALESCE para evitar nulls
SELECT COALESCE(SUM(total), 0) as revenue FROM sales WHERE business_id = $1;

-- ✅ Usar ON DELETE CASCADE para limpiar datos
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
```

### Transacciones
```javascript
// ✅ CORRECTO - Transacción con rollback
const client = await db.pool.connect();
try {
  await client.query('BEGIN');
  
  // Hacer cambios
  await client.query('UPDATE inventory ...');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## 🎨 Recomendaciones UI/UX

### Temas por Tipo de Negocio
```javascript
const BUSINESS_THEMES = {
  restaurant: {
    primary: '#e74c3c',
    secondary: '#34495e',
    accent: '#f39c12'
  },
  bakery: {
    primary: '#d4a574',
    secondary: '#fff5e6',
    accent: '#8b6f47'
  },
  chicken_shop: {
    primary: '#ff6b35',
    secondary: '#fff7e6',
    accent: '#ffa500'
  },
  // ... más tipos
};
```

### Pantallas Críticas
```javascript
// QuickSaleScreen - Lo más importante
// Debe ser RÁPIDO y simple
// - Buscar producto
// - Agregar cantidad
// - Ver total
// - Pagar

// InventoryScreen - Información clara
// - Stock actual
// - Productos con stock bajo (rojo)
// - Últimas ventas
// - Alertas

// SettingsScreen - Cambios de módulos
// - Lista de módulos
// - Toggle para cada uno
// - Descripción breve
// - Módulos requeridos no pueden desactivarse
```

## 🚀 Performance

### Backend
```javascript
// ✅ Usar connection pooling
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000 });

// ✅ Comprimir respuestas
app.use(compression());

// ✅ Caché en headers
res.set('Cache-Control', 'public, max-age=300'); // 5 minutos

// ❌ Evitar N+1 queries
// Malo: loop de productos y query por cada uno
// Bueno: una query con JOIN
```

### Frontend
```javascript
// ✅ Memoizar contexto
export const useConfig = useCallback(() => { ... }, [config]);

// ✅ Lazy load de pantallas
const TablesScreen = React.lazy(() => import('./TablesScreen'));

// ✅ Usar FlatList con keyExtractor
<FlatList 
  data={items} 
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <Item data={item} />}
/>

// ❌ Evitar
renderItem={() => <Item />} // Sin keyExtractor
<ScrollView> {items.map()} </ScrollView> // Usar FlatList en su lugar
```

## 📝 Testing Recomendado

### Backend
```javascript
// Usar Jest + Supertest
describe('Sales API', () => {
  it('should create sale and update inventory', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send(saleData);
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

### Frontend
```javascript
// Usar Jest + React Native Testing Library
describe('QuickSaleScreen', () => {
  it('should render products list', async () => {
    const { getByText } = render(<QuickSaleScreen />);
    expect(getByText('Vender')).toBeTruthy();
  });
});
```

## 📚 Documentación Recomendada

### Cada Pantalla Debe Tener
```javascript
/**
 * QuickSaleScreen.js
 * 
 * Pantalla para registrar ventas rápidas
 * 
 * Props:
 *   - navigation: React Navigation
 * 
 * Estado:
 *   - cart: Productos agregados
 *   - total: Total de la venta
 *   - loading: Estado de carga
 * 
 * Flujo:
 *   1. Usuario busca producto
 *   2. Agrega a carrito
 *   3. Confirma venta
 *   4. Se actualiza inventario
 * 
 * Módulos requeridos:
 *   - quick_sale (obligatorio)
 *   - inventory (para validar stock)
 * 
 * API Endpoints:
 *   - POST /api/sales
 *   - GET /api/products
 */
```

### Cada Servicio Debe Documentar
```javascript
/**
 * inventoryService.js
 * 
 * Servicio de gestión de inventario
 * 
 * Métodos:
 *   - updateStockAfterSale(saleItems, userId)
 *     Actualiza stock después de una venta
 *     Retorna: { success: true }
 *     Lanza: Error si stock insuficiente
 * 
 *   - getLowStockProducts(businessId)
 *     Obtiene productos con stock bajo
 *     Retorna: Array de productos
 * 
 * Transacciones:
 *   - Usa transacciones BD para integridad
 *   - Rollback automático en error
 */
```

## ✅ Checklist de Implementación

### Por cada nueva ruta
- [ ] Autenticación con JWT
- [ ] Validación de datos de entrada
- [ ] Filtrado por business_id
- [ ] Manejo de errores
- [ ] Logs informativos
- [ ] Documentación JSDoc
- [ ] Tests unitarios

### Por cada nueva pantalla
- [ ] Integración con ConfigContext
- [ ] Verificar que módulo está activo
- [ ] Manejo de estados (loading, error, data)
- [ ] Caché con AsyncStorage
- [ ] Interfaz responsive
- [ ] Tests de componentes
- [ ] Documentación en el archivo

### Por cada cambio de BD
- [ ] Crear migración
- [ ] Actualizar schema.sql
- [ ] Actualizar seed.sql
- [ ] Crear índices si necesario
- [ ] Documentar cambios

## 🐛 Debugging

### Backend
```bash
# Ver logs en tiempo real
pm2 logs business-api

# Conectar a BD directamente
psql -U usuario -d business_db

# Ver queries lentas
SET log_min_duration_statement = 1000; -- 1 segundo
```

### Frontend
```javascript
// ConfigContext - ver qué se carga
console.log('Config cargado:', config);
console.log('Módulos activos:', config?.enabledModules);

// Ver dónde se invoca API
import axios from 'axios';
axios.interceptors.request.use(request => {
  console.log('API Request:', request.url);
  return request;
});
```

## 🎓 Recursos Recomendados

- **PostgreSQL**: https://www.postgresql.org/docs/
- **Express.js**: https://expressjs.com/
- **React Native**: https://reactnative.dev/
- **JWT**: https://jwt.io/
- **PM2**: https://pm2.keymetrics.io/

---

**Última actualización**: 2025-10-29
**Versión**: 1.0.0
