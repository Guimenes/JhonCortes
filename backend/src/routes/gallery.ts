import express from 'express';
import { 
  getAllGalleryPhotos,
  getAllGalleryPhotosAdmin,
  getGalleryPhotoById,
  getGalleryPhotosByCategory,
  createGalleryPhoto,
  updateGalleryPhoto,
  toggleGalleryPhotoStatus,
  deleteGalleryPhoto,
  likeGalleryPhoto
} from '../controllers/galleryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import galleryUpload from '../middleware/galleryUpload';

const router = express.Router();

// Rotas públicas
router.get('/', getAllGalleryPhotos);
router.get('/category/:category', getGalleryPhotosByCategory);
router.post('/:id/like', likeGalleryPhoto);
router.get('/:id', getGalleryPhotoById); // Colocar por último para não conflitar com as outras rotas

// Rotas protegidas (admin)
router.get('/admin/all', authenticateToken, requireAdmin, getAllGalleryPhotosAdmin);
router.post('/', authenticateToken, requireAdmin, galleryUpload.single('image'), createGalleryPhoto);
router.put('/:id', authenticateToken, requireAdmin, galleryUpload.single('image'), updateGalleryPhoto);
router.patch('/:id/toggle', authenticateToken, requireAdmin, toggleGalleryPhotoStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteGalleryPhoto);

export default router;
