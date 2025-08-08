import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Clock,
  Calendar
} from 'lucide-react';
import type { Schedule } from '../../types';
import './styles.css';

interface ScheduleFormProps {
  schedule?: Schedule | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true
  });

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  useEffect(() => {
    if (schedule) {
      setFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive
      });
    }
  }, [schedule]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar se horário de início é anterior ao de fim
      const start = new Date(`1970-01-01T${formData.startTime}:00`);
      const end = new Date(`1970-01-01T${formData.endTime}:00`);
      
      if (start >= end) {
        alert('Horário de início deve ser anterior ao horário de fim');
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-form-modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>{schedule ? 'Editar Horário' : 'Novo Horário'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="dayOfWeek">
                  <Calendar size={18} />
                  Dia da Semana
                </label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  required
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startTime">
                  <Clock size={18} />
                  Horário de Início
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">
                  <Clock size={18} />
                  Horário de Fim
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {schedule && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Horário ativo
                  </label>
                </div>
              )}
            </div>

            <div className="time-preview">
              <h4>Resumo do Horário:</h4>
              <p>
                <strong>{daysOfWeek.find(day => day.value === formData.dayOfWeek)?.label}</strong>
                {' '}das {formData.startTime} às {formData.endTime}
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner small"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {schedule ? 'Atualizar' : 'Criar'} Horário
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
