import api from './api';
import { User } from '../types';

/**
 * Serviços para gerenciar usuários
 */
export const usersService = {
  /**
   * Buscar todos os usuários
   */
  getAll: async (filters?: {
    role?: 'admin' | 'client';
    isActive?: boolean;
    search?: string;
  }): Promise<User[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Buscar usuário por ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Buscar apenas clientes
   */
  getClients: async (): Promise<User[]> => {
    return usersService.getAll({ role: 'client' });
  },

  /**
   * Atualizar usuário
   */
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Ativar/desativar usuário
   */
  toggleActive: async (id: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Atualizar avatar do usuário
   */
  updateAvatar: async (id: string, imageUri: string): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await api.patch(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Deletar usuário
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  /**
   * Obter estatísticas dos usuários
   */
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};
