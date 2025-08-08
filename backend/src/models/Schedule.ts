import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, etc.
  startTime: string; // Formato HH:mm
  endTime: string; // Formato HH:mm
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnavailability extends Document {
  date: Date; // Data específica da indisponibilidade
  startTime: string; // Formato HH:mm
  endTime: string; // Formato HH:mm
  reason: string; // Motivo da indisponibilidade
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>({
  dayOfWeek: {
    type: Number,
    required: [true, 'Dia da semana é obrigatório'],
    min: [0, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)'],
    max: [6, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)']
  },
  startTime: {
    type: String,
    required: [true, 'Horário de início é obrigatório'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:mm)']
  },
  endTime: {
    type: String,
    required: [true, 'Horário de fim é obrigatório'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:mm)']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const unavailabilitySchema = new Schema<IUnavailability>({
  date: {
    type: Date,
    required: [true, 'Data é obrigatória'],
    validate: {
      validator: function(date: Date) {
        return date >= new Date();
      },
      message: 'Data não pode ser no passado'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Horário de início é obrigatório'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:mm)']
  },
  endTime: {
    type: String,
    required: [true, 'Horário de fim é obrigatório'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:mm)']
  },
  reason: {
    type: String,
    required: [true, 'Motivo é obrigatório'],
    trim: true,
    maxlength: [200, 'Motivo não pode ter mais que 200 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validação para garantir que startTime < endTime
scheduleSchema.pre('save', function(next) {
  const start = new Date(`1970-01-01T${this.startTime}:00`);
  const end = new Date(`1970-01-01T${this.endTime}:00`);
  
  if (start >= end) {
    next(new Error('Horário de início deve ser anterior ao horário de fim'));
  } else {
    next();
  }
});

unavailabilitySchema.pre('save', function(next) {
  const start = new Date(`1970-01-01T${this.startTime}:00`);
  const end = new Date(`1970-01-01T${this.endTime}:00`);
  
  if (start >= end) {
    next(new Error('Horário de início deve ser anterior ao horário de fim'));
  } else {
    next();
  }
});

// Índices para otimizar consultas
scheduleSchema.index({ dayOfWeek: 1, isActive: 1 });
unavailabilitySchema.index({ date: 1, isActive: 1 });

export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);
export const Unavailability = mongoose.model<IUnavailability>('Unavailability', unavailabilitySchema);
