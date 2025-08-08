import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  isActive: boolean;
  category: 'corte' | 'barba' | 'combo' | 'tratamento';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
  name: {
    type: String,
    required: [true, 'Nome do serviço é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais que 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais que 500 caracteres']
  },
  duration: {
    type: Number,
    required: [true, 'Duração é obrigatória'],
    min: [15, 'Duração mínima é 15 minutos'],
    max: [240, 'Duração máxima é 240 minutos']
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: ['corte', 'barba', 'combo', 'tratamento']
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model<IService>('Service', serviceSchema);
