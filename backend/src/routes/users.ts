import express from 'express';
import User from '../models/User';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar usuários',
      error: error.message 
    });
  }
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar usuário',
      error: error.message 
    });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, phone, role, isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Usuário atualizado com sucesso',
      user
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao atualizar usuário',
      error: error.message 
    });
  }
});

// Deactivate user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (id === req.user?._id?.toString()) {
      return res.status(400).json({ message: 'Não é possível desativar sua própria conta' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Usuário desativado com sucesso',
      user
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao desativar usuário',
      error: error.message 
    });
  }
});

// Get user statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      recentUsers,
      inactiveUsers: totalUsers - activeUsers
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar estatísticas',
      error: error.message 
    });
  }
});

export default router;
