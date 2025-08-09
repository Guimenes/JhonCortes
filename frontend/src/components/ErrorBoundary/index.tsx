import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <AlertTriangle 
              size={64} 
              style={{ 
                color: '#f59e0b', 
                marginBottom: '1.5rem' 
              }} 
            />
            
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#1a1a1a', 
              marginBottom: '1rem' 
            }}>
              Oops! Algo deu errado
            </h2>
            
            <p style={{ 
              color: '#64748b', 
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Ocorreu um erro inesperado. Tente atualizar a página ou voltar para o início.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleRefresh}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                  color: '#0D0D0D',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <RefreshCw size={18} />
                Atualizar Página
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: '#0D0D0D',
                  border: '2px solid #FFD700',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FFD700';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Home size={18} />
                Voltar ao Início
              </button>
            </div>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.875rem',
                color: '#dc2626'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre style={{ 
                  marginTop: '0.5rem', 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
