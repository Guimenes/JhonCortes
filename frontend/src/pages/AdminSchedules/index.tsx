import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  Grid,
  List,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { schedulesAPI, unavailabilitiesAPI } from '../../services/api';
import ScheduleForm from '../../components/ScheduleForm';
import UnavailabilityForm from '../../components/UnavailabilityForm';
import type { Schedule, Unavailability } from '../../types';
import Swal from 'sweetalert2';
import { defaultConfig, showError, showSuccess } from '../../utils/alerts';
import './styles.css';

const AdminSchedules: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedules' | 'unavailabilities'>('schedules');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showUnavailabilityForm, setShowUnavailabilityForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingUnavailability, setEditingUnavailability] = useState<Unavailability | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState<number>(-1); // -1 representa todos os dias
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  const dayFilterOptions = [
    { value: -1, label: 'Todos os dias' },
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'schedules') {
        const schedulesData = await schedulesAPI.getAllAdmin();
        setSchedules(schedulesData);
      } else {
        const unavailabilitiesData = await unavailabilitiesAPI.getAllAdmin();
        setUnavailabilities(unavailabilitiesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados', 'Não foi possível carregar as informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleForm(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteSchedule = async (schedule: Schedule) => {
    const result = await Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: 'Desativar horário',
      html: `
        <div style="text-align: center;">
          <p>Tem certeza que deseja desativar o horário de <strong>${daysOfWeek[schedule.dayOfWeek]}</strong>?</p>
          <p style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">
            O horário ficará inativo mas poderá ser reativado depois.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Desativar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F59E0B',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
      width: '400px',
      backdrop: `rgba(15, 23, 42, 0.6)`
    });
    
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Desativando...',
          html: `<div class="loading-dot-container">
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                 </div>`,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          backdrop: `rgba(15, 23, 42, 0.7)`,
          didOpen: () => {
            Swal.showLoading();
            const style = document.createElement('style');
            style.innerHTML = `
              .loading-dot-container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
                margin: 20px 0;
              }
              .loading-dot {
                width: 10px;
                height: 10px;
                background-color: var(--primary-gold);
                border-radius: 50%;
                animation: dot-flashing 1s infinite alternate;
              }
              .loading-dot:nth-child(2) {
                animation-delay: 0.2s;
              }
              .loading-dot:nth-child(3) {
                animation-delay: 0.4s;
              }
              @keyframes dot-flashing {
                0% {
                  opacity: 0.2;
                  transform: scale(0.8);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `;
            document.head.appendChild(style);
          }
        });
        
        await schedulesAPI.delete(schedule._id);
        Swal.close();
        showSuccess('Sucesso!', 'Horário desativado com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao desativar horário:', error);
        showError('Erro', 'Não foi possível desativar o horário. Tente novamente.');
      }
    }
  };

  const handlePermanentDeleteSchedule = async (schedule: Schedule) => {
    const result = await Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: 'Excluir horário',
      html: `
        <div style="text-align: center;">
          <p>Tem certeza que deseja excluir o horário de <strong>${daysOfWeek[schedule.dayOfWeek]} (${schedule.startTime} - ${schedule.endTime})</strong>?</p>
          <p style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">
            Esta ação não poderá ser desfeita.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
      width: '400px',
      backdrop: `rgba(15, 23, 42, 0.6)`
    });
    
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Excluindo...',
          html: `<div class="loading-dot-container">
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                 </div>`,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          backdrop: `rgba(15, 23, 42, 0.7)`,
          didOpen: () => {
            Swal.showLoading();
            const style = document.createElement('style');
            style.innerHTML = `
              .loading-dot-container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
                margin: 20px 0;
              }
              .loading-dot {
                width: 10px;
                height: 10px;
                background-color: var(--primary-gold);
                border-radius: 50%;
                animation: dot-flashing 1s infinite alternate;
              }
              .loading-dot:nth-child(2) {
                animation-delay: 0.2s;
              }
              .loading-dot:nth-child(3) {
                animation-delay: 0.4s;
              }
              @keyframes dot-flashing {
                0% {
                  opacity: 0.2;
                  transform: scale(0.8);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `;
            document.head.appendChild(style);
          }
        });
        
        await schedulesAPI.deletePermanent(schedule._id);
        Swal.close();
        showSuccess('Concluído', 'Horário excluído com sucesso');
        loadData();
      } catch (error) {
        console.error('Erro ao excluir horário permanentemente:', error);
        showError('Erro', 'Não foi possível excluir o horário.');
      }
    }
  };

  const handleToggleScheduleActive = async (schedule: Schedule) => {
    const action = schedule.isActive ? 'desativar' : 'ativar';
    const icon = schedule.isActive ? 'question' : 'question';
    const color = schedule.isActive ? '#F59E0B' : '#10b981';
    
    const result = await Swal.fire({
      ...defaultConfig,
      icon,
      title: `${schedule.isActive ? 'Desativar' : 'Ativar'} horário`,
      html: `
        <div style="text-align: center;">
          <p>Deseja ${action} o horário de <strong>${daysOfWeek[schedule.dayOfWeek]}</strong>?</p>
          <p style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">
            ${schedule.isActive 
              ? 'O horário ficará indisponível para agendamentos.' 
              : 'O horário ficará disponível para agendamentos.'}
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: `${schedule.isActive ? 'Desativar' : 'Ativar'}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: color,
      cancelButtonColor: '#64748b',
      backdrop: `rgba(15, 23, 42, 0.6)`,
      width: '400px'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: `${schedule.isActive ? 'Desativando' : 'Ativando'}...`,
          html: `<div class="loading-dot-container">
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                 </div>`,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          backdrop: `rgba(15, 23, 42, 0.7)`,
          didOpen: () => {
            Swal.showLoading();
            const style = document.createElement('style');
            style.innerHTML = `
              .loading-dot-container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
                margin: 20px 0;
              }
              .loading-dot {
                width: 10px;
                height: 10px;
                background-color: ${schedule.isActive ? '#F59E0B' : '#10b981'};
                border-radius: 50%;
                animation: dot-flashing 1s infinite alternate;
              }
              .loading-dot:nth-child(2) {
                animation-delay: 0.2s;
              }
              .loading-dot:nth-child(3) {
                animation-delay: 0.4s;
              }
              @keyframes dot-flashing {
                0% {
                  opacity: 0.2;
                  transform: scale(0.8);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `;
            document.head.appendChild(style);
          }
        });
        
        await schedulesAPI.update(schedule._id, { isActive: !schedule.isActive });
        Swal.close();
        showSuccess('Sucesso!', `Horário ${schedule.isActive ? 'desativado' : 'ativado'} com sucesso!`);
        loadData();
      } catch (error) {
        console.error('Erro ao alterar status do horário:', error);
        Swal.close();
        showError('Erro', 'Não foi possível alterar o status do horário. Tente novamente.');
      }
    }
  };

  const handleCreateUnavailability = () => {
    setEditingUnavailability(null);
    setShowUnavailabilityForm(true);
  };

  const handleEditUnavailability = (unavailability: Unavailability) => {
    setEditingUnavailability(unavailability);
    setShowUnavailabilityForm(true);
  };

  const handleDeleteUnavailability = async (unavailability: Unavailability) => {
    const result = await Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: 'Excluir indisponibilidade',
      html: `
        <div style="text-align: center;">
          <p>Tem certeza que deseja excluir esta indisponibilidade?</p>
          <p style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">
            Esta ação não pode ser desfeita.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
      width: '400px',
      backdrop: `rgba(15, 23, 42, 0.6)`
    });
    
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Excluindo...',
          html: `<div class="loading-dot-container">
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                 </div>`,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          backdrop: `rgba(15, 23, 42, 0.7)`,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        await unavailabilitiesAPI.delete(unavailability._id);
        Swal.close();
        showSuccess('Sucesso!', 'Indisponibilidade removida com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao remover indisponibilidade:', error);
        showError('Erro', 'Não foi possível remover a indisponibilidade. Tente novamente.');
      }
    }
  };

  // Essa função é usada nos botões de exclusão permanente na renderização
  const handlePermanentDeleteUnavailability = async (unavailability: Unavailability) => {
    const result = await Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: 'Excluir indisponibilidade',
      html: `
        <div style="text-align: center;">
          <p>Tem certeza que deseja excluir permanentemente a indisponibilidade de <strong>${formatDate(unavailability.date)} (${unavailability.startTime} - ${unavailability.endTime})</strong>?</p>
          <p style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">
            Esta ação não poderá ser desfeita.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
      width: '400px',
      backdrop: `rgba(15, 23, 42, 0.6)`
    });
    
    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Excluindo...',
          html: `<div class="loading-dot-container">
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                   <div class="loading-dot"></div>
                 </div>`,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          backdrop: `rgba(15, 23, 42, 0.7)`,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        await unavailabilitiesAPI.deletePermanent(unavailability._id);
        Swal.close();
        showSuccess('Concluído', 'Indisponibilidade excluída com sucesso');
        loadData();
      } catch (error) {
        console.error('Erro ao excluir indisponibilidade permanentemente:', error);
        showError('Erro', 'Não foi possível excluir a indisponibilidade.');
      }
    }
  };

  const handleScheduleFormSubmit = async (data: any) => {
    try {
      if (editingSchedule) {
        await schedulesAPI.update(editingSchedule._id, data);
        showSuccess('Sucesso!', 'Horário atualizado com sucesso!');
      } else {
        await schedulesAPI.create(data);
        showSuccess('Sucesso!', 'Horário criado com sucesso!');
      }
      setShowScheduleForm(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar horário:', error);
      showError('Erro ao salvar horário', error.response?.data?.message || 'Verifique os dados e tente novamente.');
    }
  };

  const handleUnavailabilityFormSubmit = async (data: any) => {
    try {
      if (editingUnavailability) {
        await unavailabilitiesAPI.update(editingUnavailability._id, data);
        showSuccess('Sucesso!', 'Indisponibilidade atualizada com sucesso!');
      } else {
        await unavailabilitiesAPI.create(data);
        showSuccess('Sucesso!', 'Indisponibilidade criada com sucesso!');
      }
      setShowUnavailabilityForm(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar indisponibilidade:', error);
      showError('Erro ao salvar indisponibilidade', error.response?.data?.message || 'Verifique os dados e tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  };

  const getFormattedDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  // Filtros para os horários e indisponibilidades
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = daysOfWeek[schedule.dayOfWeek].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = dayFilter === -1 || schedule.dayOfWeek === dayFilter;
    return matchesSearch && matchesDay;
  });

  const filteredUnavailabilities = unavailabilities.filter(unavailability => {
    const matchesSearch = formatDate(unavailability.date).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unavailability.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Verificar se é admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-schedules-page">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const activeSchedulesCount = schedules.filter(s => s.isActive).length;
  const inactiveSchedulesCount = schedules.filter(s => !s.isActive).length;
  const totalSchedulesCount = schedules.length;

  const activeUnavailabilitiesCount = unavailabilities.filter(u => u.isActive).length;
  const inactiveUnavailabilitiesCount = unavailabilities.filter(u => !u.isActive).length;
  const totalUnavailabilitiesCount = unavailabilities.length;

  return (
    <div className="admin-schedules-page">
      {/* Dashboard Header */}
      <div className="schedules-dashboard">
        <div className="dashboard-grid">
          <div className="dashboard-header">
            <h1>Gerenciar Horários</h1>
            <p>Gerencie os horários de funcionamento e indisponibilidades da sua barbearia.</p>
            
            <div className="stats-container">
              {activeTab === 'schedules' ? (
                <>
                  <div className="stat-card">
                    <div className="stat-icon status-active">
                      <Eye size={24} />
                    </div>
                    <h3 className="stat-value">{activeSchedulesCount}</h3>
                    <p className="stat-label">Horários Ativos</p>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon status-inactive">
                      <EyeOff size={24} />
                    </div>
                    <h3 className="stat-value">{inactiveSchedulesCount}</h3>
                    <p className="stat-label">Horários Inativos</p>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon status-total">
                      <Clock size={24} />
                    </div>
                    <h3 className="stat-value">{totalSchedulesCount}</h3>
                    <p className="stat-label">Total de Horários</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-card">
                    <div className="stat-icon status-active">
                      <Eye size={24} />
                    </div>
                    <h3 className="stat-value">{activeUnavailabilitiesCount}</h3>
                    <p className="stat-label">Indisp. Ativas</p>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon status-inactive">
                      <EyeOff size={24} />
                    </div>
                    <h3 className="stat-value">{inactiveUnavailabilitiesCount}</h3>
                    <p className="stat-label">Indisp. Inativas</p>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon status-total">
                      <Calendar size={24} />
                    </div>
                    <h3 className="stat-value">{totalUnavailabilitiesCount}</h3>
                    <p className="stat-label">Total de Indisp.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs para alternar entre Horários e Indisponibilidades */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          <Clock size={18} />
          Horários de Funcionamento
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'unavailabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('unavailabilities')}
        >
          <AlertTriangle size={18} />
          Indisponibilidades
        </button>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-filters">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder={activeTab === 'schedules' ? "Buscar por dia..." : "Buscar indisponibilidades..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === 'schedules' && (
            <div className="day-filter">
              <Filter className="filter-icon" size={18} />
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(Number(e.target.value))}
              >
                {dayFilterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-arrow" size={18} />
            </div>
          )}
        </div>
        
        <button className="add-item-btn" onClick={activeTab === 'schedules' ? handleCreateSchedule : handleCreateUnavailability}>
          <span className="btn-plus">+</span>
          {activeTab === 'schedules' ? 'Novo Horário' : 'Nova Indisponibilidade'}
        </button>
      </div>

      {/* Main Content */}
      <div className="schedules-content">
        {/* View Toggle (apenas para horários) */}
        {activeTab === 'schedules' && (
          <div className="view-toggle">
            <button 
              className={`view-option ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
              Cards
            </button>
            <button 
              className={`view-option ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={16} />
              Tabela
            </button>
          </div>
        )}
        
        {/* Horários */}
        {activeTab === 'schedules' && (
          loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <div className="spinner"></div>
                <div className="spinner"></div>
              </div>
              <h3>Carregando horários</h3>
              <p>Por favor, aguarde enquanto carregamos os dados...</p>
            </div>
          ) : filteredSchedules.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="schedules-grid">
                {filteredSchedules.map(schedule => (
                  <div key={schedule._id} className="schedule-card">
                    <div className={`card-status-indicator ${schedule.isActive ? 'active' : 'inactive'}`}>
                      {schedule.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                    
                    <div className="schedule-content">
                      <h3 className="schedule-title">{daysOfWeek[schedule.dayOfWeek]}</h3>
                      
                      <div className="schedule-time">
                        <Clock size={20} />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      
                      <div className="schedule-meta">
                        <span className={`status-badge ${schedule.isActive ? 'active' : 'inactive'}`}>
                          {schedule.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="schedule-actions">
                        <button className="card-btn edit-btn" onClick={() => handleEditSchedule(schedule)}>
                          <Edit size={18} />
                          <span className="tooltip">Editar Horário</span>
                        </button>
                        
                        <button 
                          className={`card-btn toggle-btn ${schedule.isActive ? 'deactivate' : ''}`} 
                          onClick={() => handleToggleScheduleActive(schedule)}
                        >
                          {schedule.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          <span className="tooltip">
                            {schedule.isActive ? 'Desativar' : 'Ativar'}
                          </span>
                        </button>
                        
                        <button className="card-btn permanent-delete" onClick={() => handlePermanentDeleteSchedule(schedule)}>
                          <Trash2 size={18} />
                          <span className="tooltip">Excluir Definitivamente</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="schedules-table-container">
                <table className="schedules-table">
                  <thead>
                    <tr>
                      <th>Dia da Semana</th>
                      <th>Horário</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map(schedule => (
                      <tr key={schedule._id}>
                        <td>
                          <div className="table-day">
                            {daysOfWeek[schedule.dayOfWeek]}
                          </div>
                        </td>
                        <td>
                          <div className="table-time">
                            <Clock size={14} />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${schedule.isActive ? 'active' : 'inactive'}`}>
                            {schedule.isActive ? (
                              <>
                                <Eye size={14} />
                                Ativo
                              </>
                            ) : (
                              <>
                                <EyeOff size={14} />
                                Inativo
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className="card-btn edit-btn" 
                              onClick={() => handleEditSchedule(schedule)} 
                              title="Editar Horário"
                            >
                              <Edit size={16} />
                            </button>
                            
                            <button 
                              className={`card-btn toggle-btn ${schedule.isActive ? 'deactivate' : ''}`} 
                              onClick={() => handleToggleScheduleActive(schedule)}
                              title={schedule.isActive ? 'Desativar' : 'Ativar'}
                            >
                              {schedule.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            
                            <button 
                              className="card-btn permanent-delete" 
                              onClick={() => handlePermanentDeleteSchedule(schedule)}
                              title="Excluir Definitivamente"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="empty-state">
              <Clock size={48} />
              <h3>Nenhum horário encontrado</h3>
              {searchTerm || dayFilter !== -1 ? (
                <p>Não foram encontrados horários para os critérios selecionados. Tente ajustar os filtros ou criar um novo horário.</p>
              ) : (
                <p>Você ainda não tem horários cadastrados. Comece criando os horários de funcionamento da sua barbearia.</p>
              )}
              
              {(searchTerm || dayFilter !== -1) ? (
                <div className="empty-actions">
                  <button className="btn-secondary" onClick={() => {setSearchTerm(''); setDayFilter(-1);}}>
                    Limpar Filtros
                  </button>
                  <button className="btn-primary" onClick={handleCreateSchedule}>
                    <Plus size={18} />
                    Novo Horário
                  </button>
                </div>
              ) : (
                <button className="btn-primary" onClick={handleCreateSchedule}>
                  <Plus size={18} />
                  Criar Primeiro Horário
                </button>
              )}
            </div>
          )
        )}
        
        {/* Indisponibilidades */}
        {activeTab === 'unavailabilities' && (
          loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <div className="spinner"></div>
                <div className="spinner"></div>
              </div>
              <h3>Carregando indisponibilidades</h3>
              <p>Por favor, aguarde enquanto carregamos os dados...</p>
            </div>
          ) : filteredUnavailabilities.length > 0 ? (
            <div className="unavailabilities-grid">
              {filteredUnavailabilities.map(unavailability => (
                <div key={unavailability._id} className="unavailability-card">
                  <div className={`card-status-indicator ${unavailability.isActive ? 'active' : 'inactive'}`}>
                    {unavailability.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                  
                  <div className="unavailability-header">
                    <div className="date-container">
                      <div className="date-day">{getFormattedDay(unavailability.date)}</div>
                      <div className="date-month">{getMonthName(unavailability.date)}</div>
                    </div>
                    
                    <div className="unavailability-time">
                      <Clock size={18} />
                      <span>{unavailability.startTime} - {unavailability.endTime}</span>
                    </div>
                  </div>
                  
                  <div className="unavailability-content">
                    <div className="unavailability-reason">
                      <h4>Motivo:</h4>
                      <p>{unavailability.reason}</p>
                    </div>
                    
                    <div className="unavailability-meta">
                      <span className={`status-badge ${unavailability.isActive ? 'active' : 'inactive'}`}>
                        {unavailability.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    
                    <div className="unavailability-actions">
                      <button className="card-btn edit-btn" onClick={() => handleEditUnavailability(unavailability)}>
                        <Edit size={18} />
                        <span className="tooltip">Editar</span>
                      </button>
                      
                      <button className="card-btn permanent-delete" onClick={() => handleDeleteUnavailability(unavailability)}>
                        <Trash2 size={18} />
                        <span className="tooltip">Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <AlertTriangle size={48} />
              <h3>Nenhuma indisponibilidade encontrada</h3>
              {searchTerm ? (
                <p>Não foram encontradas indisponibilidades para os critérios de busca. Tente ajustar a pesquisa ou criar uma nova indisponibilidade.</p>
              ) : (
                <p>Você ainda não tem indisponibilidades cadastradas. Cadastre indisponibilidades temporárias quando necessário.</p>
              )}
              
              {searchTerm ? (
                <div className="empty-actions">
                  <button className="btn-secondary" onClick={() => setSearchTerm('')}>
                    Limpar Busca
                  </button>
                  <button className="btn-primary" onClick={handleCreateUnavailability}>
                    <Plus size={18} />
                    Nova Indisponibilidade
                  </button>
                </div>
              ) : (
                <button className="btn-primary" onClick={handleCreateUnavailability}>
                  <Plus size={18} />
                  Criar Indisponibilidade
                </button>
              )}
            </div>
          )
        )}
      </div>

      {showScheduleForm && (
        <ScheduleForm
          schedule={editingSchedule}
          onSubmit={handleScheduleFormSubmit}
          onClose={() => setShowScheduleForm(false)}
        />
      )}

      {showUnavailabilityForm && (
        <UnavailabilityForm
          unavailability={editingUnavailability}
          onSubmit={handleUnavailabilityFormSubmit}
          onClose={() => setShowUnavailabilityForm(false)}
        />
      )}
    </div>
  );
};

export default AdminSchedules;

