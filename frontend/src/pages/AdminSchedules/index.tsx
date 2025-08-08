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
      alert('Erro ao carregar dados');
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
    if (window.confirm(`Tem certeza que deseja desativar o horário de ${daysOfWeek[schedule.dayOfWeek]}?`)) {
      try {
        await schedulesAPI.delete(schedule._id);
        alert('Horário desativado com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao desativar horário:', error);
        alert('Erro ao desativar horário');
      }
    }
  };

  const handleToggleScheduleActive = async (schedule: Schedule) => {
    try {
      await schedulesAPI.update(schedule._id, { isActive: !schedule.isActive });
      alert(`Horário ${schedule.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status do horário:', error);
      alert('Erro ao alterar status do horário');
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
    if (window.confirm('Tem certeza que deseja remover esta indisponibilidade?')) {
      try {
        await unavailabilitiesAPI.delete(unavailability._id);
        alert('Indisponibilidade removida com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao remover indisponibilidade:', error);
        alert('Erro ao remover indisponibilidade');
      }
    }
  };

  const handleScheduleFormSubmit = async (data: any) => {
    try {
      if (editingSchedule) {
        await schedulesAPI.update(editingSchedule._id, data);
        alert('Horário atualizado com sucesso!');
      } else {
        await schedulesAPI.create(data);
        alert('Horário criado com sucesso!');
      }
      setShowScheduleForm(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar horário:', error);
      alert(error.response?.data?.message || 'Erro ao salvar horário');
    }
  };

  const handleUnavailabilityFormSubmit = async (data: any) => {
    try {
      if (editingUnavailability) {
        await unavailabilitiesAPI.update(editingUnavailability._id, data);
        alert('Indisponibilidade atualizada com sucesso!');
      } else {
        await unavailabilitiesAPI.create(data);
        alert('Indisponibilidade criada com sucesso!');
      }
      setShowUnavailabilityForm(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar indisponibilidade:', error);
      alert(error.response?.data?.message || 'Erro ao salvar indisponibilidade');
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
        <h1>Gerenciar Horários</h1>
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
