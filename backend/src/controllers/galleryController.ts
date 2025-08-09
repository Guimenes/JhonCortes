import { Request, Response } from 'express';
import Gallery from '../models/Gallery';
import fs from 'fs';
import path from 'path';

// Obter todas as fotos ativas da galeria (público)
export const getAllGalleryPhotos = async (req: Request, res: Response) => {
  try {
    const photos = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    
    return res.status(200).json(photos);
  } catch (error) {
    console.error('Erro ao buscar fotos da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar fotos da galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Obter todas as fotos da galeria (admin)
export const getAllGalleryPhotosAdmin = async (req: Request, res: Response) => {
  try {
    const photos = await Gallery.find().sort({ createdAt: -1 });
    
    return res.status(200).json(photos);
  } catch (error) {
    console.error('Erro ao buscar fotos da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar fotos da galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Obter uma foto específica da galeria
export const getGalleryPhotoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const photo = await Gallery.findById(id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto não encontrada',
      });
    }
    
    return res.status(200).json(photo);
  } catch (error) {
    console.error('Erro ao buscar foto da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar foto da galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Obter fotos por categoria
export const getGalleryPhotosByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const photos = await Gallery.find({ 
      category, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    return res.status(200).json(photos);
  } catch (error) {
    console.error('Erro ao buscar fotos da galeria por categoria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar fotos da galeria por categoria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Adicionar uma nova foto à galeria
export const createGalleryPhoto = async (req: Request, res: Response) => {
  try {
    console.log('Recebendo requisição para criar foto na galeria');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    if (!req.file) {
      console.log('Erro: Nenhuma imagem enviada');
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem enviada',
      });
    }
    
    const { title, category } = req.body;
    
    // Validação básica
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'O título da foto é obrigatório',
      });
    }
    
    // Criar nova foto na galeria
    const newPhoto = new Gallery({
      title,
      category: category || 'cortes',
      imageUrl: `/uploads/gallery/${req.file.filename}`,
      likes: 0,
      isActive: true,
    });
    
    // Garantir que o caminho da imagem esteja correto e acessível
    console.log('URL da imagem salva:', newPhoto.imageUrl);
    
    await newPhoto.save();
    
    return res.status(201).json({
      success: true,
      message: 'Foto adicionada com sucesso à galeria',
      photo: newPhoto,
    });
  } catch (error) {
    console.error('Erro ao adicionar foto à galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar foto à galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Atualizar uma foto da galeria
export const updateGalleryPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category } = req.body;
    
    // Buscar a foto atual
    const photo = await Gallery.findById(id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto não encontrada',
      });
    }
    
    // Dados para atualização
    const updateData: any = {
      title: title || photo.title,
      category: category || photo.category,
    };
    
    // Se foi enviada uma nova imagem
    if (req.file) {
      // Excluir a imagem antiga
      const oldImagePath = path.join(__dirname, '../../', photo.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Atualizar com a nova imagem
      updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
    }
    
    // Atualizar a foto
    const updatedPhoto = await Gallery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Foto atualizada com sucesso',
      photo: updatedPhoto,
    });
  } catch (error) {
    console.error('Erro ao atualizar foto da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar foto da galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Alterar status de ativo/inativo de uma foto
export const toggleGalleryPhotoStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const photo = await Gallery.findById(id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto não encontrada',
      });
    }
    
    photo.isActive = !photo.isActive;
    await photo.save();
    
    return res.status(200).json({
      success: true,
      message: `Foto ${photo.isActive ? 'ativada' : 'desativada'} com sucesso`,
      photo,
    });
  } catch (error) {
    console.error('Erro ao alterar status da foto da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao alterar status da foto da galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Excluir uma foto da galeria
export const deleteGalleryPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const photo = await Gallery.findById(id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto não encontrada',
      });
    }
    
    // Excluir a imagem do servidor
    const imagePath = path.join(__dirname, '../../', photo.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Excluir do banco de dados
    await Gallery.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Foto excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir foto da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao excluir foto da galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};

// Curtir uma foto da galeria
export const likeGalleryPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const photo = await Gallery.findById(id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto não encontrada',
      });
    }
    
    photo.likes += 1;
    await photo.save();
    
    return res.status(200).json({
      success: true,
      message: 'Foto curtida com sucesso',
      likes: photo.likes,
    });
  } catch (error) {
    console.error('Erro ao curtir foto da galeria:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao curtir foto da galeria',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};
