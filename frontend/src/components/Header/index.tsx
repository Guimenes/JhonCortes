import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Scissors, ChevronDown, Calendar, User, Home, Info, Image, Phone, Settings, 
  LogOut} from 'lucide-react';
import './Header.css';
import './auth-buttons.css';
import './mobile-menu.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../UserAvatar';

interface HeaderProps {
  onBookingClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBookingClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [headerClass, setHeaderClass] = useState('');
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Detectar scroll da página
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setHeaderClass('scrolled');
      } else {
        setHeaderClass('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
      
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Fechar menu ao mudar de rota
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };
  
  // Verificar se estamos na página atual
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleBookingClick = () => {
    if (user) {
      navigate('/booking');
    } else if (onBookingClick) {
      onBookingClick();
    }
  };

  // Hook para verificar se é mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Detecta mudanças na largura da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Portal para o overlay e menu dropdown mobile (apenas em dispositivos móveis)
  const renderMobileMenuPortal = () => {
    if (!showUserMenu || !isMobile) return null;
    
    return createPortal(
      <>
        <div className="mobile-menu-overlay" onClick={() => setShowUserMenu(false)}></div>
        <div className="mobile-user-dropdown-menu" ref={mobileUserMenuRef}>
          <button className="close-menu-btn" onClick={() => setShowUserMenu(false)}>
            <X size={20} />
          </button>
          <h3 className="mobile-menu-title">Menu do Usuário</h3>
          <Link to="/profile" onClick={() => {
            setShowUserMenu(false);
            setIsMenuOpen(false);
          }}>
            <User size={16} />
            Meu Perfil
          </Link>
          <Link to="/booking" onClick={() => {
            setShowUserMenu(false);
            setIsMenuOpen(false);
          }}>
            <Calendar size={16} />
            Meus Agendamentos
          </Link>
          <button 
            onClick={() => {
              logout();
              setShowUserMenu(false);
              setIsMenuOpen(false);
              navigate('/');
            }} 
            className="logout-button"
            type="button"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </>,
      document.body
    );
  };

  return (
    <>
    <header className={`header ${headerClass}`}>
      {/* Navbar principal */}
      <nav className="navbar">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <Scissors className="logo-icon" />
            <span className="logo-text">Jhon Cortes</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="nav-links">
            <li>
              <a 
                href="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  scrollToSection('inicio');
                }}
                className={isActive('/') ? 'active' : ''}
              >
                <Home size={16} /> Início
              </a>
            </li>
            <li>
              <a 
                href="#servicos" 
                onClick={() => scrollToSection('servicos')}
              >
                <Scissors size={16} /> Serviços
              </a>
            </li>
            <li>
              <a 
                href="#sobre" 
                onClick={() => scrollToSection('sobre')}
              >
                <Info size={16} /> Sobre
              </a>
            </li>
            <li>
              <a 
                href="#galeria" 
                onClick={() => scrollToSection('galeria')}
              >
                <Image size={16} /> Galeria
              </a>
            </li>
            <li>
              <a 
                href="#contato" 
                onClick={() => scrollToSection('contato')}
              >
                <Phone size={16} /> Contato
              </a>
            </li>
            {user?.role === 'admin' && (
              <li className="admin-dropdown" ref={dropdownRef}>
                <button 
                  className="admin-dropdown-toggle"
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                >
                  <Settings size={16} />
                  Administração
                  <ChevronDown size={14} />
                </button>
                {isAdminDropdownOpen && (
                  <div className="admin-dropdown-menu">
                    <Link to="/admin/services" onClick={() => setIsAdminDropdownOpen(false)}>
                      <Scissors size={14} /> Gerenciar Serviços
                    </Link>
                    <Link to="/admin/schedules" onClick={() => setIsAdminDropdownOpen(false)}>
                      <Calendar size={14} /> Horários e Indisponibilidades
                    </Link>
                    <Link to="/admin/gallery" onClick={() => setIsAdminDropdownOpen(false)}>
                      <Image size={14} /> Gerenciar Galeria
                    </Link>
                  </div>
                )}
              </li>
            )}
          </ul>

          {/* CTA / Auth Buttons */}
          <div className="header-cta">
            <button 
              className="btn btn-primary"
              onClick={handleBookingClick}
            >
              <Calendar size={16} />
              <span>Agendar Horário</span>
            </button>
            
            {user ? (
              <div className="user-section">
                <span className="user-greeting">Olá, {user?.name.split(' ')[0]}</span>
                <div className="user-menu-container" ref={userMenuRef}>
                  <div className="user-avatar">
                    <UserAvatar 
                      user={user!} 
                      disableProfileModal={true}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    />
                  </div>
                  {showUserMenu && !isMobile && (
                    <div className="user-dropdown-menu">
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                        <User size={16} />
                        Meu Perfil
                      </Link>
                      <Link to="/booking" onClick={() => setShowUserMenu(false)}>
                        <Calendar size={16} />
                        Meus Agendamentos
                      </Link>
                      <button onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/');
                      }} className="logout-button">
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link className="btn btn-login-modern" to="/login">
                  <User size={16} />
                  <span>Entrar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'mobile-nav-open' : ''}`}>
          <ul className="mobile-nav-links">
            <li>
              <a 
                href="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  scrollToSection('inicio');
                  setIsMenuOpen(false);
                }}
                className={isActive('/') ? 'active' : ''}
              >
                <Home size={18} /> Início
              </a>
            </li>
            <li>
              <a 
                href="#servicos" 
                onClick={() => scrollToSection('servicos')}
              >
                <Scissors size={18} /> Serviços
              </a>
            </li>
            <li>
              <a 
                href="#sobre" 
                onClick={() => scrollToSection('sobre')}
              >
                <Info size={18} /> Sobre
              </a>
            </li>
            <li>
              <a 
                href="#galeria" 
                onClick={() => scrollToSection('galeria')}
              >
                <Image size={18} /> Galeria
              </a>
            </li>
            <li>
              <a 
                href="#contato" 
                onClick={() => scrollToSection('contato')}
              >
                <Phone size={18} /> Contato
              </a>
            </li>
            
            {user?.role === 'admin' && (
              <>
                <li>
                  <Link 
                    to="/admin/services" 
                    onClick={() => setIsMenuOpen(false)}
                    className={isActive('/admin/services') ? 'active' : ''}
                  >
                    <Scissors size={18} /> Gerenciar Serviços
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/schedules" 
                    onClick={() => setIsMenuOpen(false)}
                    className={isActive('/admin/schedules') ? 'active' : ''}
                  >
                    <Calendar size={18} /> Horários e Indisponibilidades
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/gallery" 
                    onClick={() => setIsMenuOpen(false)}
                    className={isActive('/admin/gallery') ? 'active' : ''}
                  >
                    <Image size={18} /> Gerenciar Galeria
                  </Link>
                </li>
              </>
            )}
            
            <li>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleBookingClick();
                  setIsMenuOpen(false);
                }}
              >
                <Calendar size={18} />
                Agendar Horário
              </button>
            </li>
            
            {user ? (
              <li>
                <div className="mobile-user-info">
                  <span className="mobile-user-greeting">Olá, {user?.name.split(' ')[0]}!</span>
                  <div className="mobile-user-menu-container" ref={mobileUserMenuRef}>
                    <UserAvatar 
                      user={user!} 
                      disableProfileModal={true}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                    />
                  </div>
                </div>
              </li>
            ) : (
              <li>
                <Link 
                  to="/login"
                  className="btn btn-login-modern" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Entrar
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
    {renderMobileMenuPortal()}
    </>
  );
};

export default Header;
