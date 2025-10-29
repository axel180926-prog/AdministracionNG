# 🔐 PREPARACIÓN AUTH API

**Objetivo**: Estar listo para implementar auth.js mañana  
**Tiempo**: 5 minutos de lectura + 5 minutos de setup

---

## 📋 TABLA DE USUARIOS

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Campos importantes:**
- `username` - Email (será único por negocio)
- `password_hash` - Hash bcrypt (nunca guardar en texto plano)
- `role` - owner, admin, employee, cashier
- `business_id` - Filtro crítico

---

## 🎯 RUTAS A IMPLEMENTAR

### 1. POST /api/auth/register
```javascript
// Request
{
  "email": "admin@miempresa.com",
  "password": "Secure123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "businessId": 1
}

// Response 201
{
  "success": true,
  "user": {
    "id": 5,
    "email": "admin@miempresa.com",
    "firstName": "Juan",
    "businessId": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. POST /api/auth/login
```javascript
// Request
{
  "email": "admin@miempresa.com",
  "password": "Secure123!"
}

// Response 200
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 5,
    "email": "admin@miempresa.com",
    "businessId": 1,
    "role": "owner"
  }
}
```

### 3. GET /api/auth/me
```javascript
// Request headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response 200
{
  "user": {
    "id": 5,
    "email": "admin@miempresa.com",
    "fullName": "Juan Pérez",
    "role": "owner",
    "businessId": 1
  }
}
```

### 4. POST /api/auth/refresh-token
```javascript
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 5. POST /api/auth/logout
```javascript
// Request headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Response 200
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 🔑 JWT ESTRUCTURA

### Token Payload
```javascript
{
  "id": 5,              // user.id
  "email": "admin@...", // username
  "businessId": 1,      // CRÍTICO - para filtros
  "role": "owner",      // Para permisos
  "iat": 1672531200,    // Emitido en
  "exp": 1673136000     // Expira en (7 días)
}
```

### En request:
```
Authorization: Bearer <token>
```

---

## 📦 DEPENDENCIAS NECESARIAS

```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1"
}
```

**Verificar que están instaladas:**
```bash
cd backend
npm list bcrypt jsonwebtoken dotenv
```

---

## 🛡️ VALIDACIONES CRÍTICAS

### 1. Email
- [ ] Formato válido (contiene @)
- [ ] NO vacío
- [ ] Único EN LA BD

### 2. Contraseña
- [ ] Mínimo 8 caracteres
- [ ] NO vacía
- [ ] Hash con bcrypt salt 10

### 3. JWT
- [ ] Expiración: 7 días (604800 segundos)
- [ ] Secret en .env
- [ ] NUNCA exponer en logs

### 4. businessId
- [ ] Del JWT, NUNCA del request body
- [ ] Existir en tabla businesses
- [ ] Filtrar queries

---

## 📝 VARIABLES .env NECESARIAS

```env
# JWT
JWT_SECRET=tu_secreto_super_secreto_aqui_minimo_32_caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=negocio_admin_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Servidor
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

---

## ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada (`negocio_admin_db`)
- [ ] Tabla `users` existe
- [ ] Tabla `businesses` existe
- [ ] `.env` está configurado
- [ ] `npm install` completado
- [ ] Middleware auth.js existe
- [ ] `npm run dev` funciona sin errores

---

## 🧪 TESTING CON POSTMAN

### 1. Crear collection "Auth API"
- POST http://localhost:3000/api/auth/register
- POST http://localhost:3000/api/auth/login
- GET http://localhost:3000/api/auth/me
- POST http://localhost:3000/api/auth/refresh-token

### 2. Variables Postman
```
{{base_url}} = http://localhost:3000
{{token}} = (guardado después de login)
{{businessId}} = 1
```

### 3. Orden de testing
1. Register con email nuevo
2. Login con ese email
3. Usar token en /me
4. Verificar token funciona

---

## 🔗 ARCHIVOS RELACIONADOS

- `backend/middleware/auth.js` - Autenticación JWT ✅ Existe
- `backend/routes/auth.js` - Rutas (POR CREAR)
- `backend/services/authService.js` - Lógica (POR CREAR)
- `backend/database/schema.sql` - BD estructura ✅ Existe
- `COPILOT_INSTRUCTIONS.md` - Reglas críticas ✅ Leer

---

## 🚨 ERRORES COMUNES A EVITAR

❌ **NO HACER**:
- Guardar password en texto plano
- businessId del request body
- Queries sin filtro business_id
- Tokens sin expiración
- Validación solo en frontend

✅ **SÍ HACER**:
- Hash bcrypt siempre
- businessId del JWT
- Filtrar por business_id
- JWT con exp 7d
- Validación en backend

---

## 📚 ARCHIVOS QUE YA EXISTEN

**middleware/auth.js** ✅ - Verificar token
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};
```

---

**Estado**: 🟢 LISTO PARA IMPLEMENTAR  
**Próximo**: Mañana crear `authService.js` y `routes/auth.js`

---

**Creado**: 2025-10-29 21:42 UTC