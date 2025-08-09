// Types for Jhon Cortes Admin App

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  category: 'corte' | 'barba' | 'combo' | 'outros';
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  user: User;
  service: Service;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
  notes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo, 6 = sábado
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Unavailability {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateServiceData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: 'corte' | 'barba' | 'combo' | 'outros';
}

export interface CreateScheduleData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CreateUnavailabilityData {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface UpdateAppointmentStatusData {
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
}

// Dashboard Stats
export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  weeklyAppointments: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  totalServices: number;
  totalCompletedAppointments: number;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Services: undefined;
  Schedules: undefined;
  Users: undefined;
  Settings: undefined;
};

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration: string;
  price: string;
  category: 'corte' | 'barba' | 'combo' | 'outros';
}

export interface ScheduleFormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface UnavailabilityFormData {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}
