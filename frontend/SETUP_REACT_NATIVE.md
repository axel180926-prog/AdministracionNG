# Configuración de React Native - Sistema Modular Dinámico

## 1. Instalar Dependencias

```bash
npx expo install expo
npx expo install react-native-paper
npx expo install @react-native-async-storage/async-storage
npx expo install axios
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-file-system expo-intent-launcher
```

## 2. Estructura de Carpetas

```
frontend/
├── contexts/
│   └── ConfigContext.js       # Contexto dinámico
├── navigation/
│   └── DynamicNavigator.js    # Navegación dinámica
├── screens/
│   ├── SplashScreen.js
│   ├── LoginScreen.js
│   ├── QuickSaleScreen.js
│   ├── TablesScreen.js
│   ├── InventoryScreen.js
│   ├── SettingsScreen.js
│   └── ... más pantallas
├── services/
│   └── api.js                 # Servicios HTTP
├── App.js                     # Punto de entrada
└── app.json
```

## 3. ConfigContext.js - El Corazón del Sistema

Este contexto se conecta a la API y carga la configuración del negocio dinámicamente.

```javascript
// contexts/ConfigContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.get(
        'https://tu-dominio.com/api/config/business-config',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await AsyncStorage.setItem('businessConfig', JSON.stringify(response.data));
      setConfig(response.data);
      setError(null);
    } catch (err) {
      // Cargar desde caché si hay error
      const cached = await AsyncStorage.getItem('businessConfig');
      if (cached) {
        setConfig(JSON.parse(cached));
      } else {
        setError('No se pudo cargar configuración');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const isModuleActive = (moduleCode) => {
    return config?.enabledModules.includes(moduleCode) || false;
  };

  return (
    <ConfigContext.Provider value={{ config, loading, error, isModuleActive, reloadConfig: loadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
```

## 4. DynamicNavigator.js - Navegación Adaptativa

```javascript
// navigation/DynamicNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useConfig } from '../contexts/ConfigContext';

// Importar pantallas
import QuickSaleScreen from '../screens/QuickSaleScreen';
import TablesScreen from '../screens/TablesScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MODULE_SCREENS = {
  quick_sale: {
    name: 'VentaRapida',
    component: QuickSaleScreen,
    label: 'Vender',
    icon: 'point-of-sale'
  },
  tables: {
    name: 'Mesas',
    component: TablesScreen,
    label: 'Mesas',
    icon: 'table-restaurant'
  },
  inventory: {
    name: 'Inventario',
    component: InventoryScreen,
    label: 'Inventario',
    icon: 'inventory'
  }
};

export default function DynamicNavigator() {
  const { config, loading, isModuleActive, useConfig } = useConfig();

  if (loading || !config) return null;

  const theme = config.settings.colors;
  const activeScreens = Object.entries(MODULE_SCREENS).filter(
    ([code]) => isModuleActive(code)
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
      }}
    >
      {activeScreens.map(([code, screen]) => (
        <Tab.Screen
          key={code}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarLabel: screen.label,
            tabBarIcon: ({ color }) => (
              <MaterialIcons name={screen.icon} size={24} color={color} />
            ),
          }}
        />
      ))}
      
      <Tab.Screen
        name="Configuracion"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

## 5. Ejemplo: SettingsScreen.js

La pantalla de configuración permite cambiar módulos en tiempo real:

```javascript
// screens/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useConfig } from '../contexts/ConfigContext';

export default function SettingsScreen({ navigation }) {
  const { config, reloadConfig, getTheme } = useConfig();
  const [loading, setLoading] = useState(false);
  const theme = getTheme();

  const toggleModule = async (moduleCode) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      await axios.post(
        'https://tu-dominio.com/api/config/toggle-module',
        {
          module_code: moduleCode,
          is_active: !config.enabledModules.includes(moduleCode)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await reloadConfig();
      Alert.alert('Éxito', 'Cambios aplicados');
      navigation.navigate('VentaRapida');
      
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{config?.business.name}</Text>
      <Text style={styles.subtitle}>{config?.business.type.display}</Text>

      <Text style={[styles.sectionTitle, { color: theme.primary }]}>
        Módulos Activos
      </Text>

      {config?.enabledModules.map(moduleCode => (
        <View key={moduleCode} style={styles.moduleItem}>
          <Text>{moduleCode}</Text>
          <Switch
            value={true}
            onValueChange={() => toggleModule(moduleCode)}
            disabled={loading}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  moduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8
  }
});
```

## 6. App.js - Punto de Entrada

```javascript
// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigProvider } from './contexts/ConfigContext';
import DynamicNavigator from './navigation/DynamicNavigator';
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  if (isLoading) {
    return null; // Mostrar splash screen
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <ConfigProvider>
          <DynamicNavigator />
        </ConfigProvider>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
```

## 7. Flujo de Cambios en Tiempo Real

1. **Usuario en SettingsScreen** → activa/desactiva módulo
2. **SettingsScreen** → envía POST a `/api/config/toggle-module`
3. **Backend** → actualiza `business_modules` en BD
4. **SettingsScreen** → llama a `reloadConfig()`
5. **ConfigContext** → obtiene nueva config del API
6. **DynamicNavigator** → se re-renderiza con nuevos módulos
7. **App** → muestra/oculta pantallas según módulos activos

## 8. Tipos de Negocio y Módulos por Defecto

Cuando se crea un negocio:

- **Restaurante**: quick_sale, inventory, tables, orders, waiters ✓
- **Pollería**: quick_sale, inventory, delivery ✓
- **Panadería**: quick_sale, inventory, production, recipes ✓
- **Taquería**: quick_sale, inventory, (tables opcional) ✓
- **Carnicería**: quick_sale, inventory, suppliers ✓

## 9. Testing Local

```bash
# En una terminal
cd backend
npm run dev

# En otra terminal
cd frontend
npx expo start

# Abrir en Android: Presionar 'a'
# Abrir en iOS: Presionar 'i'
```

## 10. Checklist de Implementación

- [ ] ConfigContext cargando configuración del API
- [ ] DynamicNavigator mostrando pantallas según módulos
- [ ] SettingsScreen permitiendo cambiar módulos
- [ ] Cambios reflejándose en tiempo real
- [ ] Persistencia local con AsyncStorage
- [ ] Manejo de errores y offline
- [ ] Pantalla de login
- [ ] Autenticación con JWT

## Notas Importantes

1. **AsyncStorage**: Se usa para caché local (offline)
2. **ConfigContext**: Se carga al iniciar la app y se recarga cuando cambian ajustes
3. **DynamicNavigator**: Se re-renderiza automáticamente cuando cambia el config
4. **Modularidad**: Cada módulo es una pantalla independiente
