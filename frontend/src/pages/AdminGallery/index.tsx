import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { galleryAPI, settingsAPI } from '../../services/api';
import { createImageFallbackHandler } from '../../utils/imageUtils';
import type { GalleryPhoto as IGalleryPhoto } from '../../types';
import './styles.css';

// Interface adaptada para compatibilidade com o componente
interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  category: string;
  likes: number;
  createdAt: string;
}

// Interface para o formulário de envio
interface PhotoFormData {
  title: string;
  category: string;
  file: File | null;
}

const AdminGallery: React.FC = () => {
  // Estados para gerenciar as fotos, carregamento, etc.
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [formData, setFormData] = useState<PhotoFormData>({
    title: '',
    category: 'cortes',
    file: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState('@jhoncortesbarbershop');

  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Categorias disponíveis
  const categories = [
    { id: 'cortes', label: 'Cortes' },
    { id: 'barbas', label: 'Barbas' },
    { id: 'tratamentos', label: 'Tratamentos' },
    { id: 'estilos', label: 'Estilos Completos' },
  ];

  // Verificar se o usuário é admin ao carregar a página
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Carregar fotos ao iniciar
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        // Buscar fotos da API (como admin para ver todas)
        const data = await galleryAPI.getAllAdmin();
        
        // Converter formato da API para o formato usado pelo componente
        const formattedPhotos = data.map(photo => {
          // Extrai a URL base da API sem o '/api'
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const baseUrl = apiUrl.replace(/\/api\/?$/, '');
          
          return {
            id: photo._id,
            url: `${baseUrl}${photo.imageUrl}`,
            title: photo.title,
            category: photo.category,
            likes: photo.likes,
            createdAt: photo.createdAt
          };
        });
        
        setPhotos(formattedPhotos);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar as fotos:', err);
        setError('Erro ao carregar as fotos. Tente novamente.');
        setIsLoading(false);
      }
    };

    fetchPhotos();
    
    // Carregar handle do Instagram (seria de uma API ou configurações)
    const loadInstagramHandle = () => {
      // Aqui seria uma chamada à API para buscar as configurações
      // Por enquanto, usamos o valor padrão definido no state
    };
    
    loadInstagramHandle();
  }, []);

  // Manipulação do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipulação do upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFormData(prev => ({ ...prev, file: selectedFile }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Iniciar edição de uma foto
  const handleEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      category: photo.category,
      file: null,
    });
    setPreviewUrl(photo.url);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar o formulário
  const handleCancel = () => {
    setShowForm(false);
    setEditingPhoto(null);
    resetForm();
  };

  // Resetar o formulário
  const resetForm = () => {
    setFormData({
      title: '',
      category: 'cortes',
      file: null,
    });
    setPreviewUrl(null);
  };

  // Enviar o formulário (adicionar/editar foto)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Por favor, informe o título da foto');
      return;
    }
    
    if (!formData.file && !editingPhoto) {
      setError('Por favor, selecione uma imagem');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Preparar FormData para envio
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      
      // Se for edição
      if (editingPhoto) {
        // Apenas enviar imagem se uma nova foi selecionada
        if (formData.file) {
          formDataToSend.append('image', formData.file);
        }
        
        // Enviar para a API
        const response = await galleryAPI.update(editingPhoto.id, formDataToSend);
        
        // Converter o formato da resposta para o formato usado pelo componente
        const updatedPhoto = {
          id: response.photo._id,
          url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${response.photo.imageUrl}`,
          title: response.photo.title,
          category: response.photo.category,
          likes: response.photo.likes,
          createdAt: response.photo.createdAt
        };
        
        // Atualizar a lista de fotos
        setPhotos(prev => prev.map(p => p.id === editingPhoto.id ? updatedPhoto : p));
      } 
      // Se for adição
      else {
        // Adicionar a imagem ao FormData (usando o nome 'image' que o backend espera)
        if (formData.file) {
          formDataToSend.append('image', formData.file);
        }
        
      // Enviar para a API
      console.log('Enviando dados para API:', {
        title: formData.title,
        category: formData.category,
        hasFile: !!formData.file
      });
      
      const response = await galleryAPI.create(formDataToSend);
      console.log('Resposta da API:', response);
      
      // Converter o formato da resposta para o formato usado pelo componente
      const newPhoto = {
        id: response.photo._id,
        url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${response.photo.imageUrl}`,
        title: response.photo.title,
        category: response.photo.category,
        likes: response.photo.likes,
        createdAt: response.photo.createdAt
      };        // Adicionar a nova foto à lista
        setPhotos(prev => [newPhoto, ...prev]);
      }
      
      setIsSubmitting(false);
      setShowForm(false);
      resetForm();
      setEditingPhoto(null);
      
      // Mostrar mensagem de sucesso
      alert(editingPhoto ? 'Foto atualizada com sucesso!' : 'Foto adicionada com sucesso!');
      
    } catch (err) {
      console.error('Erro ao salvar a foto:', err);
      setError('Erro ao salvar a foto. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  // Excluir uma foto
  const handleDelete = async (photoId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto?')) {
      return;
    }
    
    try {
      // Chamar a API para excluir a foto
      await galleryAPI.delete(photoId);
      
      // Atualizar a lista localmente
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      alert('Foto excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir a foto:', err);
      setError('Erro ao excluir a foto. Tente novamente.');
    }
  };
  
  // Salvar o handle do Instagram
  const handleSaveInstagram = async () => {
    try {
      // Nota: A API de configurações do Instagram ainda precisa ser implementada
      // await settingsAPI.updateInstagramHandle(instagramHandle);
      
      // Por enquanto, apenas mostrar mensagem de sucesso simulada
      alert('Handle do Instagram salvo com sucesso! (API ainda não implementada)');
    } catch (err) {
      console.error('Erro ao salvar o handle do Instagram:', err);
      setError('Erro ao salvar o handle do Instagram. Tente novamente.');
    }
  };

  return (
    <div className="admin-gallery-page">
      <div className="container">
        <header className="admin-gallery-header">
          <h1>Administração da Galeria</h1>
          <p>Gerencie as fotos exibidas na seção de galeria do site</p>
        </header>
        
        {/* Configurações do Instagram */}
        <section className="instagram-settings">
          <h2>Configurações do Instagram</h2>
          <div className="instagram-handle-form">
            <div className="form-group">
              <label htmlFor="instagramHandle">Nome de usuário do Instagram:</label>
              <div className="instagram-input-group">
                <input 
                  type="text" 
                  id="instagramHandle"
                  value={instagramHandle} 
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@seuinstagram"
                  className="form-input"
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveInstagram}
                >
                  <Save size={16} />
                  Salvar
                </button>
              </div>
              <p className="instagram-help-text">
                Este é o nome que aparecerá no botão da seção de galeria e será utilizado como link para seu perfil.
              </p>
            </div>
          </div>
        </section>
        
        {/* Botão para adicionar nova foto ou cancelar */}
        <div className="admin-gallery-actions">
          {!showForm ? (
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Upload size={16} />
              Adicionar Nova Foto
            </button>
          ) : (
            <button 
              className="btn btn-outline"
              onClick={handleCancel}
            >
              <X size={16} />
              Cancelar
            </button>
          )}
        </div>
        
        {/* Formulário de adição/edição */}
        {showForm && (
          <div className="gallery-form-container">
            <h2>{editingPhoto ? 'Editar Foto' : 'Adicionar Nova Foto'}</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="gallery-form">
              <div className="form-group">
                <label htmlFor="title">Título da Foto:</label>
                <input 
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Corte Degradê Moderno"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Categoria:</label>
                <select 
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="photo">Imagem:</label>
                <div className="file-input-container">
                  <input 
                    type="file"
                    id="photo"
                    name="photo"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="file-input"
                  />
                  <label htmlFor="photo" className="file-input-label">
                    <ImageIcon size={16} />
                    {formData.file ? 'Trocar Imagem' : 'Selecionar Imagem'}
                  </label>
                </div>
              </div>
              
              {/* Preview da imagem */}
              {previewUrl && (
                <div className="image-preview">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    crossOrigin="anonymous" 
                    {...createImageFallbackHandler(previewUrl, 'https://placehold.co/600x400/1A1A1A/FFF?text=Preview+indisponível')}
                  />
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPhoto ? 'Atualizar' : 'Adicionar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Lista de fotos */}
        <div className="photos-list-container">
          <h2>Fotos da Galeria</h2>
          
          {isLoading ? (
            <div className="loading-container">
              <span className="spinner"></span>
              <p>Carregando fotos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="empty-state">
              <ImageIcon size={48} />
              <p>Nenhuma foto encontrada</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Adicionar Primeira Foto
              </button>
            </div>
          ) : (
            <div className="photos-grid">
              {photos.map(photo => (
                <div className="photo-card" key={photo.id}>
                  <div className="photo-image">
                    <img 
                      src={photo.url} 
                      alt={photo.title} 
                      crossOrigin="anonymous" 
                      {...createImageFallbackHandler(photo.url, 'https://placehold.co/600x400/1A1A1A/FFF?text=Imagem+indisponível')}
                    />
                  </div>
                  <div className="photo-content">
                    <h3>{photo.title}</h3>
                    <p>
                      Categoria: {categories.find(c => c.id === photo.category)?.label}
                    </p>
                    <p className="photo-meta">
                      <span>{photo.likes} curtidas</span>
                      <span>Adicionado em: {new Date(photo.createdAt).toLocaleDateString('pt-BR')}</span>
                    </p>
                  </div>
                  <div className="photo-actions">
                    <button 
                      onClick={() => handleEdit(photo)} 
                      className="btn-icon edit"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(photo.id)} 
                      className="btn-icon delete"
                      title="Excluir"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
