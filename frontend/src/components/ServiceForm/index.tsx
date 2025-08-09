import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Upload,
  DollarSign,
  Clock,
  Tag,
  FileText,
  Image,
  Trash,
  AlertTriangle,
} from 'lucide-react';
import type { Service } from '../../types';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import './styles.css';
import './loading.css';

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: FormData) => Promise<void>;
  onClose: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSubmit, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: 'corte' as 'corte' | 'barba' | 'combo' | 'tratamento',
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [_imageChanged, setImageChanged] = useState(false);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const categories = [
    { value: 'corte', label: 'Corte' },
    { value: 'barba', label: 'Barba' },
    { value: 'combo', label: 'Combo' },
    { value: 'tratamento', label: 'Tratamento' }
  ];

  // Carrega os dados do serviço quando disponíveis
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        isActive: service.isActive
      });

      if (service.image) {
        // Usar nossa função utilitária para normalizar a URL da imagem
        const normalizedUrl = normalizeImageUrl(service.image);
        console.log("URL normalizada:", normalizedUrl);
        setPreviewUrl(normalizedUrl || '');
      }
    }
  }, [service]);

  // Validação dos campos
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    if (touched.name && formData.name.trim().length === 0) {
      errors.name = 'Nome é obrigatório';
    } else if (touched.name && formData.name.length > 100) {
      errors.name = 'Nome deve ter no máximo 100 caracteres';
    }
    
    if (touched.description && formData.description.trim().length === 0) {
      errors.description = 'Descrição é obrigatória';
    } else if (touched.description && formData.description.length > 500) {
      errors.description = 'Descrição deve ter no máximo 500 caracteres';
    }
    
    if (touched.duration && (formData.duration < 15 || formData.duration > 240)) {
      errors.duration = 'Duração deve ser entre 15 e 240 minutos';
    }
    
    if (touched.price && formData.price < 0) {
      errors.price = 'Preço não pode ser negativo';
    }
    
    setValidationErrors(errors);
  }, [formData, touched]);

  const isFormValid = () => {
    return (
      formData.name.trim().length > 0 &&
      formData.name.length <= 100 &&
      formData.description.trim().length > 0 &&
      formData.description.length <= 500 &&
      formData.duration >= 15 &&
      formData.duration <= 240 &&
      formData.price >= 0 &&
      Object.keys(validationErrors).length === 0
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageChanged(true);
      setRemoveExistingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setImageChanged(true);
    setRemoveExistingImage(true);
    
    // Limpar o input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      // Marcar todos os campos como tocados para mostrar erros
      const allTouched: Record<string, boolean> = {};
      for (const key in formData) {
        allTouched[key] = true;
      }
      setTouched(allTouched);
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSubmit = new FormData();
      
      // Adicionar campos de texto
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('description', formData.description);
      formDataToSubmit.append('duration', formData.duration.toString());
      // Usar toFixed(2) para garantir que o preço tenha duas casas decimais
      formDataToSubmit.append('price', formData.price.toFixed(2));
      formDataToSubmit.append('category', formData.category);
      formDataToSubmit.append('isActive', formData.isActive.toString());
      
      // Adicionar imagem se houver uma nova
      if (imageFile) {
        console.log("Enviando nova imagem:", imageFile.name, "Tamanho:", (imageFile.size / 1024).toFixed(2) + "KB");
        formDataToSubmit.append('image', imageFile);
      }
      
      // Se for para remover a imagem existente
      if (removeExistingImage) {
        console.log("Solicitando remoção da imagem existente");
        formDataToSubmit.append('removeImage', 'true');
      }

      // Log para debugging
      console.log("Dados enviados:", {
        name: formData.name,
        description: `${formData.description.substring(0, 20)}...`,
        duration: formData.duration,
        price: formData.price.toFixed(2),
        category: formData.category,
        isActive: formData.isActive,
        hasNewImage: !!imageFile,
        removeImage: removeExistingImage
      });

      await onSubmit(formDataToSubmit);
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
                  Nome do Serviço*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  maxLength={100}
                  placeholder="Ex: Corte Masculino"
                  className={validationErrors.name && touched.name ? 'error' : ''}
                />
                {validationErrors.name && touched.name && (
                  <div className="error-message">
                    <AlertTriangle size={14} />
                    {validationErrors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  <FileText size={18} />
                  Categoria*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
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
                  Duração (minutos)*
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  min={15}
                  max={240}
                  step={15}
                  className={validationErrors.duration && touched.duration ? 'error' : ''}
                />
                {validationErrors.duration && touched.duration && (
                  <div className="error-message">
                    <AlertTriangle size={14} />
                    {validationErrors.duration}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="price">
                  <DollarSign size={18} />
                  Preço (R$)*
                </label>
                <div className="price-input-container">
                  <span className="price-prefix"></span>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price.toString().replace('.', ',')}
                    onChange={(e) => {
                      // Remove qualquer R$ e caracteres não numéricos, exceto vírgula
                      const value = e.target.value.replace(/R\$\s*/g, '').replace(/[^\d,]/g, '');
                      // Substitui vírgula por ponto para cálculo interno
                      const numericValue = parseFloat(value.replace(',', '.')) || 0;
                      setFormData(prev => ({
                        ...prev,
                        price: numericValue
                      }));
                      setTouched(prev => ({ ...prev, price: true }));
                    }}
                    onBlur={handleBlur}
                    placeholder="0,00"
                    className={validationErrors.price && touched.price ? 'error price-field' : 'price-field'}
                    inputMode="decimal"
                  />
                </div>
                {validationErrors.price && touched.price && (
                  <div className="error-message">
                    <AlertTriangle size={14} />
                    {validationErrors.price}
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  <FileText size={18} />
                  Descrição*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  maxLength={500}
                  rows={4}
                  placeholder="Descreva o serviço detalhadamente..."
                  className={validationErrors.description && touched.description ? 'error' : ''}
                />
                {validationErrors.description && touched.description && (
                  <div className="error-message">
                    <AlertTriangle size={14} />
                    {validationErrors.description}
                  </div>
                )}
                <div className="character-count">
                  {formData.description.length}/500
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="image">
                  <Image size={18} />
                  Imagem do Serviço (opcional)
                </label>
                
                {previewUrl ? (
                  <div className="image-preview-container">
                    <img 
                      src={previewUrl} 
                      alt="Prévia da imagem" 
                      className="image-preview" 
                      {...createImageFallbackHandler(previewUrl)}
                    />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={handleRemoveImage}
                    >
                      <Trash size={18} />
                      Remover Imagem
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="image-input"
                    />
                    <label htmlFor="image" className="image-upload-label">
                      <Upload size={24} />
                      <span>Clique para selecionar uma imagem</span>
                      <small>JPG, PNG, GIF ou WebP (máx. 5MB)</small>
                    </label>
                  </div>
                )}
              </div>

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
                <small className="help-text">
                  {formData.isActive ? 
                    'O serviço estará visível e disponível para agendamento' : 
                    'O serviço ficará oculto e indisponível para agendamento'}
                </small>
              </div>
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
              disabled={loading || !isFormValid()}
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
