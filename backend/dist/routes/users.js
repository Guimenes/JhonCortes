"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all users (Admin only)
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const users = await User_1.default.find().sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar usuários',
            error: error.message
        });
    }
});
// Get user by ID (Admin only)
router.get('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar usuário',
            error: error.message
        });
    }
});
// Update user (Admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, isActive } = req.body;
        const user = await User_1.default.findByIdAndUpdate(id, { name, email, phone, role, isActive }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({
            message: 'Usuário atualizado com sucesso',
            user
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao atualizar usuário',
            error: error.message
        });
    }
});
// Deactivate user (Admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent admin from deactivating themselves
        if (id === req.user?._id?.toString()) {
            return res.status(400).json({ message: 'Não é possível desativar sua própria conta' });
        }
        const user = await User_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json({
            message: 'Usuário desativado com sucesso',
            user
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao desativar usuário',
            error: error.message
        });
    }
});
// Get user statistics (Admin only)
router.get('/stats/overview', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const activeUsers = await User_1.default.countDocuments({ isActive: true });
        const adminUsers = await User_1.default.countDocuments({ role: 'admin' });
        const recentUsers = await User_1.default.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });
        res.json({
            totalUsers,
            activeUsers,
            adminUsers,
            recentUsers,
            inactiveUsers: totalUsers - activeUsers
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar estatísticas',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map