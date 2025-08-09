/**
 * Utilitário para debug de imagens e seus problemas de carregamento
 */

/**
 * Função para verificar a configuração atual do backend e testar a acessibilidade das imagens
 * 
 * @returns Promise com o resultado do diagnóstico
 */
export const runImageDiagnostic = async (): Promise<Record<string, any>> => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  
  // Resultado do diagnóstico
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
  
  // 3. Testar diferentes estratégias de URL
  const strategies = [
    { name: 'absolute', url: `${baseUrl}/uploads/services/test.jpg` },
    { name: 'apiRelative', url: `${apiBaseUrl}/uploads/services/test.jpg` },
    { name: 'browserOrigin', url: `${window.location.origin}/uploads/services/test.jpg` }
  ];
  
  result.tests.corsStrategies = {};
  
  for (const strategy of strategies) {
    try {
      const response = await fetch(strategy.url, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      result.tests.corsStrategies[strategy.name] = {
        url: strategy.url,
        // Com no-cors não podemos verificar o status
        attempted: true
      };
    } catch (error) {
      result.tests.corsStrategies[strategy.name] = {
        url: strategy.url,
        error: String(error)
      };
    }
  }
  
  return result;
};

/**
 * Exibe as informações de diagnóstico no console
 */
export const logImageDiagnostic = async (): Promise<void> => {
  try {
    console.group('🔍 Diagnóstico de Carregamento de Imagens');
    
    const result = await runImageDiagnostic();
    console.log('Configuração da API:', {
      apiBaseUrl: result.apiBaseUrl,
      baseUrl: result.baseUrl,
      browserOrigin: result.browserOrigin
    });
    
    if (result.tests.debugEndpoint.success) {
      console.log('✅ Endpoint de debug acessível');
      console.log('Informações do servidor:', result.serverInfo);
      
      if (result.serverInfo.files) {
        console.log('Arquivos no servidor:');
        Object.entries(result.serverInfo.files).forEach(([folder, files]) => {
          console.log(`📁 ${folder}: ${(files as string[]).length} arquivos`);
        });
      }
    } else {
      console.error('❌ Endpoint de debug inacessível:', result.tests.debugEndpoint);
    }
    
    if (result.tests.imageDirectAccess) {
      if (result.tests.imageDirectAccess.success) {
        console.log(`✅ Imagem acessível diretamente: ${result.tests.imageDirectAccess.url}`);
        console.log('Detalhes:', {
          contentType: result.tests.imageDirectAccess.contentType,
          size: result.tests.imageDirectAccess.size
        });
      } else {
        console.error('❌ Falha ao acessar imagem diretamente:', result.tests.imageDirectAccess);
      }
    }
    
    console.log('Estratégias CORS testadas:');
    Object.entries(result.tests.corsStrategies).forEach(([name, info]) => {
      const status = (info as any).attempted ? '⚠️ Tentado (no-cors)' : '❌ Falhou';
      console.log(`${status} ${name}: ${(info as any).url}`);
      if ((info as any).error) {
        console.log(`   Erro: ${(info as any).error}`);
      }
    });
    
  } catch (error) {
    console.error('Erro ao executar diagnóstico:', error);
  } finally {
    console.groupEnd();
  }
};
