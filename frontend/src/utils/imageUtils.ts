/**
 * Utilitários para tratamento de imagens no frontend
 */

/**
 * Normaliza uma URL de imagem para garantir que ela seja carregada corretamente
 * independentemente do ambiente (desenvolvimento ou produção)
 * 
 * @param imagePath Caminho da imagem (relativo ou absoluto)
 * @returns URL normalizada da imagem ou undefined se não houver imagem
 */
export const normalizeImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
  // Log para depuração
  console.log(`[ImageUtils] Normalizando URL de imagem: ${imagePath}`);
  
  // Se já for uma URL completa ou um blob/data URI, retornar como está
  if (imagePath.startsWith('http') || 
      imagePath.startsWith('blob:') || 
      imagePath.startsWith('data:')) {
    console.log(`[ImageUtils] URL já completa, retornando sem alterações`);
    return imagePath;
  }
  
  // Garantir que a URL da API está disponível
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Extrair o domínio base da URL da API
  let baseUrl = '';
  try {
    // Remover '/api' do final da URL, se existir
    baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    
    // Se o baseUrl ainda não terminar com '/', adicionar
    if (!baseUrl.endsWith('/')) {
      baseUrl = `${baseUrl}/`;
    }
    
    console.log(`[ImageUtils] URL base da API: ${baseUrl}`);
  } catch (error) {
    console.error("[ImageUtils] Erro ao processar URL base:", error);
    baseUrl = window.location.origin + '/';
  }
  
  // Normalizar o caminho da imagem (remover barras duplicadas)
  let normalizedImagePath = imagePath;
  if (normalizedImagePath.startsWith('/')) {
    normalizedImagePath = normalizedImagePath.slice(1);
  }
  
  // Garantir que não haja barras duplicadas
  const fullUrl = `${baseUrl}${normalizedImagePath}`;
  console.log(`[ImageUtils] Caminho normalizado: "${imagePath}" -> "${fullUrl}"`);
  
  return fullUrl;
};

/**
 * Componente de imagem com estratégias de fallback em caso de erro de carregamento
 * Essa função retorna um objeto com os atributos onError que pode ser aplicado a
 * elementos <img> para implementar uma estratégia de fallback automaticamente
 * 
 * @param originalSrc URL original da imagem
 * @param placeholderSrc URL da imagem de placeholder (opcional)
 * @returns Objeto com handler onError
 * 
 * @example
 * <img 
 *   src={service.image} 
 *   alt={service.name} 
 *   {...createImageFallbackHandler(service.image)}
 * />
 */
export const createImageFallbackHandler = (
  originalSrc: string | undefined, 
  placeholderSrc: string = 'https://placehold.co/600x400/1A1A1A/FFF?text=Imagem+indisponível'
) => {
  if (!originalSrc) {
    return {
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        target.src = placeholderSrc;
        target.onerror = null; // Previne loop infinito
      }
    };
  }
  
  return {
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      console.error("[ImageUtils] Erro ao carregar imagem:", {
        urlOriginal: originalSrc,
        srcAtual: target.src,
        origem: window.location.origin
      });
      
      // Lista de estratégias alternativas
      const strategies: string[] = [];
      
      // Estratégia 1: Usar API URL diretamente
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
      
      if (!originalSrc.startsWith('http') && !originalSrc.startsWith('data:') && !originalSrc.startsWith('blob:')) {
        const relativePath = originalSrc.replace(/^\//, '');
        strategies.push(`${baseUrl}/${relativePath}`);
      }
      
      // Estratégia 2: Usar a origem atual para caminhos absolutos
      if (originalSrc.startsWith('/')) {
        strategies.push(`${window.location.origin}${originalSrc}`);
      }
      
      // Estratégia 3: Tentar URL absolutamente básica
      const pathOnly = originalSrc.replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
      strategies.push(`${window.location.origin}/${pathOnly}`);
      
      // Estratégia 4: Tentar caminho direto para uploads
      if (originalSrc.includes('uploads/')) {
        const uploadsPath = originalSrc.substring(originalSrc.indexOf('uploads/'));
        strategies.push(`${baseUrl}/${uploadsPath}`);
      }
      
      // Tentar próxima estratégia ou mostrar placeholder
      if (strategies.length > 0) {
        const nextUrl = strategies.shift() as string;
        console.log("[ImageUtils] Tentando estratégia alternativa:", nextUrl);
        
        // Adicionar atributo crossOrigin para evitar problemas de CORS
        target.crossOrigin = "anonymous";
        target.referrerPolicy = "no-referrer";
        target.src = nextUrl;
        
        // Configurar nova função onError para as próximas tentativas
        target.onerror = () => {
          if (strategies.length > 0) {
            const nextUrl = strategies.shift() as string;
            console.log("[ImageUtils] Tentando outra estratégia:", nextUrl);
            target.src = nextUrl;
            return;
          }
          
          // Fallback final se todas as estratégias falharem
          console.log("[ImageUtils] Todas as estratégias falharam, usando placeholder");
          target.src = placeholderSrc;
          target.onerror = null; // Previne loop infinito
        };
      } else {
        target.src = placeholderSrc;
        target.onerror = null; // Previne loop infinito
      }
    }
  };
};

/**
 * Componente para usar em elementos <img> que necessitem do atributo crossOrigin 
 * para carregar imagens de outros domínios sem problemas de CORS
 * 
 * @returns Objeto com atributos para o elemento img
 * 
 * @example
 * <img 
 *   src={imageUrl} 
 *   alt="Descrição" 
 *   {...createCrossOriginProps()}
 * />
 */
export const createCrossOriginProps = () => {
  return {
    crossOrigin: "anonymous" as const,
    referrerPolicy: "no-referrer" as const
  };
};
