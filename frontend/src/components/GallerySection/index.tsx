import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Instagram, Eye, ThumbsUp } from 'lucide-react';
import { galleryAPI } from '../../services/api';
import { createImageFallbackHandler } from '../../utils/imageUtils';
import './styles.css';

// Interface adaptada para compatibilidade com a API
interface GalleryPhoto {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  normalizedImageUrl?: string; // URL normalizada para exibição
  likes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const GallerySection: React.FC = () => {
  // Estado para controle do slide atual
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<GalleryPhoto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [instagramHandle] = useState('@jhoncortesbarbershop');
  const sliderRef = useRef<HTMLDivElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  // Categorias para filtro
  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'cortes', label: 'Cortes' },
    { id: 'barbas', label: 'Barbas' },
    { id: 'tratamentos', label: 'Tratamentos' },
    { id: 'estilos', label: 'Estilos Completos' },
  ];

  // Dados da galeria (inicialmente vazio)
  const [galleryData, setGalleryData] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Efeito para carregar as fotos da galeria da API
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setIsLoading(true);
        const photos = await galleryAPI.getAll();
        
        console.log('Fotos recebidas da API:', photos);
        
        // Função para normalizar URLs de imagens da galeria
        const normalizeGalleryImageUrl = (imageUrl: string) => {
          // Se já for uma URL completa, retorna como está
          if (imageUrl.startsWith('http')) {
            return imageUrl;
          }
          
          // Caso contrário, constrói a URL completa
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
          return `${baseUrl}${imageUrl}`;
        };
        
        // Converter o formato da API para o formato usado pelo componente
        const formattedPhotos = photos.map(photo => {
          return {
            _id: photo._id,
            title: photo.title,
            category: photo.category,
            imageUrl: photo.imageUrl, // Manter o URL original
            normalizedImageUrl: normalizeGalleryImageUrl(photo.imageUrl), // URL normalizada
            likes: photo.likes,
            isActive: photo.isActive,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt
          };
        });
        
        console.log('Fotos formatadas para exibição:', formattedPhotos);
        setGalleryData(formattedPhotos);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar fotos da galeria:', error);
        setIsLoading(false);
      }
    };
    
    fetchGalleryData();
  }, []);

  // Filtrar fotos por categoria
  const filteredPhotos = selectedCategory === 'todos' 
    ? galleryData 
    : galleryData.filter(photo => photo.category === selectedCategory);

  // Efeito para animações ao rolar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const animatedElements = document.querySelectorAll('.gallery-animate');
    animatedElements.forEach(el => observer.observe(el));
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);
  
  // Comentado temporariamente até termos a API de configurações do Instagram
  /*
  useEffect(() => {
    const fetchInstagramSettings = async () => {
      try {
        // Implementar quando a API estiver pronta
        // const settings = await settingsAPI.getInstagramHandle();
        // setInstagramHandle(settings.handle);
      } catch (error) {
        console.error('Erro ao buscar configurações do Instagram:', error);
      }
    };
    
    fetchInstagramSettings();
  }, []);
  */

  // Funções de controle do carrossel
  const nextSlide = () => {
    const totalSlides = Math.ceil(filteredPhotos.length / 4);
    if (totalSlides > 1) {
      setActiveSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }
  };

  const prevSlide = () => {
    const totalSlides = Math.ceil(filteredPhotos.length / 4);
    if (totalSlides > 1) {
      setActiveSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
    }
  };

  // Funções para controle por toque/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 100) {
      nextSlide();
    }

    if (touchEndX - touchStartX > 100) {
      prevSlide();
    }
  };

  // Funções para o modal
  const openModal = (photo: GalleryPhoto) => {
    // Garantir que a imagem tenha uma URL normalizada
    if (!photo.normalizedImageUrl) {
      const normalizedUrl = photo.imageUrl.startsWith('http')
        ? photo.imageUrl
        : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${photo.imageUrl}`;
      
      photo = { ...photo, normalizedImageUrl: normalizedUrl };
    }
    
    setModalImage(photo);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  // Função para curtir uma foto
  const likePhoto = async (photoId: string) => {
    try {
      console.log('Curtindo foto:', photoId);
      const response = await galleryAPI.like(photoId);
      console.log('Resposta da API:', response);
      
      // Atualizar o número de curtidas na lista
      setGalleryData(prevData => 
        prevData.map(photo => 
          photo._id === photoId 
            ? { ...photo, likes: response.likes } 
            : photo
        )
      );
      
      // Se a foto estiver aberta no modal, atualizar lá também
      if (modalImage && modalImage._id === photoId) {
        setModalImage(prev => prev ? { ...prev, likes: response.likes } : null);
      }
    } catch (error) {
      console.error('Erro ao curtir foto:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
    document.body.style.overflow = 'auto';
  };

  // Efeito para resetar o slide atual quando a categoria muda
  useEffect(() => {
    // Resetar o slide atual ao mudar de categoria
    setActiveSlide(0);
  }, [selectedCategory, filteredPhotos.length]);

  return (
    <section id="galeria" className="gallery-section">
      <div className="container">
        <div className="gallery-header gallery-animate">
          <div className="section-subtitle">
            <div className="subtitle-icon">
              <Eye size={16} />
            </div>
            <span>NOSSOS TRABALHOS</span>
          </div>
          <h2 className="section-title">Galeria de Transformações</h2>
          <p className="gallery-description">
            Confira alguns dos nossos melhores trabalhos realizados na barbearia.
            Cada imagem representa a qualidade e o cuidado que temos com nossos clientes.
          </p>
        </div>

        {/* Filtros de categoria */}
        <div className="gallery-filters gallery-animate">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`gallery-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Carrossel de galeria */}
        <div className="gallery-container" ref={galleryContainerRef}>
          {isLoading ? (
            <div className="gallery-loading">
              <span className="spinner"></span>
              <p>Carregando imagens...</p>
            </div>
          ) : (
          <div 
            className="gallery-slider" 
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {filteredPhotos
              .slice(activeSlide * 4, (activeSlide + 1) * 4)
              .map((photo) => (
                <div className="gallery-item gallery-animate" key={photo._id}>
                  <div className="gallery-image-wrapper">
                    <img 
                      src={photo.normalizedImageUrl || photo.imageUrl}
                      alt={photo.title} 
                      className="gallery-image"
                      onClick={() => openModal(photo)}
                      loading="lazy"
                      crossOrigin="anonymous"
                      {...createImageFallbackHandler(photo.imageUrl, "https://placehold.co/600x800/1A1A1A/FFD700?text=Imagem+Indisponível")}
                    />
                    <div className="gallery-overlay">
                      <h3>{photo.title}</h3>
                      <div className="gallery-meta">
                        <button 
                          className="gallery-likes"
                          onClick={(e) => {
                            e.stopPropagation();
                            likePhoto(photo._id);
                          }}
                        >
                          <ThumbsUp size={16} />
                          {photo.likes}
                        </button>
                      </div>
                      <button 
                        className="gallery-view-btn"
                        onClick={() => openModal(photo)}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          )}

          {/* Controles do carrossel */}
          {!isLoading && filteredPhotos.length > 4 && (
            <div className="gallery-controls">
              <button className="gallery-control prev" onClick={prevSlide}>
                <ChevronLeft size={24} />
              </button>
              <button className="gallery-control next" onClick={nextSlide}>
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        {/* Indicadores de slide */}
        {!isLoading && filteredPhotos.length > 4 && (
          <div className="gallery-indicators">
            {Array.from({ length: Math.ceil(filteredPhotos.length / 4) }).map((_, index) => (
              <button 
                key={index}
                className={`gallery-indicator ${activeSlide === index ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        )}

        {/* Instagram CTA */}
        <div className="instagram-cta gallery-animate">
          <div className="instagram-icon">
            <Instagram size={32} />
          </div>
          <div className="instagram-content">
            <h3>Siga-nos no Instagram</h3>
            <p>Acompanhe nossos trabalhos mais recentes e novidades da barbearia</p>
          </div>
          <a 
            href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
          >
            {instagramHandle}
          </a>
        </div>
      </div>

      {/* Modal de visualização */}
      {isModalOpen && modalImage && (
        <div className="gallery-modal" onClick={closeModal}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeModal}>×</button>
            <img 
              src={modalImage.normalizedImageUrl || modalImage.imageUrl}
              alt={modalImage.title} 
              className="gallery-modal-image"
              crossOrigin="anonymous"
              {...createImageFallbackHandler(modalImage.imageUrl, "https://placehold.co/600x800/1A1A1A/FFD700?text=Imagem+Indisponível")}
            />
            <div className="gallery-modal-info">
              <h3>{modalImage.title}</h3>
              <p>Categoria: {categories.find(cat => cat.id === modalImage.category)?.label}</p>
              <div className="gallery-modal-meta">
                <button 
                  className="gallery-likes"
                  onClick={() => likePhoto(modalImage._id)}
                >
                  <ThumbsUp size={16} />
                  {modalImage.likes}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
