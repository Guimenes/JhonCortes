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
  // Propriedade opcional para armazenar a URL normalizada da imagem no front-end
  normalizedImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, etc.
  startTime: string; // Formato HH:mm
  endTime: string; // Formato HH:mm
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Unavailability {
  _id: string;
  date: string; // Data específica da indisponibilidade
  startTime: string; // Formato HH:mm
  endTime: string; // Formato HH:mm
  reason: string; // Motivo da indisponibilidade
  isActive: boolean;
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
  identifier: string; // email ou telefone
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
  isActive?: boolean;
}

export interface CreateScheduleData {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface CreateUnavailabilityData {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  isActive?: boolean;
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
