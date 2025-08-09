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
import galleryRoutes from './routes/gallery';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware com configuração ajustada para permitir carregamento de imagens
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "*"]
    }
  }
}));

// Configuração de CORS para múltiplos origins
const allowedOrigins = process.env.FRONTEND_URLS 
  ? process.env.FRONTEND_URLS.split(',') 
  : ['*'];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como apps móveis ou requisições locais)
    if (!origin) return callback(null, true);
    
    // Verificar se o origin está na lista de permitidos ou se qualquer origin é permitido ('*')
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origem bloqueada pelo CORS: ${origin}`);
      callback(null, true); // Por segurança em desenvolvimento, permitimos mesmo se não estiver na lista
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads) com opções específicas para permitir acesso externo
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // cache por 1 ano
  }
}));

// Log para verificar o caminho absoluto da pasta de uploads
console.log(`🖼️ Servindo arquivos estáticos de: ${path.join(__dirname, '../uploads')}`);

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
app.use('/api/gallery', galleryRoutes);

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
  // Converter PORT para número para evitar erro de tipo
  const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${portNumber}`);
    console.log(`📱 API disponível em http://localhost:${portNumber}`);
    console.log(`🌐 Também disponível na rede em http://<seu-ip>:${portNumber}`);
  });
};

startServer().catch(console.error);

export default app;
