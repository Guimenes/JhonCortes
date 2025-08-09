
import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './styles.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-column">
            <div className="footer-logo">
              <h3>Jhon Cortes</h3>
              <p className="footer-tagline">Barber Shop Premium</p>
            </div>
            <p className="footer-description">
              Experiência premium de barbearia com profissionais qualificados e ambiente exclusivo.
            </p>
          </div>
          
          <div className="footer-column">
            <h4>Informações</h4>
            <div className="footer-links">
              <div className="contact-item">
                <MapPin size={16} />
                <span>Rua das Barbearias, 123 - Centro</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>(11) 99999-9999</span>
              </div>
              <div className="contact-item">
                <Clock size={16} />
                <span>Seg - Sáb: 09h às 20h</span>
              </div>
            </div>
          </div>

          <div className="footer-column">
            <h4>Links Rápidos</h4>
            <ul className="footer-nav">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/booking">Agendar</Link></li>
              <li><Link to="/services">Serviços</Link></li>
              <li><Link to="/profile">Perfil</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Jhon Cortes Barber Shop. Todos os direitos reservados.</p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="social-icon instagram"></i></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="social-icon facebook"></i></a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="social-icon whatsapp"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;