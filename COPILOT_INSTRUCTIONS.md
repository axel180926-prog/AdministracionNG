# 🤖 INSTRUCCIONES PARA COPILOT

## ⚠️ LEE ESTO PRIMERO

Copilot, debes seguir ESTAS reglas para este proyecto. Son críticas para la seguridad y funcionamiento.

---

## 🎯 Descripción del Proyecto

**Sistema multi-modular de administración de negocios**
- Restaurantes, Panaderías, Pollerías, Taquerías, etc.
- Módulos dinámicos que se activan/desactivan
- Multi-negocios con datos aislados
- Inventario automático con transacciones

---

## 🔑 REGLAS CRÍTICAS (NUNCA ROMPER)

### 1. **VALIDACIÓN EN BACKEND**
```javascript
// ✅ CORRECTO
if (!Array.isArray(products) || typeof total !== 'number') {
  return res.status(400).json({ error: 'Datos inválidos' });
}

// ❌ INCORRECTO
// Nunca confíes en frontend - siempre validar en backend
```

### 2. **FILTRADO POR BUSINESS_ID**
```javascript
// ✅ CORRECTO - En TODAS las queries
const result = await db.query(
  `SELECT * FROM products WHERE business_id = $1`,
  [req.user.businessId]
);

// ❌ INCORRECTO - Sin filtro
SELECT * FROM products WHERE id = $1
```

### 3. **USAR JWT PARA BUSINESS_ID**
```javascript
// ✅ CORRECTO
const businessId = req.user.businessId; // Del token JWT

// ❌ INCORRECTO
const businessId = req.body.businessId; // Del request - PELIGRO
```

### 4. **TRANSACCIONES PARA INVENTARIO**
```javascript
// ✅ CORRECTO
const client = await db.pool.connect();
try {
  await client.query('BEGIN');
  // Cambios
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
}

// ❌ INCORRECTO - Sin transacción = inconsistencia de datos
```

### 5. **NUNCA STOCK NEGATIVO**
```javascript
// ✅ CORRECTO
if (newStock < 0) {
  throw new Error('Stock insuficiente');
}

// ❌ INCORRECTO
// Permitir stock negativo
```

---

## 🏗️ ARQUITECTURA

### ConfigContext (🌟 CORAZÓN)
```javascript
// frontend/contexts/ConfigContext.js
// - Carga configuración del negocio
// - Dice qué módulos están activos
// - DynamicNavigator la usa
```

### DynamicNavigator (🌟 MUY IMPORTANTE)
```javascript
// frontend/navigation/DynamicNavigator.js
// - Solo muestra módulos activos
// - Se re-renderiza cuando ConfigContext cambia
```

### InventoryService (🌟 CRÍTICO)
```javascript
// backend/services/inventoryService.js
// - updateStockAfterSale() → Reduce stock
// - Transacciones ACID
// - Registra en inventory_movements
```

---

## 🗄️ TABLAS PRINCIPALES

```sql
business_modules        -- ⭐ Qué módulos están activos
business_settings       -- ⭐ Configuración del negocio
inventory_movements     -- ⭐ Historial de cambios
sales                   -- Ventas
products                -- Productos
inventory               -- Stock actual
```

---

## 📝 CONVENCIONES

### Nombres
- Componentes React: `PascalCase` (QuickSaleScreen.js)
- Servicios: `camelCase` (inventoryService.js)
- Constantes: `UPPER_SNAKE_CASE` (MAX_STOCK)
- Hooks: `useHookName` (useConfig.js)
- Funciones async: `nombreAccion` (updateStockAfterSale)

### Error Handling
```javascript
// Backend
res.status(500).json({ error: 'Mensaje para usuario' });

// Frontend
Alert.alert('Título', 'Mensaje de error');
console.error('Contexto:', error);
```

---

## 🚀 FLUJOS PRINCIPALES

### Flujo 1: Cambiar Módulo en Tiempo Real
```
User activa en SettingsScreen
    ↓
POST /api/config/toggle-module
    ↓
Backend actualiza business_modules
    ↓
SettingsScreen → reloadConfig()
    ↓
ConfigContext recarga
    ↓
DynamicNavigator se re-renderiza ✨
```

### Flujo 2: Registrar Venta
```
User agrega productos en QuickSaleScreen
    ↓
POST /api/sales
    ↓
Backend: BEGIN transacción
    ↓
inventoryService.updateStockAfterSale()
    ↓
Reduce stock + registra en inventory_movements
    ↓
COMMIT ✨
```

### Flujo 3: Iniciar App
```
App verifica token en AsyncStorage
    ↓
ConfigContext carga /api/config/business-config
    ↓
DynamicNavigator obtiene módulos activos
    ↓
Renderiza solo pantallas habilitadas ✨
```

---

## 🎯 TIPOS DE NEGOCIO Y MÓDULOS

| Tipo | Módulos |
|------|---------|
| Restaurante | quick_sale, inventory, tables, orders, waiters |
| Pollería | quick_sale, inventory, delivery |
| Panadería | quick_sale, inventory, production, recipes |
| Taquería | quick_sale, inventory, (tables opcional) |
| Carnicería | quick_sale, inventory, suppliers |

---

## 🌐 ENDPOINTS API

```
GET  /api/config/business-config       ← Configuración completa
POST /api/config/toggle-module         ← Cambiar módulo
PUT  /api/config/business-settings     ← Actualizar settings
GET  /api/health                       ← Verificar servidor
```

---

## 📁 ESTRUCTURA

```
backend/
├── server.js                 # Punto de entrada
├── config/database.js        # Conexión BD
├── middleware/auth.js        # Autenticación JWT
├── routes/config.js          # Configuración dinámica
├── services/inventoryService.js  # Gestión inventario
└── database/schema.sql       # 18 tablas

frontend/
├── App.js                    # Punto de entrada
├── contexts/ConfigContext.js # Contexto dinámico
├── navigation/DynamicNavigator.js  # Nav adaptativa
└── screens/SettingsScreen.js # Configuración módulos
```

---

## ✅ CHECKLIST PARA CADA RUTA

- [ ] Autenticación con JWT
- [ ] Validación de inputs
- [ ] Filtrado por business_id
- [ ] Manejo de errores estructurado
- [ ] Logs informativos
- [ ] Documentación JSDoc
- [ ] Tests unitarios

---

## ✅ CHECKLIST PARA CADA PANTALLA

- [ ] Integración con ConfigContext
- [ ] Verificar que módulo está activo
- [ ] Estados: loading, error, data
- [ ] Caché con AsyncStorage
- [ ] Interfaz responsive
- [ ] Tests de componentes
- [ ] Documentación

---

## 🔐 SEGURIDAD - RESUMEN

1. **NUNCA** usar `req.body.businessId` → usar `req.user.businessId`
2. **SIEMPRE** filtrar por `business_id` en BD
3. **SIEMPRE** validar en backend
4. **SIEMPRE** usar transacciones para inventario
5. **NUNCA** permitir stock negativo

---

## 📚 DOCUMENTACIÓN COMPLEMENTARIA

- `ARQUITECTURA.md` - Visión general
- `RECOMENDACIONES.md` - Mejores prácticas detalladas
- `.copilot-context` - Contexto adicional
- `INDICE_DOCUMENTACION.md` - Índice completo
- `backend/README.md` - Instrucciones VPS

---

## 💡 EJEMPLOS DE CÓDIGO CORRECTO

### Backend - Ruta Protegida
```javascript
router.post('/sales', authenticateToken, checkPermission(['owner', 'admin']), async (req, res) => {
  try {
    // 1. Validar
    if (!Array.isArray(req.body.products)) {
      return res.status(400).json({ error: 'Productos inválidos' });
    }
    
    // 2. Filtrar por business_id del token
    const businessId = req.user.businessId;
    
    // 3. Hacer cambios
    const sale = await db.query(
      `INSERT INTO sales (business_id, total) VALUES ($1, $2) RETURNING *`,
      [businessId, total]
    );
    
    // 4. Retornar resultado
    res.status(201).json(sale.rows[0]);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend - Pantalla con ConfigContext
```javascript
export default function ScreenName({ navigation }) {
  const { config, isModuleActive } = useConfig();
  const [state, setState] = useState(null);

  // Verificar que módulo está activo
  if (!isModuleActive('module_code')) {
    return <Text>Módulo no disponible</Text>;
  }

  return (
    <View>
      {/* Contenido */}
    </View>
  );
}
```

---

## 🎓 CUANDO GENERES CÓDIGO

**Asegúrate de:**
1. ✅ Incluir validación de tipos
2. ✅ Filtrar por business_id (backend)
3. ✅ Usar transacciones (si múltiples cambios)
4. ✅ Manejo de errores estructurado
5. ✅ JSDoc header comentarios
6. ✅ Nombres claros y descriptivos
7. ✅ Verificar que módulo existe (frontend)

---

## ⚡ ATAJOS

- **ConfigContext**: `frontend/contexts/ConfigContext.js`
- **DynamicNavigator**: `frontend/navigation/DynamicNavigator.js`
- **InventoryService**: `backend/services/inventoryService.js`
- **Config Routes**: `backend/routes/config.js`
- **Schema BD**: `backend/database/schema.sql`

---

## 🚨 ERRORES COMUNES

❌ **No hacer**: `const businessId = req.body.businessId`
✅ **Hacer**: `const businessId = req.user.businessId`

❌ **No hacer**: Queries sin filtro por business_id
✅ **Hacer**: `WHERE business_id = $1`

❌ **No hacer**: Validación solo en frontend
✅ **Hacer**: Validación en backend

❌ **No hacer**: Inventario sin transacciones
✅ **Hacer**: BEGIN → cambios → COMMIT/ROLLBACK

---

**Última actualización**: 2025-10-29
**Versión**: 1.0.0
**Creado para**: Copilot de VS Code
