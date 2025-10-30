import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

export interface User {
  id: number;
  email: string;
  role: string;
  businessId: number;
  businessName?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, businessName: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useState<{
    isLoading: boolean;
    isSignout: boolean;
    user: User | null;
    token: string | null;
  }>({
    isLoading: true,
    isSignout: false,
    user: null,
    token: null,
  });

  const restoreToken = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userJson = await AsyncStorage.getItem('user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        dispatch({
          type: 'RESTORE_TOKEN',
          token,
          user,
        } as any);
      } else {
        dispatch({
          type: 'SIGN_OUT',
        } as any);
      }
    } catch (e) {
      dispatch({
        type: 'SIGN_OUT',
      } as any);
    }
  }, []);

  useEffect(() => {
    restoreToken();
  }, [restoreToken]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;

      await SecureStore.setItemAsync('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: 'SIGN_IN',
        token,
        user,
      } as any);
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, businessName: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        businessName,
      });

      const { token, user } = response.data.data;

      await SecureStore.setItemAsync('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: 'SIGN_IN',
        token,
        user,
      } as any);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await AsyncStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      dispatch({
        type: 'SIGN_OUT',
      } as any);
    } catch (error) {
      throw error;
    }
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isSignout: state.isSignout,
    login,
    register,
    logout,
    restoreToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
