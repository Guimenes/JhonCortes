import api from './api';
import { Appointment, UpdateAppointmentStatusData } from '../types';

/**
 * Serviços para gerenciar agendamentos
 */
export const appointmentsService = {
  /**
   * Buscar todos os agendamentos
   */
  getAll: async (filters?: {
    date?: string;
    status?: string;
    userId?: string;
  }): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    
    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  /**
   * Buscar agendamento por ID
   */
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Buscar agendamentos de hoje
   */
  getToday: async (): Promise<Appointment[]> => {
    const today = new Date().toISOString().split('T')[0];
    return appointmentsService.getAll({ date: today });
  },

  /**
   * Buscar agendamentos da semana
   */
  getWeek: async (startDate: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/week/${startDate}`);
    return response.data;
  },

  /**
   * Buscar agendamentos do mês
   */
  getMonth: async (year: number, month: number): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/month/${year}/${month}`);
    return response.data;
  },

  /**
   * Atualizar status do agendamento
   */
  updateStatus: async (id: string, data: UpdateAppointmentStatusData): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/status`, data);
    return response.data;
  },

  /**
   * Cancelar agendamento
   */
  cancel: async (id: string, reason?: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Confirmar agendamento
   */
  confirm: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/confirm`);
    return response.data;
  },

  /**
   * Concluir agendamento
   */
  complete: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },

  /**
   * Obter estatísticas dos agendamentos
   */
  getStats: async (period: 'today' | 'week' | 'month' | 'year') => {
    const response = await api.get(`/appointments/stats/${period}`);
    return response.data;
  },
};
