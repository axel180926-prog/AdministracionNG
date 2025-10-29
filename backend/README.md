# Sistema de Administración de Negocios Multi-Modular

## Descripción
API REST para sistema de administración de negocios con módulos dinámicos que se adaptan al tipo de negocio (Restaurante, Panadería, Pollería, Taquería, Carnicería, Heladería, Tamalera, etc.).

## Características Principales
✅ Configuración dinámica de módulos por tipo de negocio
✅ Multi-negocios con datos aislados
✅ Ventas con actualización automática de inventario
✅ Historial completo de movimientos
✅ Alertas de stock bajo
✅ Reportes semanales
✅ Autenticación con JWT
✅ Sistema de roles y permisos

## Instalación en VPS Hostinger

### Paso 1: Conectar por SSH
```bash
ssh usuario@tu-ip-vps
```

### Paso 2: Instalar Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### Paso 3: Instalar PostgreSQL
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### Paso 4: Crear Base de Datos
```bash
sudo -u postgres psql

# Dentro de PostgreSQL:
CREATE DATABASE business_db;
CREATE USER tu_usuario WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE business_db TO tu_usuario;
\q
```

### Paso 5: Clonar Proyecto
```bash
cd ~
git clone tu-repositorio business-api
cd business-api/backend
```

### Paso 6: Instalar Dependencias
```bash
npm install
```

### Paso 7: Configurar Variables de Entorno
```bash
cp .env.example .env
nano .env
```

Edita los siguientes valores:
```
NODE_ENV=production
PORT=3000
BASE_URL=https://tu-dominio.com

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro
DB_NAME=business_db

JWT_SECRET=generaUnaClaveSeguraAquí
JWT_EXPIRES_IN=7d
```

### Paso 8: Crear Esquema de Base de Datos
```bash
psql -U tu_usuario -d business_db -f database/schema.sql
psql -U tu_usuario -d business_db -f database/seed.sql
```

### Paso 9: Instalar PM2 (Gestor de Procesos)
```bash
sudo npm install -g pm2
```

### Paso 10: Iniciar Servidor
```bash
pm2 start server.js --name "business-api"
pm2 startup
pm2 save
```

### Paso 11: Verificar que está corriendo
```bash
pm2 status
pm2 logs business-api
```

### Paso 12: Configurar Nginx (Proxy Reverso)
```bash
sudo nano /etc/nginx/sites-available/default
```

Reemplaza el contenido con:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /downloads {
        alias /home/usuario/business-api/public/apks;
        autoindex on;
    }
}
```

Prueba la configuración:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 13: SSL con Certbot (Recomendado)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

## Comandos Útiles

### Desarrollo Local
```bash
npm run dev        # Iniciar con nodemon
npm start         # Iniciar servidor
npm run db:migrate # Ejecutar migraciones
npm run db:seed   # Cargar datos iniciales
```

### En el VPS (PM2)
```bash
pm2 status                    # Ver estado
pm2 logs business-api         # Ver logs
pm2 restart business-api      # Reiniciar
pm2 stop business-api         # Detener
pm2 start business-api        # Iniciar
pm2 delete business-api       # Eliminar
```

### PostgreSQL
```bash
psql -U tu_usuario -d business_db

# Dentro de PostgreSQL:
\dt                  # Ver todas las tablas
SELECT * FROM business_types;  # Ver tipos de negocio
SELECT * FROM modules;         # Ver módulos disponibles
\q                   # Salir
```

## Endpoints Principales

### Configuración (Requiere Autenticación)
- `GET /api/config/business-config` - Obtener configuración del negocio
- `GET /api/config/business-types` - Listar tipos de negocio
- `POST /api/config/toggle-module` - Activar/desactivar módulo
- `PUT /api/config/business-settings` - Actualizar configuración

### Salud
- `GET /api/health` - Estado del servidor
- `GET /api/version` - Versión del API

## Estructura de Carpetas
```
backend/
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── config.js
│   ├── sales.js (próximo)
│   ├── inventory.js (próximo)
│   └── products.js (próximo)
├── services/
│   └── inventoryService.js
├── database/
│   ├── schema.sql
│   └── seed.sql
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Troubleshooting

### Error: "ECONNREFUSED" en PostgreSQL
- Verifica que PostgreSQL está corriendo: `sudo systemctl status postgresql`
- Revisa las credenciales en `.env`

### Error: "Puerto 3000 ya está en uso"
```bash
lsof -i :3000
kill -9 <PID>
```

### Ver logs en tiempo real
```bash
pm2 logs business-api --lines 100
```

### Reiniciar después de cambios
```bash
pm2 restart business-api
```

## Monitoreo

### Instalar Dashboard de PM2
```bash
pm2 install pm2-logrotate
pm2 plus      # Para acceso web
```

### Ver métricas
```bash
pm2 monit
```

## Próximas Fases

1. **Rutas Faltantes**: sales.js, inventory.js, products.js, auth.js
2. **Frontend React Native**: Contexto de configuración dinámmica
3. **WebSockets**: Para actualizaciones en tiempo real
4. **Backups automáticos**: Script de backup de BD

## Soporte

Para más información sobre PostgreSQL:
- https://www.postgresql.org/docs/

Para PM2:
- https://pm2.keymetrics.io/

Para Nginx:
- https://nginx.org/
