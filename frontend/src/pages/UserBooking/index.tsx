import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Search, 
  Scissors, 
  Star, 
  MapPin, 
  Phone, 
  XCircle, 
  CalendarCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingWizard from '../../components/BookingWizard';
import type { Appointment } from '../../types';
import { appointmentsAPI } from '../../services/api';
import { showSuccess, showError, showWarning, showConfirmation } from '../../utils/alerts';
import { useAuth } from '../../hooks/useAuth';
import './styles.css';

const UserBooking: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Verificar se o usuário está autenticado
  useEffect(() => {
    console.log('UserBooking - authLoading:', authLoading, 'user:', user);
    if (!authLoading && !user) {
      console.log('Redirecionando para /login...');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Carregando dados do usuário...');
      const appointmentsData = await appointmentsAPI.getMyAppointments();
      console.log('Dados carregados:', { appointmentsData });
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, appointmentDate: string, appointmentTime: string) => {
    try {
      // Verificar regra de 2 horas de antecedência
      const appointmentDateTime = new Date(`${appointmentDate.split('T')[0]}T${appointmentTime}`);
      const now = new Date();
      
      // Calcular a diferença em horas
      const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 2) {
        // Se for menos de 2 horas antes, mostrar alerta e não permitir cancelamento
        showWarning(
          'Cancelamento não permitido',
          'Não é possível cancelar agendamentos com menos de 2 horas de antecedência. Você pode remarcar este horário diretamente na barbearia.',
          true
        );
        return;
      }

      // Confirmar cancelamento
      const { isConfirmed } = await showConfirmation(
        'Cancelar agendamento?',
        'Você está prestes a cancelar seu agendamento. Tem certeza que deseja continuar?',
        'Sim, cancelar',
        'Não, manter agendamento'
      );

      if (isConfirmed) {
        await appointmentsAPI.cancel(appointmentId);
        showSuccess('Sucesso!', 'Agendamento cancelado com sucesso!');
        loadData();
      }
    } catch (error: any) {
      showError('Erro', error.response?.data?.message || 'Não foi possível cancelar o agendamento.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'confirmado': return 'Confirmado';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      (appointment.service && typeof appointment.service === 'object' && appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const matchesTab = activeTab === 'upcoming' 
      ? ['pendente', 'confirmado'].includes(appointment.status)
      : ['concluido', 'cancelado'].includes(appointment.status);

    return matchesSearch && matchesStatus && matchesTab;
  });

  const upcomingCount = appointments.filter(app => ['pendente', 'confirmado'].includes(app.status)).length;
  const historyCount = appointments.filter(app => ['concluido', 'cancelado'].includes(app.status)).length;

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="user-booking">
        <div className="loading-section">
          <div className="loading-animation">
            <div className="spinner-modern"></div>
            <p>Verificando acesso...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se não há usuário após o loading, mostrar uma mensagem de redirecionamento
  if (!user) {
    return (
      <div className="user-booking">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="spinner-modern"></div>
          <p>Redirecionando para o login...</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-booking">
      {/* Hero Section */}
      <div className="booking-hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="welcome-badge">
              <Sparkles size={16} />
              <span>Bem-vindo{user ? `, ${user.name.split(' ')[0]}` : ''}!</span>
            </div>
            <h1>
              Seus Agendamentos
              <span className="gradient-text">Premium</span>
            </h1>
            <p>Veja seus horários na melhor barbearia da cidade</p>
            <div className="hero-stats">
              <div className="stat-item">
                <CalendarCheck size={20} />
                <span>{upcomingCount} próximos</span>
              </div>
              <div className="stat-item">
                <Clock size={20} />
                <span>{historyCount} realizados</span>
              </div>
            </div>
          </div>
          <div className="hero-action">
            <button 
              className="cta-button"
              onClick={() => setShowBookingWizard(true)}
            >
              <div className="cta-content">
                <Scissors size={24} />
                <div className="cta-text">
                  <span className="cta-title">Novo Agendamento</span>
                  <span className="cta-subtitle">Agende seu próximo corte</span>
                </div>
                <ArrowRight size={20} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="booking-navigation">
        <div className="nav-container">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <div className="nav-tab-content">
                <Calendar size={20} />
                <div className="nav-tab-text">
                  <span>Próximos</span>
                  {upcomingCount > 0 && <span className="nav-badge">{upcomingCount}</span>}
                </div>
              </div>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <div className="nav-tab-content">
                <Clock size={20} />
                <div className="nav-tab-text">
                  <span>Histórico</span>
                  {historyCount > 0 && <span className="nav-badge">{historyCount}</span>}
                </div>
              </div>
            </button>
          </div>

          <div className="nav-filters">
            <div className="filter-group">
              <div className="filter-item">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-item">
                <Filter size={18} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todos</option>
                  {activeTab === 'upcoming' ? (
                    <>
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                    </>
                  ) : (
                    <>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="booking-content">
        {loading ? (
          <div className="loading-section">
            <div className="loading-animation">
              <div className="spinner-modern"></div>
              <p>Carregando agendamentos...</p>
            </div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="appointment-luxury-grid">
            {filteredAppointments.map(appointment => (
              <div key={appointment._id} className="appointment-luxury-card">
                <div className="luxury-card-status-banner"></div>
                
                <div className="luxury-card-content">
                  {/* Título do serviço */}
                  <h3 className="luxury-service-title">
                    {appointment.service && typeof appointment.service === 'object' ? appointment.service.name : 'Serviço não encontrado'}
                  </h3>
                  
                  {/* Status com label */}
                  <div className={`luxury-status-badge status-${appointment.status}`}>
                    {getStatusLabel(appointment.status)}
                  </div>
                  
                  {/* Informações principais */}
                  <div className="luxury-info-section">
                    <div className="luxury-info-group">
                      <div className="luxury-info-label">
                        <Calendar size={16} />
                        <span>Data</span>
                      </div>
                      <div className="luxury-info-value">
                        {formatDate(appointment.date).split(',')[1]}
                      </div>
                    </div>
                    
                    <div className="luxury-info-group">
                      <div className="luxury-info-label">
                        <Clock size={16} />
                        <span>Horário</span>
                      </div>
                      <div className="luxury-info-value highlight">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </div>
                    </div>
                    
                    {appointment.service && typeof appointment.service === 'object' && (
                      <>
                        <div className="luxury-info-group">
                          <div className="luxury-info-label">
                            <Clock size={16} />
                            <span>Duração</span>
                          </div>
                          <div className="luxury-info-value">{appointment.service.duration} min</div>
                        </div>
                        
                        <div className="luxury-info-group">
                          <div className="luxury-info-label">
                            <Star size={16} />
                            <span>Valor</span>
                          </div>
                          <div className="luxury-info-value highlight-price">{formatPrice(appointment.totalPrice)}</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Notas do agendamento */}
                  {appointment.notes && (
                    <div className="luxury-notes">
                      <div className="luxury-notes-content">
                        <p>{appointment.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Ações do card */}
                  {activeTab === 'upcoming' && appointment.status !== 'cancelado' && (
                    <div className="luxury-card-actions">
                      <button
                        className="luxury-cancel-btn"
                        onClick={() => handleCancelAppointment(appointment._id, appointment.date, appointment.startTime)}
                      >
                        <XCircle size={16} />
                        <span>Cancelar Agendamento</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Badge do dia da semana removido conforme solicitado */}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-modern">
            <div className="empty-icon">
              {activeTab === 'upcoming' ? <CalendarCheck size={64} /> : <Clock size={64} />}
            </div>
            <h3>
              {activeTab === 'upcoming' 
                ? 'Nenhum agendamento próximo' 
                : 'Histórico vazio'}
            </h3>
            <p>
              {activeTab === 'upcoming' 
                ? 'Que tal agendar um horário? Nossa equipe está pronta para cuidar de você!'
                : 'Seus agendamentos concluídos aparecerão aqui.'}
            </p>
            {activeTab === 'upcoming' && (
              <button 
                className="empty-cta"
                onClick={() => setShowBookingWizard(true)}
              >
                <Plus size={20} />
                Fazer Primeiro Agendamento
              </button>
            )}
          </div>
        )}
      </div>

          {/* Footer */}
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
                <li><a href="/">Home</a></li>
                <li><a href="#" onClick={() => setShowBookingWizard(true)}>Agendar</a></li>
                <li><a href="/services">Serviços</a></li>
                <li><a href="/profile">Perfil</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Jhon Cortes Barber Shop. Todos os direitos reservados.</p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><i className="social-icon instagram"></i></a>
              <a href="#" aria-label="Facebook"><i className="social-icon facebook"></i></a>
              <a href="#" aria-label="WhatsApp"><i className="social-icon whatsapp"></i></a>
            </div>
          </div>
        </div>
      </footer>

      {showBookingWizard && (
        <React.Suspense fallback={<div>Carregando...</div>}>
          <BookingWizard
            onClose={() => setShowBookingWizard(false)}
            onSuccess={loadData}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default UserBooking;
