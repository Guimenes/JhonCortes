import api from './api';
import { Schedule, Unavailability, CreateScheduleData, CreateUnavailabilityData, DashboardStats } from '../types';

/**
 * Serviços para gerenciar horários de funcionamento
 */
export const schedulesService = {
  /**
   * Buscar todos os horários
   */
  getAll: async (): Promise<Schedule[]> => {
    const response = await api.get('/schedules');
    return response.data;
  },

  /**
   * Buscar horário por ID
   */
  getById: async (id: string): Promise<Schedule> => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  /**
   * Criar novo horário
   */
  create: async (scheduleData: CreateScheduleData): Promise<Schedule> => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  /**
   * Atualizar horário
   */
  update: async (id: string, scheduleData: Partial<CreateScheduleData>): Promise<Schedule> => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  /**
   * Deletar horário
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },

  /**
   * Ativar/desativar horário
   */
  toggleActive: async (id: string): Promise<Schedule> => {
    const response = await api.patch(`/schedules/${id}/toggle-active`);
    return response.data;
  },
};

/**
 * Serviços para gerenciar indisponibilidades
 */
export const unavailabilityService = {
  /**
   * Buscar todas as indisponibilidades
   */
  getAll: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Unavailability[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await api.get(`/unavailabilities?${params.toString()}`);
    return response.data;
  },

  /**
   * Buscar indisponibilidade por ID
   */
  getById: async (id: string): Promise<Unavailability> => {
    const response = await api.get(`/unavailabilities/${id}`);
    return response.data;
  },

  /**
   * Criar nova indisponibilidade
   */
  create: async (unavailabilityData: CreateUnavailabilityData): Promise<Unavailability> => {
    const response = await api.post('/unavailabilities', unavailabilityData);
    return response.data;
  },

  /**
   * Atualizar indisponibilidade
   */
  update: async (id: string, unavailabilityData: Partial<CreateUnavailabilityData>): Promise<Unavailability> => {
    const response = await api.put(`/unavailabilities/${id}`, unavailabilityData);
    return response.data;
  },

  /**
   * Deletar indisponibilidade
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/unavailabilities/${id}`);
  },

  /**
   * Ativar/desativar indisponibilidade
   */
  toggleActive: async (id: string): Promise<Unavailability> => {
    const response = await api.patch(`/unavailabilities/${id}/toggle-active`);
    return response.data;
  },
};

/**
 * Serviços para obter estatísticas do dashboard
 */
export const dashboardService = {
  /**
   * Obter estatísticas gerais
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Obter receita por período
   */
  getRevenue: async (period: 'day' | 'week' | 'month' | 'year', date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await api.get(`/dashboard/revenue/${period}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obter agendamentos por período
   */
  getAppointmentsByPeriod: async (period: 'day' | 'week' | 'month' | 'year', date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await api.get(`/dashboard/appointments/${period}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obter horários mais populares
   */
  getPopularTimes: async () => {
    const response = await api.get('/dashboard/popular-times');
    return response.data;
  },

  /**
   * Obter serviços mais vendidos
   */
  getTopServices: async (limit = 5) => {
    const response = await api.get(`/dashboard/top-services?limit=${limit}`);
    return response.data;
  },
};
