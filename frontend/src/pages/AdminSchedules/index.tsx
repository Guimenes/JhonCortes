import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { schedulesAPI, unavailabilitiesAPI } from '../../services/api';
import ScheduleForm from '../../components/ScheduleForm';
import UnavailabilityForm from '../../components/UnavailabilityForm';
import type { Schedule, Unavailability } from '../../types';
import { showError, showSuccess, showDeleteConfirmation, showPermanentDeleteConfirmation } from '../../utils/alerts';
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

  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado'
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

  const handleDeleteSchedule = async (schedule: Schedule) => {
    const result = await showDeleteConfirmation(
      `horário de ${daysOfWeek[schedule.dayOfWeek]}`,
      `Tem certeza que deseja desativar o horário de <strong>${daysOfWeek[schedule.dayOfWeek]}</strong>?<br><small>O horário ficará inativo mas poderá ser reativado depois.</small>`
    );
    
    if (result.isConfirmed) {
      try {
        await schedulesAPI.delete(schedule._id);
        showSuccess('Sucesso!', 'Horário desativado com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao desativar horário:', error);
        showError('Erro', 'Não foi possível desativar o horário. Tente novamente.');
      }
    }
  };

  const handlePermanentDeleteSchedule = async (schedule: Schedule) => {
    const result = await showPermanentDeleteConfirmation(
      `horário de ${daysOfWeek[schedule.dayOfWeek]} (${schedule.startTime} - ${schedule.endTime})`,
      undefined
    );
    
    if (result.isConfirmed) {
      try {
        await schedulesAPI.deletePermanent(schedule._id);
        showSuccess('Sucesso!', 'Horário excluído permanentemente!');
        loadData();
      } catch (error) {
        console.error('Erro ao excluir horário permanentemente:', error);
        showError('Erro', 'Não foi possível excluir o horário permanentemente. Tente novamente.');
      }
    }
  };

  const handleToggleScheduleActive = async (schedule: Schedule) => {
    try {
      await schedulesAPI.update(schedule._id, { isActive: !schedule.isActive });
      showSuccess('Sucesso!', `Horário ${schedule.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status do horário:', error);
      showError('Erro', 'Não foi possível alterar o status do horário. Tente novamente.');
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
    const result = await showDeleteConfirmation(
      'esta indisponibilidade',
      'Tem certeza que deseja remover esta indisponibilidade?<br><small>Esta ação não pode ser desfeita.</small>'
    );
    
    if (result.isConfirmed) {
      try {
        await unavailabilitiesAPI.delete(unavailability._id);
        showSuccess('Sucesso!', 'Indisponibilidade removida com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao remover indisponibilidade:', error);
        showError('Erro', 'Não foi possível remover a indisponibilidade. Tente novamente.');
      }
    }
  };

  const handlePermanentDeleteUnavailability = async (unavailability: Unavailability) => {
    const result = await showPermanentDeleteConfirmation(
      `indisponibilidade de ${formatDate(unavailability.date)} (${unavailability.startTime} - ${unavailability.endTime})`,
      undefined
    );
    
    if (result.isConfirmed) {
      try {
        await unavailabilitiesAPI.deletePermanent(unavailability._id);
        showSuccess('Sucesso!', 'Indisponibilidade excluída permanentemente!');
        loadData();
      } catch (error) {
        console.error('Erro ao excluir indisponibilidade permanentemente:', error);
        showError('Erro', 'Não foi possível excluir a indisponibilidade permanentemente. Tente novamente.');
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

  return (
    <div className="admin-schedules-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gerenciar Horários</h1>
          <div className="schedules-stats">
            {activeTab === 'schedules' ? (
              <>
                <span className="stat-item">
                  <strong>{schedules.filter(s => s.isActive).length}</strong> horários ativos
                </span>
                <span className="stat-item">
                  <strong>{schedules.filter(s => !s.isActive).length}</strong> inativos
                </span>
                <span className="stat-item">
                  <strong>{schedules.length}</strong> total
                </span>
              </>
            ) : (
              <>
                <span className="stat-item">
                  <strong>{unavailabilities.filter(u => u.isActive).length}</strong> indisponibilidades ativas
                </span>
                <span className="stat-item">
                  <strong>{unavailabilities.filter(u => !u.isActive).length}</strong> inativas
                </span>
                <span className="stat-item">
                  <strong>{unavailabilities.length}</strong> total
                </span>
              </>
            )}
          </div>
        </div>
        <div className="header-actions">
          {activeTab === 'schedules' ? (
            <button className="btn btn-primary" onClick={handleCreateSchedule}>
              <Plus size={18} />
              Novo Horário
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleCreateUnavailability}>
              <Plus size={18} />
              Nova Indisponibilidade
            </button>
          )}
        </div>
      </div>

      <div className="tabs-section">
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

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando {activeTab === 'schedules' ? 'horários' : 'indisponibilidades'}...</p>
        </div>
      ) : (
        <>
          {activeTab === 'schedules' ? (
            <div className="schedules-grid">
              {schedules.length > 0 ? (
                schedules.map(schedule => (
                  <div key={schedule._id} className={`schedule-card ${!schedule.isActive ? 'inactive' : ''}`}>
                    <div className="schedule-header">
                      <h3>{daysOfWeek[schedule.dayOfWeek]}</h3>
                      <div className="schedule-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleToggleScheduleActive(schedule)}
                          title={schedule.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {schedule.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleEditSchedule(schedule)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteSchedule(schedule)}
                          title="Desativar"
                        >
                          <Trash2 size={16} />
                        </button>
                        {!schedule.isActive && (
                          <button
                            className="btn-icon permanent-delete"
                            onClick={() => handlePermanentDeleteSchedule(schedule)}
                            title="Excluir Permanentemente"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="schedule-info">
                      <div className="time-info">
                        <Clock size={16} />
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      
                      <div className="status-info">
                        <span className={`status ${schedule.isActive ? 'active' : 'inactive'}`}>
                          {schedule.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Clock size={48} />
                  <h3>Nenhum horário cadastrado</h3>
                  <p>Comece criando os horários de funcionamento da barbearia</p>
                  <button className="btn btn-primary" onClick={handleCreateSchedule}>
                    <Plus size={18} />
                    Criar Primeiro Horário
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="unavailabilities-grid">
              {unavailabilities.length > 0 ? (
                unavailabilities.map(unavailability => (
                  <div key={unavailability._id} className={`unavailability-card ${!unavailability.isActive ? 'inactive' : ''}`}>
                    <div className="unavailability-header">
                      <h3>{formatDate(unavailability.date)}</h3>
                      <div className="unavailability-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditUnavailability(unavailability)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteUnavailability(unavailability)}
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                        {!unavailability.isActive && (
                          <button
                            className="btn-icon permanent-delete"
                            onClick={() => handlePermanentDeleteUnavailability(unavailability)}
                            title="Excluir Permanentemente"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="unavailability-info">
                      <div className="time-info">
                        <Clock size={16} />
                        <span>{unavailability.startTime} - {unavailability.endTime}</span>
                      </div>
                      
                      <div className="reason-info">
                        <strong>Motivo:</strong>
                        <span>{unavailability.reason}</span>
                      </div>
                      
                      <div className="status-info">
                        <span className={`status ${unavailability.isActive ? 'active' : 'inactive'}`}>
                          {unavailability.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <AlertTriangle size={48} />
                  <h3>Nenhuma indisponibilidade cadastrada</h3>
                  <p>Cadastre indisponibilidades temporárias quando necessário</p>
                  <button className="btn btn-primary" onClick={handleCreateUnavailability}>
                    <Plus size={18} />
                    Criar Indisponibilidade
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Botão Flutuante para Adicionar Mais */}
      {((activeTab === 'schedules' && schedules.length > 0) || (activeTab === 'unavailabilities' && unavailabilities.length > 0)) && (
        <button 
          className="floating-add-btn" 
          onClick={activeTab === 'schedules' ? handleCreateSchedule : handleCreateUnavailability}
          title={activeTab === 'schedules' ? 'Adicionar Novo Horário' : 'Adicionar Nova Indisponibilidade'}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Seção de Ações Rápidas */}
      {activeTab === 'schedules' && schedules.length > 0 && (
        <div className="quick-actions">
          <button 
            className="btn btn-primary btn-wide" 
            onClick={handleCreateSchedule}
          >
            <Plus size={18} />
            Adicionar Mais Horários
          </button>
        </div>
      )}

      {activeTab === 'unavailabilities' && unavailabilities.length > 0 && (
        <div className="quick-actions">
          <button 
            className="btn btn-primary btn-wide" 
            onClick={handleCreateUnavailability}
          >
            <Plus size={18} />
            Adicionar Mais Indisponibilidades
          </button>
        </div>
      )}

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
