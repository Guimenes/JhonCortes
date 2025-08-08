import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, LoginRequest, AuthResponse } from '../types';
import { authService } from '../services';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        // Validar token com o servidor
        try {
          const response = await authService.validateToken();
          setUser(response.user);
        } catch (error) {
          // Token inválido, limpar dados
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados armazenados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(credentials: LoginRequest) {
    try {
      setLoading(true);
      
      console.log('Dados recebidos no useAuth:', {
        email: credentials.email,
        password: credentials.password ? '***' : 'undefined'
      });
      
      const response: AuthResponse = await authService.login(credentials);

      await SecureStore.setItemAsync('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      await clearAuthData();
      setUser(null);
      setLoading(false);
    }
  }

  async function updateUser(userData: Partial<User>) {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
  }

  async function clearAuthData() {
    await SecureStore.deleteItemAsync('authToken');
    await AsyncStorage.removeItem('userData');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
