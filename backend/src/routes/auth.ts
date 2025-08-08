import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { uploadAvatar, deleteOldAvatar } from '../middleware/upload';

const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Verificar se o usuário já existe por email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário já existe com este email' 
      });
    }

    // Verificar se o usuário já existe por telefone
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário já existe com este telefone' 
      });
    }

    // Verificar se é o primeiro usuário (será admin)
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    // Criar usuário
    const user = new User({
      name,
      email,
      phone,
      // Deixe o hook pre('save') hashear a senha
      password,
      role
    });

    await user.save();

    // Gerar token
    const token = jwt.sign(
      { 
        userId: (user as any)._id.toString(),
        role: user.role 
      },
      (process.env.JWT_SECRET as string) || 'fallback-secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Tratamento específico para erros de validação do MongoDB
    if (error instanceof Error && error.message.includes('E11000')) {
      if (error.message.includes('email')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este email já está em uso' 
        });
      }
      if (error.message.includes('phone')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este telefone já está em uso' 
        });
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // 'identifier' pode ser email ou telefone

    console.log('Login attempt:', { identifier, password: password ? '***' : undefined });

    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/telefone e senha são obrigatórios' 
      });
    }

    // Determinar se o identifier é email ou telefone
    const isEmail = identifier.includes('@');
    
    // Buscar usuário por email ou telefone
    let searchQuery;
    if (isEmail) {
      searchQuery = { email: identifier.toLowerCase().trim() };
    } else {
      // Normalizar telefone para busca (remover formatação)
      const normalizedPhone = identifier.replace(/\D/g, '');
      searchQuery = { phone: normalizedPhone };
    }

    console.log('Search query:', searchQuery);

    const user = await User.findOne(searchQuery).select('+password');
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário inativo. Entre em contato com o suporte.' 
      });
    }

    // Verificar senha
    const isPasswordValid = await (user as any).comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }

    // Gerar token
    const token = jwt.sign(
      { 
        userId: (user as any)._id.toString(),
        role: user.role 
      },
      (process.env.JWT_SECRET as string) || 'fallback-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Obter perfil do usuário
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Alias para compatibilidade: /me retorna o mesmo que /profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Atualizar perfil do usuário
router.put('/profile', authenticateToken, uploadAvatar.single('avatar'), async (req: AuthRequest, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Se uma nova imagem foi enviada
    if (req.file) {
      // Deletar avatar antigo se existir
      if (user.avatar) {
        deleteOldAvatar(user.avatar);
      }
      
      // Salvar caminho do novo avatar
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    
    await user.save();

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    
    // Se houve erro e um arquivo foi enviado, deletá-lo
    if (req.file) {
      deleteOldAvatar(`/uploads/avatars/${req.file.filename}`);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Endpoint específico para upload de avatar
router.post('/upload-avatar', authenticateToken, uploadAvatar.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Deletar avatar antigo se existir
    if (user.avatar) {
      deleteOldAvatar(user.avatar);
    }

    // Salvar caminho do novo avatar
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    
    // Se houve erro e um arquivo foi enviado, deletá-lo
    if (req.file) {
      deleteOldAvatar(`/uploads/avatars/${req.file.filename}`);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
