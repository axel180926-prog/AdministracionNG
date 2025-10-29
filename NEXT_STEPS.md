# 📋 PRÓXIMOS PASOS - ROADMAP COMPLETO

**Fase**: 2-7 (Backend APIs + Frontend + Deploy)  
**Tiempo estimado**: 3-4 semanas  
**Estado**: ✅ Fase 1 completada, lista para comenzar Fase 2

---

## 🎯 RESUMEN DE TAREAS (8 Fases)

### FASE 0: VPS SETUP ⏳ EN PROGRESO
```
Estado: Listo para ejecutar
Tiempo: ~10 minutos
Archivo: setup-vps.ps1
```

**Qué hacer:**
1. Abre PowerShell como admin
2. `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. `.\setup-vps.ps1`
4. Te pedirá contraseña PostgreSQL (12+ caracteres, guarda bien!)
5. Espera a que termine

**Después:**
- SSH sin contraseña ✅
- PostgreSQL corriendo ✅
- Nginx configurado ✅
- PM2 listo ✅

---

### FASE 1: AUTH API 🔴 CRÍTICO
```
Tiempo: 2-3 horas
Archivo: backend/routes/auth.js + backend/services/authService.js
Completado: 0%
```

**Rutas a implementar:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Login + generar JWT |
| GET | `/api/auth/me` | Obtener usuario actual |
| POST | `/api/auth/logout` | Logout (invalidar token) |
| POST | `/api/auth/refresh-token` | Renovar JWT expirado |

**Requisitos:**
- Validar email + contraseña
- Hash de contraseña con bcrypt
- JWT tokens (acceso + refresh)
- Filtrado por business_id
- Respuestas estándar

**Referencia:**
```
COPILOT_INSTRUCTIONS.md → Regla #1 (usar req.user.businessId)
README_PROGRESO.md → línea 105-125
```

**Comandos útiles:**
```bash
# Probar en Postman/Insomnia
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Secure123!",
  "firstName": "John",
  "businessId": 1
}
```

**Checklist:**
- [ ] `authService.js` implementado (login, register, validateToken)
- [ ] `auth.js` rutas implementadas
- [ ] Validaciones en backend (no frontend)
- [ ] JWT secret en .env
- [ ] Middleware auth.js funciona
- [ ] Todos los endpoints testados
- [ ] Actualizado README_PROGRESO.md

---

### FASE 2: PRODUCTS API 🔴 CRÍTICO
```
Tiempo: 2 horas
Archivo: backend/routes/products.js + backend/services/productService.js
Completado: 0%
```

**Rutas:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |

**Requisitos:**
- Filtrados por business_id (regla crítica!)
- Solo propietario del negocio puede crear/editar
- Validar SKU único por business
- Incluir categoría, precio, estado

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "businessId": 1,
      "name": "Pollo a la Brasa",
      "sku": "POLLO-1KG",
      "category": "Pollos",
      "price": 35.00,
      "currentStock": 10,
      "status": "active"
    }
  ]
}
```

**Checklist:**
- [ ] productService.js implementado
- [ ] products.js rutas implementadas
- [ ] WHERE business_id en TODAS las queries
- [ ] Validaciones de entrada
- [ ] Todos testados
- [ ] README_PROGRESO.md actualizado

---

### FASE 3: SALES API 🔴 CRÍTICO (CON INVENTARIO)
```
Tiempo: 3-4 horas
Archivo: backend/routes/sales.js + usar inventoryService.js
Completado: 0%
```

**Rutas:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/sales` | Crear venta + descontar inventario |
| GET | `/api/sales` | Listar ventas |
| GET | `/api/sales/:id` | Obtener detalle venta |
| PATCH | `/api/sales/:id/cancel` | Cancelar venta + devolver inventario |

**Lo importante: TRANSACCIONES**

```javascript
// ❌ MALO - Sin transacciones
await db.query('UPDATE inventory SET stock = stock - ? WHERE product_id = ?', [qty, productId]);
await db.query('INSERT INTO sales ...', [saleData]);

// ✅ CORRECTO - Con transacciones
const client = await db.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE inventory SET stock = stock - ? WHERE product_id = ?', [qty, productId]);
  await client.query('INSERT INTO sales ...', [saleData]);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

**Usar inventoryService.js** que ya existe!

**Ejemplo venta:**
```json
{
  "businessId": 1,
  "userId": 1,
  "customerId": 1,
  "items": [
    { "productId": 1, "quantity": 2, "unitPrice": 35.00 },
    { "productId": 2, "quantity": 1, "unitPrice": 25.00 }
  ],
  "discount": 0,
  "paymentMethod": "cash"
}
```

**Checklist:**
- [ ] Usar inventoryService.js existente
- [ ] POST /sales con transacciones (BEGIN/COMMIT/ROLLBACK)
- [ ] Validar stock antes de vender (regla crítica!)
- [ ] PATCH /cancel devuelve al inventario
- [ ] Todos testados
- [ ] README_PROGRESO.md actualizado

---

### FASE 4: REPORTS API 🟡 IMPORTANTE
```
Tiempo: 2-3 horas
Archivo: backend/routes/reports.js + backend/services/reportService.js
Completado: 0%
```

**Rutas:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reports/sales/daily` | Ventas diarias (últimos 30 días) |
| GET | `/api/reports/sales/weekly` | Ventas semanales |
| GET | `/api/reports/inventory` | Estado actual del inventario |
| GET | `/api/reports/top-products` | Top 5 productos más vendidos |

**Ejemplo respuesta:**
```json
{
  "success": true,
  "data": {
    "date": "2025-10-29",
    "totalSales": 2500.00,
    "orderCount": 12,
    "topProduct": "Pollo a la Brasa",
    "revenue": 2425.00
  }
}
```

**Checklist:**
- [ ] reportService.js implementado
- [ ] Todos los endpoints funcionan
- [ ] Filtrados por business_id
- [ ] Datos correctos
- [ ] README_PROGRESO.md actualizado

---

### FASE 5: USERS API 🟡 IMPORTANTE
```
Tiempo: 1-2 horas
Archivo: backend/routes/users.js + backend/services/userService.js
Completado: 0%
```

**Rutas:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users` | Listar empleados (solo admin) |
| GET | `/api/users/:id` | Obtener empleado |
| POST | `/api/users` | Crear empleado (solo admin) |
| PUT | `/api/users/:id` | Actualizar empleado |
| DELETE | `/api/users/:id` | Eliminar empleado (solo admin) |
| GET | `/api/users/:id/sales` | Ventas de un empleado |

**Regla:** Solo admin puede crear/editar/eliminar

**Checklist:**
- [ ] userService.js implementado
- [ ] Solo admin puede crear
- [ ] Filtrados por business_id
- [ ] Todos testados
- [ ] README_PROGRESO.md actualizado

---

### FASE 6: FRONTEND REACT NATIVE (MVP)
```
Tiempo: 4-5 horas
Carpeta: frontend/
Completado: 0%
```

**Componentes mínimos:**

1. **App.js** - Punto de entrada
2. **AuthContext.js** - Estado de autenticación
3. **ConfigContext.js** - Configuración del negocio
4. **LoginScreen.js** - Pantalla de login
5. **DashboardScreen.js** - Pantalla principal
6. **QuickSaleScreen.js** - Venta rápida
7. **Navegación** - Stack + Tab navigators

**Flujo:**
```
App.js
  ├── AuthContext (usuario logueado?)
  │   ├── SÍ → DynamicNavigator (ver módulos activos)
  │   └── NO → AuthStack (LoginScreen)
  │
  └── ConfigContext (cargar config de negocio)
      └── Mostrar módulos según configuración
```

**Checklist:**
- [ ] App.js creado
- [ ] AuthContext.js con login/logout
- [ ] ConfigContext.js carga config del backend
- [ ] LoginScreen conectado a `/api/auth/login`
- [ ] DashboardScreen muestra datos
- [ ] Navegación funciona
- [ ] Error handling

**Referencia:**
```
SETUP_REACT_NATIVE.md
```

---

### FASE 7: DEPLOY A VPS 🚀
```
Tiempo: 1-2 horas
Estado: Listo para empezar
```

**Pasos:**

**1. Preparar código local**
```bash
# En tu PC
git add .
git commit -m "Fase 2 completa: Backend APIs implementadas"
git push origin main
```

**2. Crear deploy.sh** (en tu PC)
```bash
#!/bin/bash
VPS="root@31.97.43.51"
APP_PATH="/var/www/negocio-admin/backend"

# Copiar archivos
scp -r backend/* $VPS:$APP_PATH/

# Instalar dependencias
ssh $VPS "cd $APP_PATH && npm ci --production"

# Ejecutar migraciones
ssh $VPS "cd $APP_PATH && node scripts/migrate.js"

# Reiniciar
ssh $VPS "pm2 restart negocio-admin"

echo "✅ Deploy completado"
```

**3. Ejecutar deploy**
```bash
chmod +x deploy.sh
./deploy.sh
```

**4. Verificar endpoints**
```bash
# Desde tu PC
curl http://31.97.43.51/api/health
curl http://31.97.43.51/api/config/business-config
curl -X POST http://31.97.43.51/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**5. Agregar SSL** (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d tu-dominio.com
```

**Checklist:**
- [ ] Código en GitHub
- [ ] deploy.sh creado
- [ ] deploy.sh ejecutado exitosamente
- [ ] Endpoints responden en VPS
- [ ] Logs sin errores
- [ ] SSL certificado

---

## 📊 TIMELINE RECOMENDADO

```
HOY (2025-10-29):
├─ 13:45 UTC: Setup VPS (setup-vps.ps1) ✅ HACER AHORA
└─ Tiempo: 15 min

MAÑANA/PASADO (1-2 días):
├─ Auth API (FASE 1)          - 3 horas
├─ Products API (FASE 2)      - 2 horas
└─ Sales API (FASE 3)         - 4 horas
└─ Subtotal: 9 horas

SIGUIENTE SEMANA (3-4 días):
├─ Reports API (FASE 4)       - 2 horas
├─ Users API (FASE 5)         - 2 horas
└─ Subtotal: 4 horas

SIGUIENTE SEMANA (2-3 días):
├─ Frontend React Native (FASE 6) - 5 horas

FINAL SEMANA (1 día):
└─ Deploy VPS (FASE 7) - 2 horas

TOTAL: 22 horas de codificación (3-4 semanas)
```

---

## ⚡ ORDEN RECOMENDADO

### Opción A: BACKEND PRIMERO (Recomendado)
```
1. Setup VPS (hoy)
2. Auth API
3. Products API
4. Sales API
5. Reports API
6. Users API
7. Frontend (paralelo con backend)
8. Deploy
```

### Opción B: PARALLEL (Si tienes ayuda)
```
- Tú haces Backend APIs
- Otra persona hace Frontend
- Deploy juntos al final
```

---

## 🎯 COMIENZA AHORA

### Paso 1: Setup VPS (AHORA)
```powershell
cd C:\Users\jovan\Desktop\AdministracionNG
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-vps.ps1
```

**Espera ~10 minutos a que termine**

### Paso 2: Verify SSH (Después del setup)
```powershell
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "pm2 status"
ssh -i $HOME/.ssh/vps_key root@31.97.43.51 "psql -U negocio_admin_user -d negocio_admin_db -c 'SELECT NOW();'"
```

### Paso 3: Comienza Auth API
Lee:
- `COPILOT_INSTRUCTIONS.md` (3 min)
- `README_PROGRESO.md` líneas 105-125 (2 min)

Implementa:
- `backend/services/authService.js`
- `backend/routes/auth.js`

Pide:
- "Ayúdame a implementar auth.js con estas 5 rutas: register, login, logout, me, refresh-token"

---

## 💡 CONSEJOS

### ✅ Haz
- Implementa una ruta a la vez
- Prueba en Postman/Insomnia
- Lee COPILOT_INSTRUCTIONS.md antes de pedir ayuda
- Pushea a GitHub cada 2-3 horas
- Actualiza README_PROGRESO.md

### ❌ NO hagas
- Cambies la estructura de carpetas
- Olvides filtrar por business_id
- Valides solo en frontend
- Hagas cambios sin transacciones en inventario
- Comitas sin mensaje descriptivo

---

## 📞 REFERENCIAS RÁPIDAS

```
Qué necesito         → Archivo
─────────────────────────────────
Entender estado      → README_PROGRESO.md
Reglas de código     → COPILOT_INSTRUCTIONS.md
Estructura BD        → backend/database/schema.sql
Ejemplo auth         → COPILOT_INSTRUCTIONS.md (línea ~50)
Checklist inicio     → .vscode/CHECKLIST_INICIO.md
Setup VPS            → VPS_QUICK_START.md
```

---

## ✨ RESUMEN

**Hoy:**
- Ejecuta setup-vps.ps1 (VPS configurado)

**Próximas semanas:**
- Auth API (3 horas)
- Products API (2 horas)
- Sales API (4 horas)
- Reports API (2 horas)
- Users API (2 horas)
- Frontend (5 horas)
- Deploy (2 horas)

**Total: 3-4 semanas para tener app 100% funcional**

---

**¿Listo? Comienza con:**
```powershell
.\setup-vps.ps1
```

**Después ven y pide ayuda con auth.js**

---

**Creado**: 2025-10-29 13:45 UTC  
**Estado**: 📋 Roadmap listo  
**Próximo**: 🚀 Ejecutar setup-vps.ps1
