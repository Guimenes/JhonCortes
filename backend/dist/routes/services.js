"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Service_1 = __importDefault(require("../models/Service"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all active services
router.get('/', async (req, res) => {
    try {
        const services = await Service_1.default.find({ isActive: true }).sort({ category: 1, name: 1 });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar serviços',
            error: error.message
        });
    }
});
// Get all services (Admin only)
router.get('/admin', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const services = await Service_1.default.find().sort({ category: 1, name: 1 });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar serviços',
            error: error.message
        });
    }
});
// Get service by ID
router.get('/:id', async (req, res) => {
    try {
        const service = await Service_1.default.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        res.json(service);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar serviço',
            error: error.message
        });
    }
});
// Create new service (Admin only)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, duration, price, category, image } = req.body;
        const service = new Service_1.default({
            name,
            description,
            duration,
            price,
            category,
            image
        });
        await service.save();
        res.status(201).json({
            message: 'Serviço criado com sucesso',
            service
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao criar serviço',
            error: error.message
        });
    }
});
// Update service (Admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration, price, category, image, isActive } = req.body;
        const service = await Service_1.default.findByIdAndUpdate(id, { name, description, duration, price, category, image, isActive }, { new: true, runValidators: true });
        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        res.json({
            message: 'Serviço atualizado com sucesso',
            service
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao atualizar serviço',
            error: error.message
        });
    }
});
// Delete service (Admin only) - Soft delete
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }
        res.json({
            message: 'Serviço desativado com sucesso',
            service
        });
    }
    catch (error) {
        res.status(400).json({
            message: 'Erro ao desativar serviço',
            error: error.message
        });
    }
});
// Get services by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const services = await Service_1.default.find({
            category,
            isActive: true
        }).sort({ name: 1 });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar serviços por categoria',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map