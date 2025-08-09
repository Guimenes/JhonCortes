import React, { useState } from 'react';
import { Bug } from 'lucide-react';
import './styles.css';

interface ImageDebugButtonProps {
  className?: string;
}

const ImageDebugButton: React.FC<ImageDebugButtonProps> = ({ className = '' }) => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [visible, setVisible] = useState(false);

  // Função para verificar o status do backend e testar imagens
  const runImageDiagnostic = async (): Promise<Record<string, any>> => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    
    const result: Record<string, any> = {
      apiBaseUrl,
      baseUrl,
      browserOrigin: window.location.origin,
      tests: {}
    };
    
    try {
      // 1. Verificar o endpoint de debug
      const debugResponse = await fetch(`${apiBaseUrl}/debug/uploads`);
      const debugData = await debugResponse.json();
      result.serverInfo = debugData;
      result.tests.debugEndpoint = {
        success: debugResponse.ok,
        status: debugResponse.status,
        statusText: debugResponse.statusText
      };
    } catch (error) {
      result.tests.debugEndpoint = {
        success: false,
        error: String(error)
      };
    }
    
    try {
      // 2. Tentar carregar uma imagem diretamente
      if (result.serverInfo?.files?.services?.[0]) {
        const imagePath = `uploads/services/${result.serverInfo.files.services[0]}`;
        const imageUrl = `${baseUrl}/${imagePath}`;
        
        // Testar o fetch diretamente
        const imageResponse = await fetch(imageUrl, {
          mode: 'cors',
          headers: {
            'Accept': 'image/*'
          }
        });
        
        result.tests.imageDirectAccess = {
          url: imageUrl,
          success: imageResponse.ok && imageResponse.headers.get('Content-Type')?.includes('image'),
          status: imageResponse.status,
          contentType: imageResponse.headers.get('Content-Type'),
          size: imageResponse.headers.get('Content-Length')
        };
      }
    } catch (error) {
      result.tests.imageDirectAccess = {
        success: false,
        error: String(error)
      };
    }
    
    return result;
  };

  const handleDiagnostic = async () => {
    try {
      setRunning(true);
      setResult(null);
      
      // Obter resultado para exibição na interface
      const diagnosticResult = await runImageDiagnostic();
      setResult(diagnosticResult);
      
      // Mostrar resultado no console
      console.group('🔍 Diagnóstico de Carregamento de Imagens');
      console.log('Configuração da API:', {
        apiBaseUrl: diagnosticResult.apiBaseUrl,
        baseUrl: diagnosticResult.baseUrl,
        browserOrigin: diagnosticResult.browserOrigin
      });
      
      if (diagnosticResult.serverInfo) {
        console.log('Informações do servidor:', diagnosticResult.serverInfo);
        
        if (diagnosticResult.serverInfo.files) {
          console.log('Arquivos no servidor:');
          Object.entries(diagnosticResult.serverInfo.files).forEach(([folder, files]) => {
            console.log(`📁 ${folder}: ${(files as string[]).length} arquivos`);
          });
        }
      }
      
      console.groupEnd();
      
      // Tornar visível caso ainda não seja
      setVisible(true);
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
      setResult({ error: String(error) });
    } finally {
      setRunning(false);
    }
  };

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div className={`image-debug-container ${className}`}>
      <button 
        className="debug-button"
        onClick={toggleVisibility}
        title="Depurar problemas com imagens"
      >
        <Bug size={16} />
        Depurar Imagens
      </button>
      
      {visible && (
        <div className="debug-panel">
          <div className="debug-panel-header">
            <h3>Diagnóstico de Imagens</h3>
            <button 
              className="close-button"
              onClick={toggleVisibility}
            >
              &times;
            </button>
          </div>
          
          <div className="debug-panel-content">
            <button
              className="run-button"
              onClick={handleDiagnostic}
              disabled={running}
            >
              {running ? (
                <>
                  <span className="spinner"></span>
                  Executando...
                </>
              ) : (
                'Executar diagnóstico'
              )}
            </button>
            
            {result && (
              <div className="debug-results">
                <h4>Resultados:</h4>
                {result.error ? (
                  <div className="error-message">{result.error}</div>
                ) : (
                  <>
                    <div className="config-info">
                      <strong>API URL:</strong> {result.apiBaseUrl}<br />
                      <strong>Base URL:</strong> {result.baseUrl}<br />
                      <strong>Browser Origin:</strong> {result.browserOrigin}
                    </div>
                    
                    <div className="test-results">
                      {result.tests.debugEndpoint && (
                        <div className={`test-item ${result.tests.debugEndpoint.success ? 'success' : 'failure'}`}>
                          <span className="test-name">API Debug Endpoint:</span>
                          <span className="test-status">
                            {result.tests.debugEndpoint.success ? '✓' : '✗'}
                          </span>
                        </div>
                      )}
                      
                      {result.tests.imageDirectAccess && (
                        <div className={`test-item ${result.tests.imageDirectAccess.success ? 'success' : 'failure'}`}>
                          <span className="test-name">Acesso direto à imagem:</span>
                          <span className="test-status">
                            {result.tests.imageDirectAccess.success ? '✓' : '✗'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {result.serverInfo?.files && (
                      <div className="server-files">
                        <h4>Arquivos no servidor:</h4>
                        {Object.entries(result.serverInfo.files).map(([folder, files]) => (
                          <div key={folder} className="folder-info">
                            <strong>{folder}:</strong> {(files as string[]).length} arquivos
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            <div className="debug-instructions">
              <p>
                Verifique mais detalhes no console do navegador (F12).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDebugButton;
