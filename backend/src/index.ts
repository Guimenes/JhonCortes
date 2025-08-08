import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';
import userRoutes from './routes/users';
import serviceRoutes from './routes/services';
import scheduleRoutes from './routes/schedules';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection with retry (avoids crashing when MongoDB isn't up yet)
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jhon-cortes-barber';
  // retry forever with backoff
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await mongoose.connect(uri);
      console.log('✅ MongoDB conectado com sucesso');

      // Create default admin user if it doesn't exist
      const { createDefaultAdmin } = await import('./utils/createDefaultAdmin');
      await createDefaultAdmin();

      return; // connected
    } catch (error: any) {
      const msg = error?.message || error;
      console.error('❌ Erro ao conectar com MongoDB:', msg);
      console.log('⏳ Tentando reconectar em 5s... Verifique se o MongoDB está rodando e a variável MONGODB_URI.');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Jhon Cortes Barber Shop API está rodando!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Algo deu errado!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler (Express 5: middleware sem path, precisa de next)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 API disponível em http://localhost:${PORT}`);
  });
};

startServer().catch(console.error);

export default app;
