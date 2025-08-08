import axios from 'axios';
import type {
  User,
  Service,
  Appointment,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  CreateAppointmentData,
  CreateServiceData,
  UpdateProfileData,
  AvailableSlots,
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

  create: async (data: CreateServiceData): Promise<{ message: string; service: Service }> => {
    const response = await api.post('/services', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateServiceData>): Promise<{ message: string; service: Service }> => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  // Admin endpoints
  getAllAdmin: async (): Promise<Service[]> => {
    const response = await api.get('/services/admin');
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

  cancel: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  getAvailableSlots: async (date: string): Promise<AvailableSlots> => {
    const response = await api.get(`/appointments/available-slots/${date}`);
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

export default api;
