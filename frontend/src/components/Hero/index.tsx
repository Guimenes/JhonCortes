import React from 'react';
import { Star, Award, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Hero.css';

interface HeroProps {
  onBookingClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookingClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBookingClick = () => {
    if (user) {
      navigate('/booking');
    } else if (onBookingClick) {
      onBookingClick();
    }
  };
  return (
    <section id="inicio" className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              O Melhor Corte 
              <span className="hero-highlight"> Masculino</span>
              <br />
              da Cidade
            </h1>
            
            <p className="hero-description">
              Transforme seu visual com a expertise de Jhon Cortes. 
              Mais de 10 anos criando estilos únicos e marcantes 
              para homens que não abrem mão da qualidade.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <Users />
                </div>
                <div className="stat-content">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Clientes Satisfeitos</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <Award />
                </div>
                <div className="stat-content">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Anos de Experiência</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <Star />
                </div>
                <div className="stat-content">
                  <span className="stat-number">4.9</span>
                  <span className="stat-label">Avaliação Média</span>
                </div>
              </div>
            </div>
            
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleBookingClick}
              >
                <Calendar className="btn-icon" />
                Agendar Meu Horário
              </button>
              
              <button 
                className="btn btn-outline btn-lg"
                onClick={() => {
                  const element = document.getElementById('servicos');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ver Serviços
              </button>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="hero-image-container">
              <div className="hero-image-placeholder">
                {/* Placeholder para imagem do barbeiro */}
                <div className="image-placeholder">
                  <div className="placeholder-icon">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <p>Foto do Jhon Cortes</p>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="floating-card floating-card-1">
                <div className="card-content">
                  <Star className="card-icon" />
                  <span className="card-text">Avaliação 5⭐</span>
                </div>
              </div>
              
              <div className="floating-card floating-card-2">
                <div className="card-content">
                  <Calendar className="card-icon" />
                  <span className="card-text">Agendamento Online</span>
                </div>
              </div>
              
              <div className="floating-card floating-card-3">
                <div className="card-content">
                  <Award className="card-icon" />
                  <span className="card-text">Profissional Certificado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l3 3 7-7"/>
            <path d="M7 6l3 3 7-7"/>
          </svg>
        </div>
        <span>Role para descobrir mais</span>
      </div>
    </section>
  );
};

export default Hero;
