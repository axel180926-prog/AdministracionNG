# 📊 CONTEXTO COMPLETO - AdministracionNG

**Fecha**: 2025-10-29  
**Estado**: Fase 1 ✅ Completada | Fase 0 ⏳ Pendiente (VPS Setup)  
**Próximo Paso CRÍTICO**: Ejecutar `setup-vps.ps1` (10 minutos)

---

## 🎯 ¿Qué es AdministracionNG?

**Sistema adaptativo multi-negocio** que cambia su interfaz y funcionalidades según el tipo de negocio:
- 🍽️ Restaurantes
- 🍗 Pollerías  
- 🥖 Panaderías
- 🌮 Taquerías
- Y 6 tipos más

**Características clave:**
- Módulos dinámicos (se activan/desactivan sin reiniciar)
- Multi-negocio (datos aislados por negocio)
- Inventario automático con transacciones ACID
- API REST + React Native Mobile

---

## ✅ FASE 1 - COMPLETADA

| Item | Estado | Archivos |
|------|--------|----------|
| Documentación | ✅ | 10 archivos (.md) |
| Arquitectura | ✅ | ARQUITECTURA.md |
| Base de datos | ✅ | 18 tablas en schema.sql |
| Backend base | ✅ | server.js + routes/config.js |
| Autenticación JWT | ✅ | middleware/auth.js |
| GitHub setup | ✅ | SSH configurado |

---

## 🔴 FASE 0 - VPS SETUP (CRÍTICO - HACER AHORA)

**¿Por qué?** Necesitas PostgreSQL y herramientas en tu máquina para continuar

**Qué hace:**
```powershell
# En PowerShell admin:
.\setup-vps.ps1
```

- Instala Node.js 20 LTS
- Instala PostgreSQL 14
- Configura SSH
- Instala PM2 y Nginx
- **Solicita contraseña PostgreSQL** (guárdala)

**Tiempo:** ~10 minutos

---

## 🟡 FASE 2 - BACKEND APIs (PRÓXIMAS SEMANAS)

### Prioridad 1️⃣ - AUTH API (3 horas)
**Archivo:** `backend/routes/auth.js` + `backend/services/authService.js`

Rutas necesarias:
- `POST /api/auth/register` - Crear usuario
- `POST /api/auth/login` - Iniciar sesión + JWT
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh-token` - Renovar JWT
- `GET /api/auth/me` - Usuario actual

Requisitos:
- ✅ Hash bcrypt
- ✅ JWT tokens con expiración
- ✅ Validar email única
- ✅ Filtrar por business_id

---

### Prioridad 2️⃣ - PRODUCTS API (2 horas)
**Archivo:** `backend/routes/products.js`

Rutas:
- `GET /api/products` - Listar todos
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener detalle
- `PUT /api/products/:id` - Actualizar
- `DELETE /api/products/:id` - Eliminar

Requisitos:
- ✅ Filtrar por business_id
- ✅ Validar nombre, precio
- ✅ SKU único por negocio
- ✅ Categorías automáticas

---

### Prioridad 3️⃣ - SALES API (4 horas) - MÁS COMPLEJO
**Archivo:** `backend/routes/sales.js`

Rutas:
- `POST /api/sales` - Crear venta + descontar inventario
- `GET /api/sales` - Listar ventas
- `GET /api/sales/:id` - Detalle de venta
- `PATCH /api/sales/:id/cancel` - Cancelar + devolver stock

Requisitos:
- ✅ **TRANSACCIONES** (BEGIN/COMMIT/ROLLBACK)
- ✅ Usar `inventoryService.updateStockAfterSale()`
- ✅ Validar stock disponible
- ✅ Registrar en inventory_movements
- ✅ Calcular subtotal + tax + discount

---

## 🎯 COMANDO MÁS IMPORTANTE AHORA

```powershell
# En C:\Users\jovan\Desktop\AdministracionNG
# Con PowerShell como ADMIN

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-vps.ps1
```

**Esto te prepara para comenzar con auth.js**

---

## 🔑 REGLAS CRÍTICAS (NUNCA ROMPER)

### 1. **businessId SIEMPRE del JWT**
```javascript
// ✅ CORRECTO
const businessId = req.user.businessId;

// ❌ MALO
const businessId = req.body.businessId;
```

### 2. **FILTRAR POR business_id EN TODAS LAS QUERIES**
```javascript
// ✅ CORRECTO
SELECT * FROM products WHERE business_id = $1
  
// ❌ MALO  
SELECT * FROM products WHERE id = $1
```

### 3. **TRANSACCIONES PARA INVENTARIO**
```javascript
// ✅ CORRECTO
const client = await db.pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE inventory...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
}
```

---

**¿Listo?** Ejecuta `setup-vps.ps1` ahora 🚀