import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload,
  DollarSign,
  Clock,
  Tag,
  FileText
} from 'lucide-react';
import type { Service } from '../../types';
import './styles.css';

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSubmit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: 'corte' as 'corte' | 'barba' | 'combo' | 'tratamento',
    image: '',
    isActive: true
  });

  const categories = [
    { value: 'corte', label: 'Corte' },
    { value: 'barba', label: 'Barba' },
    { value: 'combo', label: 'Combo' },
    { value: 'tratamento', label: 'Tratamento' }
  ];

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        image: service.image || '',
        isActive: service.isActive
      });
    }
  }, [service]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-form-modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>{service ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="service-form">
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  <Tag size={18} />
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder="Ex: Corte Masculino"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  <FileText size={18} />
                  Categoria
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duration">
                  <Clock size={18} />
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min={15}
                  max={240}
                  step={15}
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">
                  <DollarSign size={18} />
                  Preço (R$)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  <FileText size={18} />
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  maxLength={500}
                  rows={4}
                  placeholder="Descreva o serviço detalhadamente..."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="image">
                  <Upload size={18} />
                  URL da Imagem (opcional)
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {service && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Serviço ativo
                  </label>
                </div>
              )}
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
                  {service ? 'Atualizar' : 'Criar'} Serviço
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
