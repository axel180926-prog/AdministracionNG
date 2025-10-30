# 🗄️ INSTALAR PostgreSQL - ALTERNATIVA RÁPIDA

El descarga por winget está bloqueado. Aquí hay 2 opciones:

---

## ✅ OPCIÓN 1: DESCARGA MANUAL (RECOMENDADO - 5 minutos)

### Paso 1: Descargar el instalador
Ve a: **https://www.postgresql.org/download/windows/**

Descarga: **PostgreSQL 16.10** (versión estable)

Archivo: `postgresql-16.10-2-windows-x64.exe` (~200MB)

### Paso 2: Ejecutar el instalador

```
1. Haz doble click en el .exe descargado
2. Siguiente → Siguiente hasta "Password"
3. ⚠️ IMPORTANTE: Configura la contraseña
   - Username: postgres (por defecto)
   - Password: Tu_Contraseña_Aqui (anota esto!)
   - Confirma contraseña
4. Siguiente → Puerto: 5432 (por defecto)
5. Siguiente → Finish
```

### Paso 3: Verificar instalación

```powershell
psql --version
```

Debe mostrar: `psql (PostgreSQL) 16.10`

---

## ⚠️ OPCIÓN 2: SIN PostgreSQL - Usa SQLite (alternativa)

Si no quieres descargar, podemos usar **SQLite** (incluido en Windows):

```bash
# SQLite ya está disponible, solo necesitamos adaptaciones menores
```

**PERO**: Recomiendo PostgreSQL porque el proyecto ya está diseñado para él.

---

## 🚨 PRÓXIMO PASO (Cuando PostgreSQL esté instalado)

```powershell
# 1. Conectar a PostgreSQL
psql -U postgres

# 2. Crear base de datos
CREATE DATABASE negocio_admin_db;

# 3. Seleccionar la BD
\c negocio_admin_db

# 4. Crear tablas
\i backend/database/schema.sql

# 5. Verificar tablas creadas
\dt
```

---

## 📍 UBICACIÓN DE INSTALACIÓN

PostgreSQL se instala en:
```
C:\Program Files\PostgreSQL\16
```

Y se agrega a PATH, así que `psql` funciona desde cualquier terminal.

---

**Avísame cuando termines la descarga e instalación** ✅

Cuando `psql --version` funcione, continuamos con la BD 🚀