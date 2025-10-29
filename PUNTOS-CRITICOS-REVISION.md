# 🔴 PUNTOS CRÍTICOS A REVISAR ANTES DE SUBIRLO AL VPS

Estos son los 10 puntos CLAVE que pueden romper tu aplicación. Revisalos ANTES de desplegar.

---

## 1. ✅ VARIABLES DE ENTORNO (.env)

### Revisar en `backend/.env.example`:

```bash
# ❌ NUNCA vayas con valores por defecto
NODE_ENV=production          # DEBE ser 'production'
JWT_SECRET=tu_clave...       # DEBE ser ÚNICO y SEGURO (32+ caracteres)
JWT_REFRESH_SECRET=...       # DEBE ser diferente al JWT_SECRET
BASE_URL=https://...         # DEBE apuntar a tu dominio REAL
DB_PASSWORD=...              # DEBE ser FUERTE (mínimo 16 caracteres)
```

**Acción**: 
```bash
# Generar secreto seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. ✅ BASE DE DATOS - CONEXIÓN

En `backend/config/database.js`:

```javascript
const pool = new Pool({
  user: process.env.DB_USER,              // ✓ Viene de .env
  host: process.env.DB_HOST || '127.0.0.1',  // ✓ localhost o IP real
  database: process.env.DB_NAME,          // ✓ Debe existir
  password: process.env.DB_PASSWORD,      // ✓ Contraseña correcta
  port: process.env.DB_PORT || 5432,      // ✓ Puerto correcto (5432 o 5433)
  max: 20,                                // ✓ Razonable para empezar
});
```

**Problema común**: 
- DB_PORT diferente en config (5433) vs .env (5432)
- DB_HOST apuntando a 'localhost' pero en VPS necesita '127.0.0.1'

**Acción**: Verifica que coincida:
```bash
# En VPS, probar conexión manualmente
psql -U tu_usuario -d business_db -c "SELECT 1;"
```

---

## 3. ✅ RUTAS Y MIDDLEWARE

En `backend/server.js`:

```javascript
// ✓ Rutas PÚBLICAS (sin autenticación)
app.get('/api/health', ...);
app.get('/api/version', ...);
app.use('/api/auth', authRoutes);           // ✓ Login/register
app.use('/api/config/business-types', ...); // ✓ Listar tipos

// ✓ Rutas PROTEGIDAS (requieren JWT)
app.use('/api/config', configRoutes);       // ✓ Require auth
app.use('/api/products', productsRoutes);   // ✓ Require auth
app.use('/api/sales', salesRoutes);         // ✓ Require auth
```

**Verificar**:
- [ ] `authenticateToken` middleware aplicado a rutas protegidas
- [ ] Endpoints públicos SIN middleware de auth
- [ ] CORS habilitado para tu dominio

```javascript
app.use(cors()); // ✓ Habilita CORS para todos
// O específicamente:
app.use(cors({
  origin: 'https://tu-dominio.com'
}));
```

---

## 4. ✅ AUTENTICACIÓN - JWT

En `backend/routes/auth.js`:

```javascript
const generateTokens = (userId, username, role) => {
  const accessToken = jwt.sign(
    { userId, username, role },
    process.env.JWT_SECRET,        // ✓ Del .env (NUNCA hardcodeado)
    { expiresIn: '1h' }            // ✓ Token acceso 1 hora
  );

  const refreshToken = jwt.sign(
    { userId, username },
    process.env.JWT_REFRESH_SECRET, // ✓ Del .env (DIFERENTE)
    { expiresIn: '7d' }            // ✓ Token refresh 7 días
  );

  return { accessToken, refreshToken };
};
```

**Problemas comunes**:
- ❌ JWT_SECRET y JWT_REFRESH_SECRET son iguales
- ❌ Secretos están hardcodeados en el código
- ❌ Tokens no incluyen userId (necesario para filtrar business_id)

**Verificar**: 
```bash
# Decodificar token (en jwt.io o con: )
node -e "console.log(require('jsonwebtoken').decode('TOKEN_AQUI'))"
```

---

## 5. ✅ FILTRADO POR BUSINESS_ID

En TODAS las rutas protegidas:

```javascript
// ✅ CORRECTO - Filtrar siempre por business_id del token
router.get('/something', authenticateToken, async (req, res) => {
  const businessId = req.user.businessId;  // ✓ Del token, NUNCA del body
  
  const result = await db.query(
    'SELECT * FROM products WHERE business_id = $1',
    [businessId]  // ✓ SIEMPRE filtrar
  );
});

// ❌ INCORRECTO - Sin filtrado
router.get('/something', async (req, res) => {
  const businessId = req.body.businessId;  // ✗ PELIGRO: Usuario puede poner otro ID
  const result = await db.query('SELECT * FROM products WHERE id = $1');
});
```

**Acción**: Audita TODAS las rutas en:
- `backend/routes/auth.js` ✓
- `backend/routes/config.js` ✓
- `backend/routes/products.js` - REVISAR
- `backend/routes/sales.js` - REVISAR
- `backend/routes/reports.js` - REVISAR
- `backend/routes/users.js` - REVISAR

---

## 6. ✅ MIDDLEWARE DE AUTENTICACIÓN

En `backend/middleware/auth.js`:

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // ✓ Bearer {token}

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    
    req.user = user;  // ✓ User data en req.user
    next();
  });
};

const checkPermission = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sin permiso' });
    }
    next();
  };
};
```

**Verificar**:
- [ ] Middleware extrae token correctamente (Bearer token)
- [ ] Valida JWT con JWT_SECRET del .env
- [ ] checkPermission verifica roles
- [ ] Error 401 si no hay token, 403 si token inválido

---

## 7. ✅ BASE DE DATOS - ESQUEMA

En `backend/database/schema.sql`:

```sql
-- ✓ Tablas principales presentes
CREATE TABLE business_modules (...);      -- Para módulos dinámicos
CREATE TABLE business_settings (...);     -- Para configuración
CREATE TABLE inventory_movements (...);   -- Para auditoría
CREATE TABLE products (...);              -- Catálogo
CREATE TABLE sales (...);                 -- Ventas
CREATE TABLE users (...);                 -- Empleados

-- ✓ Índices presentes para optimización
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_sales_business ON sales(business_id);
```

**Acción - Verificar en VPS**:
```bash
psql -U admin -d business_db -c "\dt"     # Listar tablas
psql -U admin -d business_db -c "\di"     # Listar índices
```

---

## 8. ✅ CORS Y HEADERS

En `backend/server.js`:

```javascript
app.use(cors());  // ✓ Habilita CORS
app.use(compression());  // ✓ Compresión GZIP
app.use(express.json());  // ✓ Parse JSON
app.use(express.urlencoded({ extended: true }));  // ✓ Parse form data

// En Nginx (proxy):
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

**Problema**: El frontend en app móvil puede rechazar requests si:
- CORS no está habilitado
- Headers no están configurados correctamente en Nginx

---

## 9. ✅ ERRORES Y LOGGING

En TODAS las rutas:

```javascript
try {
  // Lógica
  res.json({ success: true, data: result });
} catch (error) {
  console.error('❌ Error en endpoint:', error);  // ✓ Log descriptivo
  res.status(500).json({ 
    error: 'Error interno',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

**Verificar**:
- [ ] Todos los errores tienen console.error
- [ ] Logs son descriptivos (no solo "Error")
- [ ] En producción, NO devolver detalles técnicos al cliente

**Ver logs en VPS**:
```bash
pm2 logs business-api
pm2 logs business-api --lines 100
```

---

## 10. ✅ PUERTO Y PROCESO

En `.env`:
```
PORT=3000        # ✓ No cambiar (nginx redirige aquí)
NODE_ENV=production  # ✓ Para logs y manejo de errores
```

En VPS:
```bash
pm2 start server.js --name "business-api"
pm2 startup                    # ✓ Reinicia automáticamente
pm2 save                       # ✓ Persiste config
pm2 logs business-api          # ✓ Ver logs
pm2 delete business-api        # Si necesitas eliminar
```

**Verificar**:
- [ ] Puerto 3000 no está en uso: `lsof -i :3000`
- [ ] PM2 está corriendo: `pm2 status`
- [ ] Sin errores en logs: `pm2 logs`

---

## 🎯 CHECKLIST RÁPIDO

Antes de `git push`:

- [ ] `.env` NO está en repositorio (en .gitignore)
- [ ] `.env.example` SÍ está en repositorio (sin valores reales)
- [ ] Todos los JWT_SECRET y JWT_REFRESH_SECRET son únicos
- [ ] BASE_URL es tu dominio real
- [ ] Todos los endpoints protegidos filtran por business_id
- [ ] Middleware de auth está aplicado a rutas protegidas
- [ ] Base de datos tiene esquema y datos iniciales
- [ ] Servidor arranca sin errores localmente
- [ ] No hay console.log de datos sensibles (passwords, tokens)
- [ ] Nginx configurado como proxy reverso

---

## 🔍 TESTING ANTES DE PRODUCCIÓN

```bash
# Local
cd backend
npm run dev
curl http://localhost:3000/api/health

# En VPS
ssh usuario@vps
pm2 logs business-api
pm2 status
curl http://localhost:3000/api/health
curl https://tu-dominio.com/api/health  # Con Nginx + SSL
```

---

## 🚨 SI ALGO FALLA EN VPS

1. **Ver logs**:
   ```bash
   pm2 logs business-api
   ```

2. **Verificar BD**:
   ```bash
   psql -U admin -d business_db -c "SELECT COUNT(*) FROM users;"
   ```

3. **Verificar variables de entorno**:
   ```bash
   cat ~/business-api/backend/.env
   ```

4. **Reiniciar**:
   ```bash
   pm2 restart business-api
   ```

5. **Ver estado del servidor**:
   ```bash
   sudo systemctl status postgresql
   sudo systemctl status nginx
   pm2 status
   ```

---

**Revisa estos 10 puntos y tu app debería funcionar perfectamente en el VPS. 🚀**
