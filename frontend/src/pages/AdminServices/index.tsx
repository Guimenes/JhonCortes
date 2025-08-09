import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye, 
  EyeOff, 
  Scissors,
  Clock,
  Grid,
  List,
  ChevronDown,
  Tag
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { servicesAPI } from '../../services/api';
import ServiceForm from '../../components/ServiceForm';
import type { Service } from '../../types';
import Swal from 'sweetalert2';
import { defaultConfig, showError, showSuccess } from '../../utils/alerts';
import { normalizeImageUrl, createImageFallbackHandler } from '../../utils/imageUtils';
import './styles.css';

const AdminServices: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

  // Agora usamos a função de utilidade do projeto
  // Sem necessidade de redefinir a função aqui

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAllAdmin();
      
      console.log("Dados brutos recebidos do backend:", data.map(s => ({
        id: s._id,
        name: s.name,
        image: s.image || 'sem imagem'
      })));
      
      // Normalizar as URLs das imagens usando nossa função utilitária
      const servicesWithNormalizedImages = data.map(service => {
        // Se o serviço tem uma imagem, normalizar a URL
        if (service.image) {
          const normalizedUrl = normalizeImageUrl(service.image);
          console.log(`Serviço ${service.name}: Imagem original=${service.image}, Normalizada=${normalizedUrl}`);
          return {
            ...service,
            normalizedImageUrl: normalizedUrl
          };
        }
        
        return {
          ...service,
          normalizedImageUrl: undefined
        };
      });
      
      console.log("Configurações do ambiente:", {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        modoDesenvolvimento: import.meta.env.DEV ? "sim" : "não"
      });
      
      setServices(servicesWithNormalizedImages);
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

  // Esta função foi removida pois a funcionalidade de desativar foi movida para handleToggleActive

  const handlePermanentDeleteService = async (service: Service) => {
    // Modal de exclusão simples, moderno e minimalista
    const result = await Swal.fire({
      ...defaultConfig,
      icon: 'warning',
      title: 'Excluir serviço',
      html: `
        <div style="text-align: center;">
          <p>Tem certeza que deseja excluir o serviço <strong>"${service.name}"</strong>?</p>
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
      showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      },
      backdrop: `rgba(15, 23, 42, 0.6)`
    });
    
    if (result.isConfirmed) {
      try {
        // Modal de loading minimalista
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
            // Adiciona estilos customizados para o loading
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
        
        await servicesAPI.deletePermanent(service._id);
        Swal.close();
        
        showSuccess('Concluído', 'Serviço excluído com sucesso');
        loadServices();
      } catch (error) {
        console.error('Erro ao excluir serviço permanentemente:', error);
        showError('Erro', 'Não foi possível excluir o serviço.');
      }
    }
  };

  const handleToggleActive = async (service: Service) => {
    const action = service.isActive ? 'desativar' : 'ativar';
    const icon = service.isActive ? 'question' : 'question';
    const color = service.isActive ? '#F59E0B' : '#10b981';
    
    const result = await Swal.fire({
      ...defaultConfig,
      icon,
      title: `${service.isActive ? 'Desativar' : 'Ativar'} serviço`,
      html: `
        <div style="text-align: center;">
          <p>Deseja ${action} o serviço <strong>"${service.name}"</strong>?</p>
          <p style="margin-top: 10px; font-size: 0.9rem; color: #64748b;">
            ${service.isActive 
              ? 'O serviço ficará oculto para os clientes.' 
              : 'O serviço ficará visível para os clientes.'}
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: `${service.isActive ? 'Desativar' : 'Ativar'}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: color,
      cancelButtonColor: '#64748b',
      backdrop: `rgba(15, 23, 42, 0.6)`,
      showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      },
      width: '400px'
    });

    if (result.isConfirmed) {
      try {
        // Mostrar loading durante a operação
        Swal.fire({
          title: `${service.isActive ? 'Desativando' : 'Ativando'}...`,
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
            // Adiciona estilos customizados para o loading
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
                background-color: ${service.isActive ? '#F59E0B' : '#10b981'};
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
        
        // Fazer a chamada à API
        await servicesAPI.toggleActive(service._id, !service.isActive);
        Swal.close();
        
        showSuccess('Sucesso!', `Serviço ${service.isActive ? 'desativado' : 'ativado'} com sucesso!`);
        loadServices();
      } catch (error) {
        console.error('Erro ao alterar status do serviço:', error);
        Swal.close();
        showError('Erro', 'Não foi possível alterar o status do serviço. Tente novamente.');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      console.log("Enviando dados para salvar serviço:", {
        editando: !!editingService,
        id: editingService?._id,
        temImagem: data.get('image') instanceof File,
        removeImagem: data.get('removeImage') === 'true'
      });
      
      let response;
      
      if (editingService) {
        response = await servicesAPI.update(editingService._id, data);
        showSuccess('Sucesso!', 'Serviço atualizado com sucesso!');
        console.log("Serviço atualizado:", response.service);
      } else {
        response = await servicesAPI.create(data);
        showSuccess('Sucesso!', 'Serviço criado com sucesso!');
        console.log("Novo serviço criado:", response.service);
      }
      
      setShowForm(false);
      
      // Dar um pequeno delay antes de recarregar os serviços
      // para garantir que o servidor já processou as imagens
      setTimeout(() => {
        loadServices();
      }, 300);
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

  const activeCount = services.filter(s => s.isActive).length;
  const inactiveCount = services.filter(s => !s.isActive).length;
  const totalCount = services.length;

  return (
    <div className="admin-services-page">
      {/* Dashboard Header */}
      <div className="services-dashboard">
        <div className="dashboard-grid">
          <div className="dashboard-header">
            <h1>Gerenciar Serviços</h1>
            <p>Gerencie os serviços oferecidos pela sua barbearia. Adicione, edite ou remova serviços conforme necessário.</p>
            
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon status-active">
                  <Eye size={24} />
                </div>
                <h3 className="stat-value">{activeCount}</h3>
                <p className="stat-label">Serviços Ativos</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon status-inactive">
                  <EyeOff size={24} />
                </div>
                <h3 className="stat-value">{inactiveCount}</h3>
                <p className="stat-label">Serviços Inativos</p>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon status-total">
                  <Scissors size={24} />
                </div>
                <h3 className="stat-value">{totalCount}</h3>
                <p className="stat-label">Total de Serviços</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-filters">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-filter">
            <Filter className="filter-icon" size={18} />
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
            <ChevronDown className="select-arrow" size={18} />
          </div>
        </div>
        
        <button className="add-service-btn" onClick={handleCreateService}>
          <span className="btn-plus">+</span>
          Novo Serviço
        </button>
      </div>

      {/* Main Content */}
      <div className="services-content">
        {/* View Toggle */}
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
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <div className="spinner"></div>
              <div className="spinner"></div>
            </div>
            <h3>Carregando serviços</h3>
            <p>Por favor, aguarde enquanto carregamos os dados...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="services-grid">
              {filteredServices.map(service => (
                <div key={service._id} className="service-card">
                  <div className={`card-status-indicator ${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                  
                  {service.image && (
                    <div className="service-image-container">
                      <img 
                        src={service.normalizedImageUrl || service.image}
                        alt={service.name} 
                        className="service-image" 
                        {...createImageFallbackHandler(service.image, 'https://placehold.co/600x400/1A1A1A/FFF?text=Sem+Imagem')}
                      />
                      <div className="service-image-overlay">
                        <div className="service-price">
                          R$ {service.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="service-content">
                    <h3 className="service-title">{service.name}</h3>
                    <p className="service-description">{service.description}</p>
                    
                    <div className="service-meta">
                      <div className="meta-item">
                        <span className="meta-label">Categoria</span>
                        <div className="meta-value">
                          <Tag size={16} className="meta-icon" />
                          <span className={`category-badge ${service.category}`}>
                            {service.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-label">Duração</span>
                        <div className="meta-value">
                          <Clock size={16} className="meta-icon" />
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="service-actions">
                      <button className="card-btn edit-btn" onClick={() => handleEditService(service)}>
                        <Edit size={18} />
                        <span className="tooltip">Editar Serviço</span>
                      </button>
                      
                      <button 
                        className={`card-btn toggle-btn ${service.isActive ? 'deactivate' : ''}`} 
                        onClick={() => handleToggleActive(service)}
                      >
                        {service.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                        <span className="tooltip">
                          {service.isActive ? 'Desativar (Ocultar)' : 'Ativar (Mostrar)'}
                        </span>
                      </button>
                      
                      {/* Botão de excluir permanentemente agora está sempre visível */}
                      <button className="card-btn permanent-delete" onClick={() => handlePermanentDeleteService(service)}>
                        <Trash2 size={18} />
                        <span className="tooltip">Excluir Definitivamente</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="services-table-container">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Duração</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map(service => (
                    <tr key={service._id}>
                      <td>
                        <div className="table-name">
                          {service.image && (
                            <img 
                              src={service.normalizedImageUrl || service.image}
                              alt={service.name}
                              className="table-image"
                              {...createImageFallbackHandler(service.image, 'https://placehold.co/100x100/1A1A1A/FFF?text=NA')}
                            />
                          )}
                          {service.name}
                        </div>
                      </td>
                      <td>
                        <span className={`category-badge ${service.category}`}>
                          {service.category}
                        </span>
                      </td>
                      <td>
                        <span className="price">R$ {service.price.toFixed(2)}</span>
                      </td>
                      <td>{service.duration} min</td>
                      <td>
                        <span className={`status-pill ${service.isActive ? 'active' : 'inactive'}`}>
                          {service.isActive ? (
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
                            onClick={() => handleEditService(service)} 
                            title="Editar Serviço"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button 
                            className={`card-btn toggle-btn ${service.isActive ? 'deactivate' : ''}`} 
                            onClick={() => handleToggleActive(service)}
                            title={service.isActive ? 'Desativar (Ocultar)' : 'Ativar (Mostrar)'}
                          >
                            {service.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          
                          {/* Botão de excluir permanentemente agora está sempre visível */}
                          <button 
                            className="card-btn permanent-delete" 
                            onClick={() => handlePermanentDeleteService(service)}
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
            <div className="empty-state-icon">
              <Scissors size={32} />
            </div>
            <h3>Nenhum serviço encontrado</h3>
            <p>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Os critérios de busca não retornaram resultados. Tente ajustar os filtros ou criar um novo serviço.'
                : 'Parece que você ainda não tem serviços cadastrados. Comece criando seu primeiro serviço agora!'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <button className="btn-primary" onClick={handleCreateService}>
                <Plus size={18} />
                Criar Primeiro Serviço
              </button>
            )}
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="empty-actions">
                <button className="btn-secondary" onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}>
                  Limpar Filtros
                </button>
                <button className="btn-primary" onClick={handleCreateService}>
                  <Plus size={18} />
                  Novo Serviço
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
