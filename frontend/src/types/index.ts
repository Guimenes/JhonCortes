export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  category: 'corte' | 'barba' | 'combo' | 'tratamento';
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  user: User | string;
  service: Service | string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  notes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface CreateAppointmentData {
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: 'corte' | 'barba' | 'combo' | 'tratamento';
  image?: string;
}

export interface UpdateProfileData {
  name: string;
  phone: string;
  avatar?: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

export interface AvailableSlots {
  availableSlots: string[];
}
