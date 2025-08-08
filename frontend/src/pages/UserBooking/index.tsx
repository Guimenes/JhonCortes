import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Filter, Search } from 'lucide-react';
import BookingWizard from '../../components/BookingWizard';
import type { Appointment, Service } from '../../types';
import { appointmentsAPI, servicesAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/alerts';
import './styles.css';

const UserBooking: React.FC = () => {
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, servicesData] = await Promise.all([
        appointmentsAPI.getMyAppointments(),
        servicesAPI.getAll()
      ]);
      setAppointments(appointmentsData);
      setServices(servicesData.filter(service => service.isActive));
    } catch (error) {
      showError('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentsAPI.cancel(appointmentId);
      showSuccess('Sucesso!', 'Agendamento cancelado com sucesso!');
      loadData();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return '#f59e0b';
      case 'confirmado': return '#10b981';
      case 'concluido': return '#6366f1';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
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
      (typeof appointment.service === 'object' && appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const matchesTab = activeTab === 'upcoming' 
      ? ['pendente', 'confirmado'].includes(appointment.status)
      : ['concluido', 'cancelado'].includes(appointment.status);

    return matchesSearch && matchesStatus && matchesTab;
  });

  const upcomingCount = appointments.filter(app => ['pendente', 'confirmado'].includes(app.status)).length;
  const historyCount = appointments.filter(app => ['concluido', 'cancelado'].includes(app.status)).length;

  return (
    <div className="user-booking">
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Meus Agendamentos</h1>
            <p>Gerencie seus horários na barbearia</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowBookingWizard(true)}
          >
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs-section">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <Calendar size={18} />
              Próximos
              {upcomingCount > 0 && <span className="tab-count">{upcomingCount}</span>}
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <Clock size={18} />
              Histórico
              {historyCount > 0 && <span className="tab-count">{historyCount}</span>}
            </button>
          </div>

          <div className="filters-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-box">
              <Filter size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
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

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando agendamentos...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="appointments-grid">
            {filteredAppointments.map(appointment => (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-header">
                  <div className="service-info">
                    <h3>
                      {typeof appointment.service === 'object' 
                        ? appointment.service.name 
                        : 'Serviço não encontrado'}
                    </h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  <div className="appointment-price">
                    {formatPrice(appointment.totalPrice)}
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                  </div>
                  {typeof appointment.service === 'object' && (
                    <div className="detail-item">
                      <span className="duration-badge">
                        {appointment.service.duration} min
                      </span>
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <div className="appointment-notes">
                    <strong>Observações:</strong>
                    <p>{appointment.notes}</p>
                  </div>
                )}

                {activeTab === 'upcoming' && appointment.status !== 'cancelado' && (
                  <div className="appointment-actions">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelAppointment(appointment._id)}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>
              {activeTab === 'upcoming' 
                ? 'Nenhum agendamento próximo' 
                : 'Nenhum histórico encontrado'}
            </h3>
            <p>
              {activeTab === 'upcoming' 
                ? 'Que tal agendar um horário? Estamos prontos para cuidar de você!'
                : 'Seus agendamentos concluídos e cancelados aparecerão aqui.'}
            </p>
            {activeTab === 'upcoming' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowBookingWizard(true)}
              >
                <Plus size={18} />
                Fazer Agendamento
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {services.length > 0 && (
        <div className="quick-stats">
          <h3>Nossos Serviços</h3>
          <div className="services-preview">
            {services.slice(0, 3).map(service => (
              <div key={service._id} className="service-preview-card">
                {service.image && (
                  <div className="service-preview-image">
                    <img src={service.image} alt={service.name} />
                  </div>
                )}
                <div className="service-preview-info">
                  <h4>{service.name}</h4>
                  <p>{service.duration} min • {formatPrice(service.price)}</p>
                </div>
              </div>
            ))}
            <button 
              className="service-preview-card add-service"
              onClick={() => setShowBookingWizard(true)}
            >
              <Plus size={24} />
              <span>Agendar Serviço</span>
            </button>
          </div>
        </div>
      )}

      {showBookingWizard && (
        <BookingWizard
          onClose={() => setShowBookingWizard(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default UserBooking;
