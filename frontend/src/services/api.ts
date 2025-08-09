import axios from 'axios';
import type {
  User,
  Service,
  Appointment,
  Schedule,
  Unavailability,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  CreateAppointmentData,
  CreateScheduleData,
  CreateUnavailabilityData,
  UpdateProfileData,
  AvailableSlots,
  GalleryPhoto,
  InstagramSettings,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ message: string; avatar: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProfileWithAvatar: async (data: FormData): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Services endpoints
export const servicesAPI = {
  getAll: async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Service[]> => {
    const response = await api.get(`/services/category/${category}`);
    return response.data;
  },

  create: async (data: FormData): Promise<{ message: string; service: Service }> => {
    const response = await api.post('/services', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<{ message: string; service: Service }> => {
    const response = await api.put(`/services/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  deletePermanent: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/services/${id}/permanent`);
    return response.data;
  },

  // Admin endpoints
  getAllAdmin: async (): Promise<Service[]> => {
    const response = await api.get('/services/admin');
    return response.data;
  },

  toggleActive: async (id: string, isActive: boolean): Promise<{ message: string; service: Service }> => {
    // Enviar um objeto JSON simples em vez de FormData
    const response = await api.put(`/services/${id}/toggle`, { isActive: isActive.toString() });
    return response.data;
  },
};

// Appointments endpoints
export const appointmentsAPI = {
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },

  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments');
    return response.data;
  },

  create: async (data: CreateAppointmentData): Promise<{ message: string; appointment: Appointment }> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<{ message: string; appointment: Appointment }> => {
    if (reason) {
      // Se tiver motivo, usar a rota PATCH que agora suporta motivos
      const response = await api.patch(`/appointments/${id}/cancel`, { reason });
      return response.data;
    } else {
      // Manter compatibilidade com o código existente
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    }
  },

  getAvailableSlots: async (date: string, serviceId?: string): Promise<AvailableSlots> => {
    const params = serviceId ? { serviceId } : {};
    const response = await api.get(`/appointments/available-slots/${date}`, { params });
    return response.data;
  },

  checkDate: async (date: string): Promise<{
    isWorkingDay: boolean;
    hasUnavailability: boolean;
    isCompletelyBlocked: boolean;
    hasAvailableSlots: boolean;
    unavailabilities: Array<{
      startTime: string;
      endTime: string;
      reason: string;
    }>;
  }> => {
    const response = await api.get(`/appointments/check-date/${date}`);
    return response.data;
  },
};

// Users endpoints (Admin only)
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<{ message: string; user: User }> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deactivate: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getStats: async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    recentUsers: number;
    inactiveUsers: number;
  }> => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string; message: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Schedules endpoints (Admin only)
export const schedulesAPI = {
  getAll: async (): Promise<Schedule[]> => {
    const response = await api.get('/schedules');
    return response.data;
  },

  getAllAdmin: async (): Promise<Schedule[]> => {
    const response = await api.get('/schedules/admin');
    return response.data;
  },

  create: async (data: CreateScheduleData): Promise<{ message: string; schedule: Schedule }> => {
    const response = await api.post('/schedules', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateScheduleData>): Promise<{ message: string; schedule: Schedule }> => {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },

  deletePermanent: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/schedules/${id}/permanent`);
    return response.data;
  },

  getAvailableSlots: async (date: string): Promise<{ availableSlots: string[] }> => {
    const response = await api.get(`/schedules/available-slots/${date}`);
    return response.data;
  },
};

// Unavailabilities endpoints (Admin only)
export const unavailabilitiesAPI = {
  getAll: async (date?: string): Promise<Unavailability[]> => {
    const params = date ? { date } : {};
    const response = await api.get('/schedules/unavailabilities', { params });
    return response.data;
  },

  getAllAdmin: async (): Promise<Unavailability[]> => {
    const response = await api.get('/schedules/unavailabilities/admin');
    return response.data;
  },

  create: async (data: CreateUnavailabilityData): Promise<{ message: string; unavailability: Unavailability }> => {
    const response = await api.post('/schedules/unavailabilities', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateUnavailabilityData>): Promise<{ message: string; unavailability: Unavailability }> => {
    const response = await api.put(`/schedules/unavailabilities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/schedules/unavailabilities/${id}`);
    return response.data;
  },

  deletePermanent: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/schedules/unavailabilities/${id}/permanent`);
    return response.data;
  },
};

// Galeria endpoints
export const galleryAPI = {
  getAll: async (): Promise<GalleryPhoto[]> => {
    const response = await api.get('/gallery');
    return response.data;
  },

  getById: async (id: string): Promise<GalleryPhoto> => {
    const response = await api.get(`/gallery/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<GalleryPhoto[]> => {
    const response = await api.get(`/gallery/category/${category}`);
    return response.data;
  },

  // Admin endpoints
  getAllAdmin: async (): Promise<GalleryPhoto[]> => {
    const response = await api.get('/gallery/admin/all');
    return response.data;
  },

  create: async (data: FormData): Promise<{ success: boolean; message: string; photo: GalleryPhoto }> => {
    const response = await api.post('/gallery', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<{ success: boolean; message: string; photo: GalleryPhoto }> => {
    const response = await api.put(`/gallery/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  },

  toggleActive: async (id: string): Promise<{ success: boolean; message: string; photo: GalleryPhoto }> => {
    const response = await api.patch(`/gallery/${id}/toggle`);
    return response.data;
  },
  
  like: async (id: string): Promise<{ success: boolean; message: string; likes: number }> => {
    const response = await api.post(`/gallery/${id}/like`);
    return response.data;
  },
};

// Instagram settings endpoints
export const settingsAPI = {
  getInstagramHandle: async (): Promise<InstagramSettings> => {
    const response = await api.get('/settings/instagram');
    return response.data;
  },

  updateInstagramHandle: async (handle: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/settings/instagram', { handle });
    return response.data;
  },
};

export default api;
