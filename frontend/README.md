# Business Admin - Frontend (React Native)

App móvil para administración de negocios multi-negocio con React Native y Expo.

## 📋 Requisitos

- Node.js >= 16
- npm o yarn
- Expo CLI: `npm install -g expo-cli`

## 🚀 Setup

```bash
# Instalar dependencias
npm install

# Iniciar la app en desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

## 📁 Estructura

```
src/
├── screens/              # Pantallas de la app
│   ├── auth/            # Login y Register
│   ├── HomeScreen.tsx   # Dashboard
│   ├── ProductsScreen.tsx
│   ├── SalesScreen.tsx
│   ├── InventoryScreen.tsx
│   ├── ReportsScreen.tsx
│   └── ProfileScreen.tsx
├── context/             # React Context (Auth)
│   └── AuthContext.tsx
├── services/            # Servicios API
│   └── api.ts          # Cliente axios
└── components/          # Componentes reutilizables
```

## 🔑 Características

- ✅ Autenticación con JWT
- ✅ Integración con API REST
- ✅ Almacenamiento seguro (Secure Store)
- ✅ Gestión de estado global (Context)
- ✅ Tab navigation
- ✅ TypeScript

## 🔗 Conectividad

La app se conecta al backend en `http://localhost:3000/api`

### Endpoints disponibles:

```
POST   /auth/login              - Login
POST   /auth/register           - Registro
GET    /products                - Listar productos
GET    /sales                   - Listar ventas
GET    /inventory               - Inventario
GET    /reports                 - Reportes
GET    /config                  - Configuración
```

## 📱 Pantallas

- **Login**: Autenticación de usuarios
- **Register**: Crear nueva cuenta y negocio
- **Home**: Dashboard principal
- **Products**: Gestión de productos
- **Sales**: Registro de ventas
- **Inventory**: Control de inventario
- **Reports**: Análisis y reportes
- **Profile**: Información del usuario

## 🛠️ Desarrollo

### Agregar nueva pantalla

1. Crear archivo en `src/screens/NewScreen.tsx`
2. Importar en `App.tsx`
3. Agregar a navegador

### Usar el cliente API

```typescript
import { productsService } from '../services/api';

const products = await productsService.getProducts(1, 10);
```

### Usar autenticación

```typescript
import { useAuth } from '../context/AuthContext';

const { user, token, login, logout } = useAuth();
```

## 📚 Dependencias principales

- `react-native`: Framework móvil
- `expo`: Plataforma para RN
- `@react-navigation`: Navegación
- `axios`: Cliente HTTP
- `expo-secure-store`: Almacenamiento seguro
- `@react-native-async-storage`: Storage local

## 🤝 Contribuir

Esta es la app principal del proyecto AdministracionNG.

## 📄 Licencia

MIT
