# 🔐 Auth API - Guía de Setup y Testing

## 📋 Requisitos previos
- PostgreSQL 12+ instalado y corriendo
- Node.js 14+ 
- Postman o cliente HTTP similar

## 🚀 Pasos de Setup

### 1. Preparar la Base de Datos

```powershell
# Conectar a PostgreSQL
psql -U postgres

# En la consola psql:
CREATE DATABASE business_db;
\c business_db

# Ejecutar el schema principal
\i backend/database/schema.sql

# Ejecutar la migración de auth
\i backend/database/migrate_auth.sql

# Verificar que las tablas se crearon
\dt

# Salir
\q
```

### 2. Configurar Backend

```powershell
cd backend

# Instalar dependencias (si no las tiene)
npm install

# Crear archivo .env (si no existe)
cp .env.example .env
# O manualmente crear backend/.env con el contenido:
```

**Contenido de `backend/.env`:**
```env
PORT=3000
NODE_ENV=development

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=business_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgre

# JWT
JWT_SECRET=tu_secreto_muy_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secreto_muy_seguro_cambiar

# URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 3. Iniciar Backend

```powershell
# En carpeta backend/
npm run dev
```

**Debería mostrar:**
```
✅ Conexión a PostgreSQL establecida
🚀 Servidor corriendo en puerto 3000
🌐 API: http://localhost:3000/api
✅ Health: http://localhost:3000/api/health
```

## 🧪 Testing con Postman

### Test 1: Health Check
```
GET http://localhost:3000/api/health

Response (200):
{
  "status": "OK",
  "message": "Servidor funcionando correctamente"
}
```

### Test 2: Register
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

Body:
{
  "email": "usuario@example.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez"
}

Response (201):
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "businessId": 1,
    "role": "owner"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Test 3: Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

Body:
{
  "email": "usuario@example.com",
  "password": "Password123!"
}

Response (200):
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "businessId": 1,
    "role": "owner"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Test 4: Get User (Protegida)
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer {accessToken}

Response (200):
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "businessId": 1,
    "role": "owner",
    "createdAt": "2025-10-30T03:30:00.000Z"
  }
}
```

### Test 5: Refresh Token
```
POST http://localhost:3000/api/auth/refresh-token
Content-Type: application/json

Body:
{
  "refreshToken": "{refreshToken}"
}

Response (200):
{
  "message": "Token renovado exitosamente",
  "accessToken": "eyJhbGc..."
}
```

### Test 6: Logout
```
POST http://localhost:3000/api/auth/logout
Authorization: Bearer {accessToken}

Response (200):
{
  "message": "Logout exitoso. Elimina los tokens del cliente."
}
```

## 🐛 Solución de Problemas

### Error: "no existe la conexión a la base de datos"
- Verificar que PostgreSQL está corriendo: `pg_isready -h localhost`
- Verificar credentials en .env
- Verificar que la base de datos `business_db` existe

### Error: "Email ya está registrado"
- Significa que ya existe ese usuario
- Usa otro email o vacía la tabla: `TRUNCATE TABLE users CASCADE;`

### Error: "Token inválido"
- El token expiró después de 7 días
- Usa refresh-token para obtener un nuevo accessToken

## 📝 Notas Importantes

✅ **Seguridad:**
- Los tokens JWT se generan con expiración de 7 días (accessToken)
- Las contraseñas se hashean con bcrypt (10 rounds)
- Validación de email y contraseña mínimo 8 caracteres

✅ **Flujo Correcto:**
1. Usuario se registra o hace login
2. Obtiene accessToken (válido 7 días)
3. En cada request, envía: `Authorization: Bearer {token}`
4. Cuando expire, usa refreshToken para obtener nuevo accessToken

✅ **Base de Datos:**
- Cada usuario está vinculado a un negocio (business_id)
- Default business_id = 1 (Negocio Demo)
- Los roles son: owner, admin, employee, cashier

## ✅ Checklist Final

- [ ] PostgreSQL instalado y corriendo
- [ ] Database `business_db` creado
- [ ] Schema aplicado (schema.sql)
- [ ] Migración aplicada (migrate_auth.sql)
- [ ] .env configurado
- [ ] Backend corriendo (`npm run dev`)
- [ ] Health check responde OK
- [ ] Register funciona
- [ ] Login funciona
- [ ] GET /me con token funciona

**¡Listo!** Ahora puedes comenzar a usar los endpoints.
