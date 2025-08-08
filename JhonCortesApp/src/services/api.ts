import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Configure a base URL - altere para o IP do seu backend em desenvolvimento
const BASE_URL = 'http://192.168.29.10:5000/api';

/**
 * Instância do Axios configurada
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Interceptor para adicionar token de autenticação nas requisições
 */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao recuperar token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para tratar respostas e erros
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await SecureStore.deleteItemAsync('authToken');
      await AsyncStorage.removeItem('userData');
      // Aqui você pode redirecionar para a tela de login
    }
    return Promise.reject(error);
  }
);

export default api;
