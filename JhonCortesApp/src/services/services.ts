import api from './api';
import { Service, CreateServiceData } from '../types';

/**
 * Serviços para gerenciar serviços da barbearia
 */
export const servicesService = {
  /**
   * Buscar todos os serviços
   */
  getAll: async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
  },

  /**
   * Buscar serviço por ID
   */
  getById: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  /**
   * Criar novo serviço
   */
  create: async (serviceData: CreateServiceData): Promise<Service> => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  /**
   * Atualizar serviço
   */
  update: async (id: string, serviceData: Partial<CreateServiceData>): Promise<Service> => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  /**
   * Deletar serviço
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },

  /**
   * Ativar/desativar serviço
   */
  toggleActive: async (id: string): Promise<Service> => {
    const response = await api.patch(`/services/${id}/toggle-active`);
    return response.data;
  },
};
