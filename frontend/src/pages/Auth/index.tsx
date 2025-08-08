import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './styles.css';

interface AuthFormData {
  name?: string;
  identifier: string; // email ou telefone para login
  email?: string; // email específico para registro
  password: string;
  confirmPassword?: string;
  phone?: string;
}

const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<AuthFormData>({
    identifier: '',
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Detecta se deve iniciar em modo login ou registro baseado na URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Formatação automática para telefone
    if (name === 'phone') {
      // Remove tudo que não for número
      const numbers = value.replace(/\D/g, '');
      
      // Aplica a máscara (11) 99999-9999
      if (numbers.length <= 2) {
        formattedValue = numbers;
      } else if (numbers.length <= 7) {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else {
        formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }

    // Formatação para identifier no modo login (permite email ou telefone)
    if (name === 'identifier' && isLogin) {
      // Se não contém @ e é numérico, aplica formatação de telefone
      if (!value.includes('@') && /^\d/.test(value)) {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) {
          formattedValue = numbers;
        } else if (numbers.length <= 7) {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else {
          formattedValue = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
      } else {
        formattedValue = value; // Para email, mantém o valor original
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Limpar erro específico quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (isLogin) {
      // Validação para login (identifier + password)
      if (!formData.identifier) {
        newErrors.identifier = 'Email ou telefone é obrigatório';
      } else {
        // Verificar se é email ou telefone
        const isEmail = formData.identifier.includes('@');
        if (isEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.identifier)) {
            newErrors.identifier = 'Email inválido';
          }
        } else {
          // Validar formato do telefone
          const phoneNumbers = formData.identifier.replace(/\D/g, '');
          if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
            newErrors.identifier = 'Telefone deve ter 10 ou 11 dígitos';
          }
        }
      }
    } else {
      // Validação para registro
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
      }

      // Validação de email para registro
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        newErrors.email = 'Email é obrigatório';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (!formData.phone || formData.phone.trim().length < 10) {
        newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
      } else {
        // Remove caracteres não numéricos para validação
        const phoneNumbers = formData.phone.replace(/\D/g, '');
        if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
          newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
        }
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    // Validação de senha (comum para login e registro)
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.identifier, formData.password);
      } else {
        await register({
          name: formData.name!,
          email: formData.email!,
          phone: formData.phone!,
          password: formData.password
        });
      }
      navigate('/');
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Erro ao processar solicitação'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    setFormData({
      identifier: '',
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      phone: ''
    });
    setErrors({});
    
    // Navega para a URL apropriada
    navigate(newIsLogin ? '/login' : '/register', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-section">
              <h1 className="brand-title">Jhon Cortes</h1>
              <p className="brand-subtitle">Barber Shop</p>
            </div>
            
            <div className="auth-tabs">
              <button 
                className={`tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  navigate('/login', { replace: true });
                }}
                type="button"
              >
                Entrar
              </button>
              <button 
                className={`tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  navigate('/register', { replace: true });
                }}
                type="button"
              >
                Criar Conta
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-content">
              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="name">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Digite seu nome completo"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
              )}

              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="phone">Telefone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              )}

              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Digite seu email"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              )}

              {isLogin && (
                <div className="input-group">
                  <label htmlFor="identifier">Email ou Telefone</label>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className={errors.identifier ? 'error' : ''}
                    placeholder="Digite seu email ou telefone"
                  />
                  {errors.identifier && <span className="error-message">{errors.identifier}</span>}
                </div>
              )}

              <div className="input-group">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Digite sua senha"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirmar Senha</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirme sua senha"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              )}

              {errors.submit && (
                <div className="error-message submit-error">
                  {errors.submit}
                </div>
              )}

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading">
                    <span className="spinner"></span>
                    Processando...
                  </span>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button 
                type="button"
                className="toggle-btn"
                onClick={toggleMode}
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="barber-pattern"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
