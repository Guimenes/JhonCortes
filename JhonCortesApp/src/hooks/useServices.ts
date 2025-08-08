import { useState, useEffect } from 'react';
import { servicesService } from '../services';
import { Service, CreateServiceData } from '../types';

/**
 * Hook para gerenciar serviços
 */
export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesService.getAll();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar serviços');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: CreateServiceData) => {
    try {
      setError(null);
      const newService = await servicesService.create(serviceData);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (err: any) {
      setError(err.message || 'Erro ao criar serviço');
      throw err;
    }
  };

  const updateService = async (id: string, serviceData: Partial<CreateServiceData>) => {
    try {
      setError(null);
      const updatedService = await servicesService.update(id, serviceData);
      setServices(prev =>
        prev.map(service =>
          service._id === id ? updatedService : service
        )
      );
      return updatedService;
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar serviço');
      throw err;
    }
  };

  const deleteService = async (id: string) => {
    try {
      setError(null);
      await servicesService.delete(id);
      setServices(prev => prev.filter(service => service._id !== id));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar serviço');
      throw err;
    }
  };

  const toggleServiceActive = async (id: string) => {
    try {
      setError(null);
      const updatedService = await servicesService.toggleActive(id);
      setServices(prev =>
        prev.map(service =>
          service._id === id ? updatedService : service
        )
      );
      return updatedService;
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status do serviço');
      throw err;
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
  };
}
