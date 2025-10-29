# 🚀 PLAN 5 FASES - BACKEND APIs

**Total estimado**: 13 horas de codificación  
**Timeline**: 1-2 semanas

---

## 📅 FASE 1: Auth API (3 horas)

**Archivos**: `backend/routes/auth.js` + `backend/services/authService.js`

### Tareas
- [ ] 1.1 Crear `authService.js` con métodos:
  - [ ] `register(email, password, firstName, lastName, businessId)`
  - [ ] `login(email, password)`
  - [ ] `validateToken(token)`
  - [ ] `refreshToken(oldToken)`
  - [ ] `hashPassword(password)` con bcrypt

- [ ] 1.2 Crear `auth.js` con rutas:
  - [ ] `POST /api/auth/register` - Crear usuario nuevo
  - [ ] `POST /api/auth/login` - Iniciar sesión + JWT
  - [ ] `POST /api/auth/logout` - Invalidar token
  - [ ] `POST /api/auth/refresh-token` - Renovar JWT expirado
  - [ ] `GET /api/auth/me` - Obtener usuario actual

- [ ] 1.3 Validaciones:
  - [ ] Email único en BD
  - [ ] Contraseña min 8 caracteres
  - [ ] JWT con exp 7 días
  - [ ] Filtrado por business_id

- [ ] 1.4 Testing en Postman:
  - [ ] Register funciona
  - [ ] Login devuelve token
  - [ ] Token funciona en /me
  - [ ] Refresh token funciona

- [ ] 1.5 GitHub:
  - [ ] git add . && git commit -m "Auth API implementada"

**Checklist antes de terminar**:
- [ ] Todos los endpoints prueban OK
- [ ] Validaciones en backend
- [ ] Tokens con exp correcta
- [ ] README_PROGRESO.md actualizado

---

## 📅 FASE 2: Products API (2 horas)

**Archivo**: `backend/routes/products.js`

### Tareas
- [ ] 2.1 Crear rutas GET:
  - [ ] `GET /api/products` - Listar todos
  - [ ] `GET /api/products/:id` - Obtener detalle
  - [ ] Paginación (limit, offset)
  - [ ] Búsqueda por nombre

- [ ] 2.2 Crear rutas POST/PUT/DELETE:
  - [ ] `POST /api/products` - Crear
  - [ ] `PUT /api/products/:id` - Actualizar
  - [ ] `DELETE /api/products/:id` - Eliminar

- [ ] 2.3 Validaciones:
  - [ ] Nombre requerido
  - [ ] Precio > 0
  - [ ] SKU único por business_id
  - [ ] Filtrado por business_id

- [ ] 2.4 Testing:
  - [ ] Crear 3 productos
  - [ ] Listar todos
  - [ ] Actualizar nombre
  - [ ] Eliminar uno

- [ ] 2.5 GitHub:
  - [ ] git commit -m "Products API implementada"

---

## 📅 FASE 3: Sales API (4 horas) ⭐ MÁS COMPLEJA

**Archivo**: `backend/routes/sales.js`

### Tareas
- [ ] 3.1 Ruta POST /api/sales - TRANSACCIONES:
  - [ ] Validar productos y cantidades
  - [ ] BEGIN transacción
  - [ ] Verificar stock disponible
  - [ ] Crear sale record
  - [ ] Crear sale_items
  - [ ] Llamar `inventoryService.updateStockAfterSale()`
  - [ ] Registrar en inventory_movements
  - [ ] COMMIT si todo OK
  - [ ] ROLLBACK si error

- [ ] 3.2 Rutas GET:
  - [ ] `GET /api/sales` - Listar todas (filtrar por business_id)
  - [ ] `GET /api/sales/:id` - Detalle de venta
  - [ ] `GET /api/sales/today` - Solo hoy

- [ ] 3.3 Ruta PATCH /api/sales/:id/cancel:
  - [ ] Verificar venta existe
  - [ ] Devolver stock a inventario
  - [ ] Registrar movimiento negativo
  - [ ] Marcar venta como cancelada

- [ ] 3.4 Validaciones:
  - [ ] Stock nunca negativo
  - [ ] Total = sum(item price * qty)
  - [ ] Transacciones ACID
  - [ ] Filtrado por business_id

- [ ] 3.5 Testing:
  - [ ] Vender 2 productos
  - [ ] Ver stock reducido
  - [ ] Cancelar venta
  - [ ] Ver stock restaurado

- [ ] 3.6 GitHub:
  - [ ] git commit -m "Sales API con transacciones implementada"

---

## 📅 FASE 4: Reports API (2 horas)

**Archivo**: `backend/routes/reports.js`

### Tareas
- [ ] 4.1 Crear rutas:
  - [ ] `GET /api/reports/sales/daily` - Ventas del día
  - [ ] `GET /api/reports/sales/weekly` - Últimas 7 días
  - [ ] `GET /api/reports/inventory` - Estado actual
  - [ ] `GET /api/reports/top-products` - Top 5 productos

- [ ] 4.2 Agregar datos:
  - [ ] Sumas y promedios
  - [ ] Totales por periodo
  - [ ] Productos con stock bajo
  - [ ] Filtrado por business_id

- [ ] 4.3 Testing:
  - [ ] Reportes devuelven datos correctos
  - [ ] Fechas en rango correcto

- [ ] 4.4 GitHub:
  - [ ] git commit -m "Reports API implementada"

---

## 📅 FASE 5: Users API (2 horas)

**Archivo**: `backend/routes/users.js`

### Tareas
- [ ] 5.1 Crear rutas CRUD:
  - [ ] `GET /api/users` - Listar empleados
  - [ ] `POST /api/users` - Crear empleado
  - [ ] `GET /api/users/:id` - Detalle
  - [ ] `PUT /api/users/:id` - Actualizar
  - [ ] `DELETE /api/users/:id` - Eliminar

- [ ] 5.2 Permisos:
  - [ ] Solo owner/admin pueden crear
  - [ ] Roles: owner, admin, employee, cashier
  - [ ] Filtrado por business_id

- [ ] 5.3 Testing:
  - [ ] Crear empleado
  - [ ] Listar empleados
  - [ ] Actualizar

- [ ] 5.4 GitHub:
  - [ ] git commit -m "Users API implementada"

---

## 📊 PROGRESS TRACKING

| Fase | Tareas | Completadas | % |
|------|--------|-------------|---|
| 1️⃣ Auth | 5 | 0 | 0% |
| 2️⃣ Products | 5 | 0 | 0% |
| 3️⃣ Sales | 6 | 0 | 0% |
| 4️⃣ Reports | 4 | 0 | 0% |
| 5️⃣ Users | 4 | 0 | 0% |
| **TOTAL** | **24** | **0** | **0%** |

---

## 🎯 HITOS IMPORTANTES

| Momento | Hito |
|---------|------|
| **Hoy** | ✅ PostgreSQL setup |
| **Mañana** | 🚀 Auth API lista |
| **Día 3** | 📦 Products API lista |
| **Días 4-5** | 💰 Sales API lista (transacciones) |
| **Día 6** | 📊 Reports + Users listos |
| **Semana 2** | 📱 Frontend comienza |

---

## 💡 NOTAS IMPORTANTES

- Después de cada fase: `npm run dev` para probar
- Cada endpoint en Postman antes de git commit
- NUNCA olvidar filtro `business_id`
- TRANSACCIONES para sales (crítico)
- Stock nunca negativo

---

**Creado**: 2025-10-29  
**Actualizado**: 21:42 UTC  
**Estado**: 🔴 NO INICIADO