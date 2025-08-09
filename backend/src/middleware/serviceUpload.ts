import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '../../uploads/services');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'service-' + uniqueSuffix + ext);
  }
});

// Filtro para tipos de arquivo permitidos
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP.'), false);
  }
};

// Log para ajudar a diagnosticar problemas de upload
console.log(`Diretório de uploads configurado: ${uploadsDir}`);
console.log(`Diretório existe? ${fs.existsSync(uploadsDir) ? 'Sim' : 'Não'}`);
console.log(`Permissões de escrita no diretório? Tentando criar arquivo de teste...`);

try {
  const testPath = path.join(uploadsDir, '.test');
  fs.writeFileSync(testPath, 'test');
  fs.unlinkSync(testPath);
  console.log(`✅ Teste de escrita bem-sucedido`);
} catch (error) {
  console.error(`❌ Erro ao escrever no diretório: ${error}`);
}

// Configuração do multer
export const uploadServiceImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Função para deletar arquivo antigo
export const deleteOldServiceImage = (imagePath: string) => {
  if (imagePath && imagePath !== '' && !imagePath.startsWith('http')) {
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};
