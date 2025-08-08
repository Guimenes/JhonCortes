import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  History, 
  Settings, 
  LogOut, 
  X,
  Camera,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import EditProfile from '../EditProfile';
import type { Appointment, User as UserType } from '../../types';
import './styles.css';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'history'>('profile');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'appointments' || activeTab === 'history') {
      loadAppointments();
    }
  }, [activeTab]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsAPI.getMyAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    // Atualizar o contexto de autenticação também pode ser necessário
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove segundos se houver
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return '#10b981';
      case 'pendente': return '#f59e0b';
      case 'concluido': return '#6366f1';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="profile-content">
            <div className="profile-header">
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {currentUser.avatar ? (
                    <img 
                      src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${currentUser.avatar}`} 
                      alt={currentUser.name} 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="profile-initials-large">{getInitials(currentUser.name)}</span>
                  )}
                  <button className="avatar-edit-btn" title="Alterar foto" onClick={() => setShowEditProfile(true)}>
                    <Camera size={16} />
                  </button>
                </div>
                <div className="profile-info">
                  <h2>{currentUser.name}</h2>
                  <span className="profile-role">
                    {currentUser.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-field">
                <Mail className="field-icon" />
                <div className="field-content">
                  <label>Email</label>
                  <span>{currentUser.email}</span>
                </div>
              </div>
              
              <div className="profile-field">
                <Phone className="field-icon" />
                <div className="field-content">
                  <label>Telefone</label>
                  <span>{currentUser.phone}</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn btn-outline" onClick={() => setShowEditProfile(true)}>
                  <Settings size={18} />
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        );

      case 'appointments':
        const activeAppointments = appointments.filter(app => 
          app.status === 'pendente' || app.status === 'confirmado'
        );

        return (
          <div className="appointments-content">
            <h3>Meus Agendamentos</h3>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Carregando agendamentos...</p>
              </div>
            ) : activeAppointments.length > 0 ? (
              <div className="appointments-list">
                {activeAppointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <h4>{typeof appointment.service === 'object' ? appointment.service.name : 'Serviço'}</h4>
                      <span 
                        className="appointment-status"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-info">
                        <Calendar size={16} />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="appointment-info">
                        <Clock size={16} />
                        <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                      </div>
                      <div className="appointment-info">
                        <span className="price">R$ {appointment.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="appointment-notes">
                        <strong>Observações:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <p>Você não possui agendamentos ativos</p>
                <button className="btn btn-primary">
                  Agendar Horário
                </button>
              </div>
            )}
          </div>
        );

      case 'history':
        const completedAppointments = appointments.filter(app => 
          app.status === 'concluido' || app.status === 'cancelado'
        );

        return (
          <div className="history-content">
            <h3>Histórico de Serviços</h3>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Carregando histórico...</p>
              </div>
            ) : completedAppointments.length > 0 ? (
              <div className="history-list">
                {completedAppointments.map((appointment) => (
                  <div key={appointment._id} className="history-card">
                    <div className="history-header">
                      <h4>{typeof appointment.service === 'object' ? appointment.service.name : 'Serviço'}</h4>
                      <span 
                        className="history-status"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <div className="history-details">
                      <div className="history-info">
                        <Calendar size={16} />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="history-info">
                        <Clock size={16} />
                        <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                      </div>
                      <div className="history-info">
                        <span className="price">R$ {appointment.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <History size={48} />
                <p>Nenhum serviço realizado ainda</p>
                <span className="empty-subtitle">
                  Quando você realizar algum serviço, o histórico aparecerá aqui
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="user-profile-modal">
        <div className="modal-backdrop" onClick={onClose} />
        <div className="modal-content">
          <div className="modal-header">
            <h2>Meu Perfil</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="profile-nav">
            <button 
              className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              Perfil
            </button>
            <button 
              className={`nav-tab ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <Calendar size={18} />
              Agendamentos
            </button>
            <button 
              className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} />
              Histórico
            </button>
          </div>

          <div className="modal-body">
            {renderTabContent()}
          </div>

          <div className="modal-footer">
            <button className="btn btn-logout" onClick={handleLogout}>
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <EditProfile
          user={currentUser}
          onClose={() => setShowEditProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
};

export default UserProfile;
