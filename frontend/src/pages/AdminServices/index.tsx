import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { servicesAPI } from '../../services/api';
import ServiceForm from '../../components/ServiceForm';
import type { Service } from '../../types';
import { showError, showSuccess, showDeleteConfirmation, showPermanentDeleteConfirmation } from '../../utils/alerts';
import './styles.css';

const AdminServices: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'corte', label: 'Corte' },
    { value: 'barba', label: 'Barba' },
    { value: 'combo', label: 'Combo' },
    { value: 'tratamento', label: 'Tratamento' }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAllAdmin();
      setServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      showError('Erro ao carregar serviços', 'Não foi possível carregar a lista de serviços. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDeleteService = async (service: Service) => {
    const result = await showDeleteConfirmation(
      `serviço "${service.name}"`,
      `Tem certeza que deseja desativar o serviço <strong>"${service.name}"</strong>?<br><small>O serviço ficará inativo mas poderá ser reativado depois.</small>`
    );
    
    if (result.isConfirmed) {
      try {
        await servicesAPI.delete(service._id);
        showSuccess('Sucesso!', 'Serviço desativado com sucesso!');
        loadServices();
      } catch (error) {
        console.error('Erro ao desativar serviço:', error);
        showError('Erro', 'Não foi possível desativar o serviço. Tente novamente.');
      }
    }
  };

  const handlePermanentDeleteService = async (service: Service) => {
    const result = await showPermanentDeleteConfirmation(
      service.name,
      undefined
    );
    
    if (result.isConfirmed) {
      try {
        await servicesAPI.deletePermanent(service._id);
        showSuccess('Sucesso!', 'Serviço excluído permanentemente!');
        loadServices();
      } catch (error) {
        console.error('Erro ao excluir serviço permanentemente:', error);
        showError('Erro', 'Não foi possível excluir o serviço permanentemente. Tente novamente.');
      }
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await servicesAPI.toggleActive(service._id, !service.isActive);
      showSuccess('Sucesso!', `Serviço ${service.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      loadServices();
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
      showError('Erro', 'Não foi possível alterar o status do serviço. Tente novamente.');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingService) {
        await servicesAPI.update(editingService._id, data);
        showSuccess('Sucesso!', 'Serviço atualizado com sucesso!');
      } else {
        await servicesAPI.create(data);
        showSuccess('Sucesso!', 'Serviço criado com sucesso!');
      }
      setShowForm(false);
      loadServices();
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      showError('Erro ao salvar serviço', error.response?.data?.message || 'Verifique os dados e tente novamente.');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Verificar se é admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-services-page">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-services-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gerenciar Serviços</h1>
          <div className="services-stats">
            <span className="stat-item">
              <strong>{services.filter(s => s.isActive).length}</strong> ativos
            </span>
            <span className="stat-item">
              <strong>{services.filter(s => !s.isActive).length}</strong> inativos
            </span>
            <span className="stat-item">
              <strong>{services.length}</strong> total
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreateService}>
            <Plus size={18} />
            Novo Serviço
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <Filter size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando serviços...</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <div key={service._id} className={`service-card ${!service.isActive ? 'inactive' : ''}`}>
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <div className="service-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleToggleActive(service)}
                      title={service.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {service.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEditService(service)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteService(service)}
                      title="Desativar"
                    >
                      <Trash2 size={16} />
                    </button>
                    {!service.isActive && (
                      <button
                        className="btn-icon permanent-delete"
                        onClick={() => handlePermanentDeleteService(service)}
                        title="Excluir Permanentemente"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {service.image && (
                  <div className="service-image-container">
                    <img 
                      src={service.image.startsWith('http') ? service.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${service.image}`}
                      alt={service.name} 
                      className="service-image" 
                      onError={(e) => {
                        // Fallback para quando a imagem falha ao carregar
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="service-info">
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-details">
                    <div className="detail-item">
                      <strong>Categoria:</strong>
                      <span className={`category-badge ${service.category}`}>
                        {service.category}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <strong>Duração:</strong>
                      <span>{service.duration} min</span>
                    </div>
                    
                    <div className="detail-item">
                      <strong>Preço:</strong>
                      <span className="price">R$ {service.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <strong>Status:</strong>
                      <span className={`status ${service.isActive ? 'active' : 'inactive'}`}>
                        {service.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Plus size={48} />
              <h3>Nenhum serviço encontrado</h3>
              <p>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro serviço'
                }
              </p>
              {(!searchTerm && selectedCategory === 'all') && (
                <button className="btn btn-primary" onClick={handleCreateService}>
                  <Plus size={18} />
                  Criar Primeiro Serviço
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botão Flutuante para Adicionar Mais Serviços */}
      {filteredServices.length > 0 && (
        <button 
          className="floating-add-btn" 
          onClick={handleCreateService}
          title="Adicionar Novo Serviço"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Seção de Ações Rápidas */}
      {filteredServices.length > 0 && (
        <div className="quick-actions">
          <button 
            className="btn btn-primary btn-wide" 
            onClick={handleCreateService}
          >
            <Plus size={18} />
            Adicionar Mais Serviços
          </button>
        </div>
      )}

      {showForm && (
        <ServiceForm
          service={editingService}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default AdminServices;
