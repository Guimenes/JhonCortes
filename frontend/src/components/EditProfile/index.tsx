import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  User, 
  Phone, 
  Save
} from 'lucide-react';
import { authAPI } from '../../services/api';
import type { User as UserType } from '../../types';
import { showError, showSuccess, showWarning } from '../../utils/alerts';
import './styles.css';

interface EditProfileProps {
  user: UserType;
  onClose: () => void;
  onUpdate: (user: UserType) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showWarning('Arquivo inválido', 'Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc.)');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showWarning('Arquivo muito grande', 'O arquivo deve ter no máximo 5MB. Tente comprimir a imagem.');
        return;
      }

      setAvatarFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await authAPI.updateProfileWithAvatar(formDataToSend);

      onUpdate(response.user);
      localStorage.setItem('user', JSON.stringify(response.user)); // Atualizar localStorage
      onClose();

      // Feedback visual
      showSuccess('Perfil Atualizado!', 'Suas informações foram atualizadas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      showError('Erro ao atualizar perfil', error.response?.data?.message || 'Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentAvatar = () => {
    if (avatarPreview) return avatarPreview;
    if (user.avatar) return `${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${user.avatar}`;
    return null;
  };

  return (
    <div className="edit-profile-modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Perfil</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="modal-body">
            {/* Avatar Section */}
            <div className="avatar-section">
              <div className="current-avatar" onClick={() => fileInputRef.current?.click()}>
                {getCurrentAvatar() ? (
                  <img src={getCurrentAvatar()!} alt="Avatar" />
                ) : (
                  <span className="avatar-initials">{getInitials(formData.name)}</span>
                )}
                <div className="avatar-overlay">
                  <Camera size={24} />
                  <span>Alterar Foto</span>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
              
              <div className="avatar-info">
                <p>Clique na imagem para alterar</p>
                <small>Formatos: JPG, PNG, GIF, WebP (máx. 5MB)</small>
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="name">
                  <User size={18} />
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={18} />
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="form-group readonly">
                <label>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="readonly-field"
                />
                <small>O email não pode ser alterado</small>
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
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
