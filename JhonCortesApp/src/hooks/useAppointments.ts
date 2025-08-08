import { useState, useEffect } from 'react';
import { appointmentsService } from '../services';
import { Appointment } from '../types';

/**
 * Hook para gerenciar agendamentos
 */
export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async (filters?: {
    date?: string;
    status?: string;
    userId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentsService.getAll(filters);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentsService.getToday();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar agendamentos de hoje');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    id: string,
    status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  ) => {
    try {
      setError(null);
      await appointmentsService.updateStatus(id, { status });
      // Atualizar a lista local
      setAppointments(prev =>
        prev.map(appointment =>
          appointment._id === id ? { ...appointment, status } : appointment
        )
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status do agendamento');
      throw err;
    }
  };

  const confirmAppointment = async (id: string) => {
    await updateAppointmentStatus(id, 'confirmado');
  };

  const cancelAppointment = async (id: string) => {
    await updateAppointmentStatus(id, 'cancelado');
  };

  const completeAppointment = async (id: string) => {
    await updateAppointmentStatus(id, 'concluido');
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    fetchTodayAppointments,
    updateAppointmentStatus,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
  };
}
