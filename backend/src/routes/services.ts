import express from 'express';
import Service from '../models/Service';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadServiceImage, deleteOldServiceImage } from '../middleware/serviceUpload';
import path from 'path';

const router = express.Router();

// Get all active services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar serviços',
      error: error.message 
    });
  }
});

// Get all services (Admin only)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const services = await Service.find().sort({ category: 1, name: 1 });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar serviços',
      error: error.message 
    });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar serviço',
      error: error.message 
    });
  }
});

// Create new service (Admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin,
  uploadServiceImage.single('image'), 
  async (req, res) => {
    try {
      const { name, description, duration, price, category, isActive } = req.body;
      
      let imagePath = '';
      if (req.file) {
        // O caminho relativo para a imagem em relação à raiz do projeto
        imagePath = path.join('uploads', 'services', req.file.filename).replace(/\\/g, '/');
      }

      const service = new Service({
        name,
        description,
        duration: Number(duration),
        price: Number(price),
        category,
        image: imagePath || '',
        isActive: isActive === 'true'
      });

      await service.save();

      res.status(201).json({
        message: 'Serviço criado com sucesso',
        service
      });
    } catch (error: any) {
      res.status(400).json({ 
        message: 'Erro ao criar serviço',
        error: error.message 
      });
    }
});

// Update service (Admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  uploadServiceImage.single('image'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, duration, price, category, isActive, removeImage } = req.body;

      // Buscar serviço atual para verificar a imagem existente
      const currentService = await Service.findById(id);
      if (!currentService) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }

      // Preparar objeto de atualização
      const updateData: any = {
        name,
        description,
        duration: Number(duration),
        price: Number(price),
        category,
        isActive: isActive === 'true'
      };

      // Verificar se uma nova imagem foi enviada
      if (req.file) {
        // Deletar a imagem antiga se existir
        if (currentService.image) {
          deleteOldServiceImage(currentService.image);
        }
        // Salvar o caminho da nova imagem
        updateData.image = path.join('uploads', 'services', req.file.filename).replace(/\\/g, '/');
      } else if (removeImage === 'true') {
        // Se não foi enviada nova imagem, mas foi solicitado remover a existente
        if (currentService.image) {
          deleteOldServiceImage(currentService.image);
        }
        updateData.image = '';
      }

      // Atualizar o serviço
      const service = await Service.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Serviço atualizado com sucesso',
        service
      });
    } catch (error: any) {
      res.status(400).json({ 
        message: 'Erro ao atualizar serviço',
        error: error.message 
      });
    }
});

// Delete service (Admin only) - Soft delete
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    res.json({
      message: 'Serviço desativado com sucesso',
      service
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao desativar serviço',
      error: error.message 
    });
  }
});

// Permanently delete service (Admin only) - Hard delete
router.delete('/:id/permanent', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    res.json({
      message: 'Serviço excluído permanentemente',
      service
    });
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Erro ao excluir serviço permanentemente',
      error: error.message 
    });
  }
});

// Get services by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.find({ 
      category, 
      isActive: true 
    }).sort({ name: 1 });

    res.json(services);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Erro ao buscar serviços por categoria',
      error: error.message 
    });
  }
});

export default router;
