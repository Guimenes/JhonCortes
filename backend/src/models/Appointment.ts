import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  notes?: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Serviço é obrigatório']
  },
  date: {
    type: Date,
    required: [true, 'Data é obrigatória'],
    validate: {
      validator: function(value: Date) {
        return value >= new Date();
      },
      message: 'Data não pode ser no passado'
    }
  },
  startTime: {
    type: String,
    required: [true, 'Horário de início é obrigatório'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'Horário de fim é obrigatório'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de horário inválido (HH:MM)']
  },
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
    default: 'pendente'
  },
  notes: {
    type: String,
    maxlength: [500, 'Observações não podem ter mais que 500 caracteres']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Preço total é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ date: 1, startTime: 1 });
appointmentSchema.index({ user: 1 });
appointmentSchema.index({ status: 1 });

// Validate that end time is after start time
appointmentSchema.pre('save', function(next) {
  const startHour = parseInt(this.startTime.split(':')[0]);
  const startMinute = parseInt(this.startTime.split(':')[1]);
  const endHour = parseInt(this.endTime.split(':')[0]);
  const endMinute = parseInt(this.endTime.split(':')[1]);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  if (endTotalMinutes <= startTotalMinutes) {
    next(new Error('Horário de fim deve ser posterior ao horário de início'));
  } else {
    next();
  }
});

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
