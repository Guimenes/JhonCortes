import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './styles.css';

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Telefone é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await registerUser(data);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Falha no cadastro. Por favor, tente novamente.');
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className="card auth-card">
          <div className="auth-logo">
            <Scissors size={32} style={{ color: 'var(--primary-gold)' }} />
            <h1 style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, var(--primary-yellow), var(--primary-gold))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 0 12px'
            }}>
              Jhon Cortes
            </h1>
          </div>
          
          <h2>Criar sua conta</h2>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              borderLeft: '4px solid var(--error)',
              color: 'var(--error)',
              padding: '12px 16px',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--spacing-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ marginRight: '8px' }} />
                Nome completo
              </label>
              <input 
                className={`form-input ${errors.name ? 'error' : ''}`} 
                placeholder="Digite seu nome completo"
                autoComplete="name"
                {...register('name')} 
              />
              {errors.name && <div className="form-error">{errors.name.message}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} style={{ marginRight: '8px' }} />
                Email
              </label>
              <input 
                className={`form-input ${errors.email ? 'error' : ''}`} 
                type="email" 
                placeholder="Digite seu email"
                autoComplete="email"
                {...register('email')} 
              />
              {errors.email && <div className="form-error">{errors.email.message}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ marginRight: '8px' }} />
                Telefone
              </label>
              <input 
                className={`form-input ${errors.phone ? 'error' : ''}`} 
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                {...register('phone')} 
              />
              {errors.phone && <div className="form-error">{errors.phone.message}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} style={{ marginRight: '8px' }} />
                Senha
              </label>
              <input 
                className={`form-input ${errors.password ? 'error' : ''}`} 
                type="password" 
                placeholder="Crie uma senha segura"
                autoComplete="new-password"
                {...register('password')} 
              />
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Criar conta'}
            </button>
          </form>
          
          <p>
            Já tem conta? <Link to="/login">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
