import mongoose, { Document, Schema } from 'mongoose';

export interface IGalleryPhoto extends Document {
  title: string;
  category: string;
  imageUrl: string;
  likes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'O título da foto é obrigatório'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'A categoria da foto é obrigatória'],
      enum: ['cortes', 'barbas', 'tratamentos', 'estilos'],
      default: 'cortes',
    },
    imageUrl: {
      type: String,
      required: [true, 'A URL da imagem é obrigatória'],
    },
    likes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGalleryPhoto>('Gallery', GallerySchema);
