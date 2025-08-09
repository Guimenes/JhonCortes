import React, { useState, useEffect, useRef } from 'react';
import { Scissors, Clock, ChevronRight, Star, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { servicesAPI } from '../../services/api';
import type { Service } from '../../types';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import './styles.css';

interface ServicesSectionProps {
  onBookingClick?: (service?: Service) => void; // Para integração com o modal de agendamento
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ onBookingClick }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Observador para animações ao rolar
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
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, [services]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAll();
      
      // Normalizar as URLs das imagens e filtrar apenas serviços ativos
      const normalizedServices = data
        .filter(service => service.isActive)
        .map(service => ({
          ...service,
          normalizedImageUrl: service.image ? normalizeImageUrl(service.image) : undefined
        }));
        
      setServices(normalizedServices);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      setError('Não foi possível carregar os serviços. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'corte', name: 'Cortes' },
    { id: 'barba', name: 'Barba' },
    { id: 'combo', name: 'Combos' },
    { id: 'tratamento', name: 'Tratamentos' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);
    
  // Serviços em destaque (exibe apenas 3)
  const featuredServices = services
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);
    
  // Controles do carrossel
  const nextSlide = () => {
    setCurrentSlide(prev => (prev === featuredServices.length - 1) ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0) ? featuredServices.length - 1 : prev - 1);
  };

  // Modal de detalhes do serviço
  const openServiceDetails = (service: Service) => {
    setSelectedService(service);
  };

  const closeServiceDetails = () => {
    setSelectedService(null);
  };

  // Handler para botão de agendamento
  const handleBookClick = (e: React.MouseEvent, service: Service) => {
    e.preventDefault();
    if (onBookingClick) {
      onBookingClick(service);
    }
  };

  return (
    <section id="servicos" className="services-section" ref={sectionRef}>
      <div className="services-container container">
        <div className="section-header animate-on-scroll">
          <div className="section-title">
            <div className="title-icon">
              <Scissors size={24} />
            </div>
            <h2>Nossos Serviços</h2>
          </div>
          <p className="section-description">
            Escolha entre nossa variedade de serviços profissionais para deixar seu visual impecável
          </p>
        </div>

        {loading ? (
          <div className="services-loading">
            <div className="spinner-large"></div>
            <p>Carregando serviços...</p>
          </div>
        ) : error ? (
          <div className="services-error">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadServices}>
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Destaque de serviços (Carrossel) */}
            <div className="featured-services animate-on-scroll">
              <h3 className="featured-title">Serviços em Destaque</h3>
              
              <div className="featured-carousel">
                <div 
                  className="carousel-inner" 
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredServices.map((service, index) => (
                    <div className={`carousel-item ${index === currentSlide ? 'active' : ''}`} key={service._id}>
                      <div className="featured-service">
                        {service.image && (
                          <div className="featured-service-image">
                            <img 
                              src={service.normalizedImageUrl || service.image}
                              alt={service.name}
                              {...createImageFallbackHandler(service.image)}
                            />
                            <div className="category-badge">{categories.find(c => c.id === service.category)?.name}</div>
                          </div>
                        )}
                        <div className="featured-service-content">
                          <h4>{service.name}</h4>
                          <p>{service.description}</p>
                          <div className="featured-service-meta">
                            <span className="duration">
                              <Clock size={16} />
                              {service.duration} min
                            </span>
                            <span className="featured-price">{formatPrice(service.price)}</span>
                          </div>
                          <div className="featured-buttons">
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => openServiceDetails(service)}
                            >
                              <Info size={16} /> Detalhes
                            </button>
                            <a 
                              href="#booking" 
                              className="btn btn-primary btn-sm" 
                              onClick={(e) => handleBookClick(e, service)}
                            >
                              Agendar Agora <ChevronRight size={16} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Controles do carrossel */}
                {featuredServices.length > 1 && (
                  <div className="carousel-controls">
                    <button className="carousel-control prev" onClick={prevSlide} aria-label="Serviço anterior">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="carousel-indicators">
                      {featuredServices.map((_, index) => (
                        <button 
                          key={index}
                          className={`indicator ${index === currentSlide ? 'active' : ''}`}
                          onClick={() => setCurrentSlide(index)}
                          aria-label={`Ir para serviço ${index + 1}`}
                        />
                      ))}
                    </div>
                    <button className="carousel-control next" onClick={nextSlide} aria-label="Próximo serviço">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Categorias e filtros */}
            <div className="services-filter animate-on-scroll">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Grid de serviços */}
            <div className="services-grid animate-on-scroll">
              {filteredServices.length > 0 ? (
                filteredServices.map(service => (
                  <div className="service-card" key={service._id}>
                    {service.image && (
                      <div className="service-image">
                        <img 
                          src={service.normalizedImageUrl || service.image}
                          alt={service.name}
                          {...createImageFallbackHandler(service.image)}
                        />
                        <div className="service-overlay">
                          <button 
                            className="service-details-btn"
                            onClick={() => openServiceDetails(service)}
                            aria-label="Ver detalhes do serviço"
                          >
                            <Info size={24} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="service-content">
                      <div className="service-category">
                        {categories.find(c => c.id === service.category)?.name}
                      </div>
                      <h4 className="service-title">{service.name}</h4>
                      <p className="service-description">{service.description}</p>
                      <div className="service-meta">
                        <span className="service-duration">
                          <Clock size={14} />
                          {service.duration} min
                        </span>
                        <div className="service-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < 5 ? "star filled" : "star"}
                              fill={i < 5 ? "#FFD700" : "none"}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="service-footer">
                        <span className="service-price">{formatPrice(service.price)}</span>
                        <a 
                          href="#booking" 
                          className="service-book-btn" 
                          onClick={(e) => handleBookClick(e, service)}
                        >
                          Agendar
                          <ChevronRight size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-services">
                  <p>Nenhum serviço encontrado nesta categoria.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de detalhes do serviço */}
      {selectedService && (
        <div className="service-modal-overlay" onClick={closeServiceDetails}>
          <div className="service-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeServiceDetails} aria-label="Fechar detalhes">
              &times;
            </button>
            <div className="modal-content">
              {selectedService.image && (
                <div className="modal-image">
                  <img 
                    src={selectedService.normalizedImageUrl || selectedService.image}
                    alt={selectedService.name}
                    {...createImageFallbackHandler(selectedService.image)}
                  />
                </div>
              )}
              <div className="modal-details">
                <div className="modal-category">
                  {categories.find(c => c.id === selectedService.category)?.name}
                </div>
                <h3 className="modal-title">{selectedService.name}</h3>
                <p className="modal-description">{selectedService.description}</p>
                
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <h4>Duração</h4>
                    <p>{selectedService.duration} minutos</p>
                  </div>
                  <div className="modal-info-item">
                    <h4>Preço</h4>
                    <p className="modal-price">{formatPrice(selectedService.price)}</p>
                  </div>
                </div>

                <a 
                  href="#booking" 
                  className="btn btn-primary btn-full" 
                  onClick={(e) => handleBookClick(e, selectedService)}
                >
                  Agendar este Serviço <ChevronRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;
