import { useState, useEffect } from 'react';
import { dashboardService } from '../services';
import { DashboardStats } from '../types';

/**
 * Hook para gerenciar dados do dashboard
 */
export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async (period: 'day' | 'week' | 'month' | 'year', date?: string) => {
    try {
      setError(null);
      const data = await dashboardService.getRevenue(period, date);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar receita');
      throw err;
    }
  };

  const fetchAppointmentsByPeriod = async (period: 'day' | 'week' | 'month' | 'year', date?: string) => {
    try {
      setError(null);
      const data = await dashboardService.getAppointmentsByPeriod(period, date);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar agendamentos por período');
      throw err;
    }
  };

  const fetchPopularTimes = async () => {
    try {
      setError(null);
      const data = await dashboardService.getPopularTimes();
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar horários populares');
      throw err;
    }
  };

  const fetchTopServices = async (limit = 5) => {
    try {
      setError(null);
      const data = await dashboardService.getTopServices(limit);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar serviços mais vendidos');
      throw err;
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
    fetchRevenue,
    fetchAppointmentsByPeriod,
    fetchPopularTimes,
    fetchTopServices,
  };
}
