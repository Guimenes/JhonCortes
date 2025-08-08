import api from './api';
import { User, LoginRequest, RegisterRequest } from '../types';

/**
 * Serviços de autenticação
 */
export const authService = {
  /**
   * Fazer login
   */
  login: async (credentials: LoginRequest) => {
    // Converter email para identifier para compatibilidade com backend
    const loginData = {
      identifier: credentials.email,
      password: credentials.password
    };
    
    console.log('Dados de login sendo enviados:', {
      identifier: loginData.identifier,
      password: loginData.password ? '***' : 'undefined'
    });
    
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },

  /**
   * Registrar usuário
   */
  register: async (userData: RegisterRequest) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Validar token
   */
  validateToken: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },

  /**
   * Fazer logout
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Solicitar recuperação de senha
   */
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Redefinir senha
   */
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
    return response.data;
  },
};
