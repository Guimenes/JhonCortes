import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pasta de upload para fotos da galeria
const galleryUploadDirectory = path.join(__dirname, '../../uploads/gallery');

// Criar a pasta se não existir
if (!fs.existsSync(galleryUploadDirectory)) {
  fs.mkdirSync(galleryUploadDirectory, { recursive: true });
}

// Configuração de armazenamento para o multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, galleryUploadDirectory);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'gallery-' + uniqueSuffix + fileExtension);
  }
});

// Filtro para permitir apenas imagens
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'));
  }
};

// Configuração do multer
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

export default upload;
