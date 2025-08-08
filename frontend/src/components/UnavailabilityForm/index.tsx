import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Clock,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import type { Unavailability } from '../../types';
import './styles.css';

interface UnavailabilityFormProps {
  unavailability?: Unavailability | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const UnavailabilityForm: React.FC<UnavailabilityFormProps> = ({ 
  unavailability, 
  onSubmit, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '18:00',
    reason: '',
    isActive: true
  });

  useEffect(() => {
    if (unavailability) {
      const date = new Date(unavailability.date);
      const formattedDate = date.toISOString().split('T')[0];
      
      setFormData({
        date: formattedDate,
        startTime: unavailability.startTime,
        endTime: unavailability.endTime,
        reason: unavailability.reason,
        isActive: unavailability.isActive
      });
    } else {
      // Para nova indisponibilidade, definir data mínima como hoje
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formattedToday }));
    }
  }, [unavailability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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

      // Validar se a data não é no passado (apenas para novas indisponibilidades)
      if (!unavailability) {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          alert('A data não pode ser no passado');
          return;
        }
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar indisponibilidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="unavailability-form-modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>{unavailability ? 'Editar Indisponibilidade' : 'Nova Indisponibilidade'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="unavailability-form">
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="date">
                  <Calendar size={18} />
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getTodayString()}
                  required
                />
                {formData.date && (
                  <small className="date-preview">
                    {formatDate(formData.date)}
                  </small>
                )}
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

              <div className="form-group full-width">
                <label htmlFor="reason">
                  <AlertTriangle size={18} />
                  Motivo da Indisponibilidade
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  maxLength={200}
                  rows={3}
                  placeholder="Ex: Compromisso pessoal, feriado, manutenção do estabelecimento..."
                />
                <small>{formData.reason.length}/200 caracteres</small>
              </div>

              {unavailability && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Indisponibilidade ativa
                  </label>
                </div>
              )}
            </div>

            {formData.date && formData.startTime && formData.endTime && (
              <div className="unavailability-preview">
                <h4>Resumo da Indisponibilidade:</h4>
                <p>
                  <strong>{formatDate(formData.date)}</strong>
                  {' '}das {formData.startTime} às {formData.endTime}
                </p>
                {formData.reason && (
                  <p><strong>Motivo:</strong> {formData.reason}</p>
                )}
              </div>
            )}
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
                  {unavailability ? 'Atualizar' : 'Criar'} Indisponibilidade
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnavailabilityForm;
