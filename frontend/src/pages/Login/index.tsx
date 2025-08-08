import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Scissors, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './styles.css';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate('/');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
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
          
          <h2>Entrar na sua conta</h2>
          
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
                <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
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
                <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Senha
              </label>
              <input 
                className={`form-input ${errors.password ? 'error' : ''}`} 
                type="password" 
                placeholder="Digite sua senha"
                autoComplete="current-password"
                {...register('password')} 
              />
              {errors.password && <div className="form-error">{errors.password.message}</div>}
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Entrar'}
            </button>
          </form>
          
          <p>
            Não tem conta? <Link to="/register">Criar conta gratuita</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
