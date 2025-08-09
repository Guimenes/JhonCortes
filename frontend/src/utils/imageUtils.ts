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
  
  // Definir estratégias de URL base
  const baseUrlStrategies: string[] = [];
  
  try {
    // Estratégia 1: Usar a origem atual do navegador (para produção)
    baseUrlStrategies.push(window.location.origin);
    
    // Estratégia 2: Se estamos em desenvolvimento com Vite, usar a URL da API configurada
    if (import.meta.env.VITE_API_URL) {
      const apiUrl = new URL(import.meta.env.VITE_API_URL);
      const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`;
      if (!baseUrlStrategies.includes(baseUrl)) {
        baseUrlStrategies.push(baseUrl);
      }
    }
    
    console.log(`[ImageUtils] Estratégias de URL base: ${baseUrlStrategies.join(', ')}`);
  } catch (error) {
    console.error("[ImageUtils] Erro ao determinar URLs base:", error);
    // Fallback para método simples
    baseUrlStrategies.push(window.location.origin);
    
    if (import.meta.env.VITE_API_URL) {
      try {
        baseUrlStrategies.push(import.meta.env.VITE_API_URL.replace('/api', ''));
      } catch (e) {
        console.error("[ImageUtils] Erro no fallback:", e);
      }
    }
  }
  
  // Normalizar o caminho da imagem (remover barras duplicadas)
  let normalizedImagePath = imagePath;
  if (normalizedImagePath.startsWith('/')) {
    normalizedImagePath = normalizedImagePath.slice(1);
  }
  
  // Usar a primeira estratégia (mais provável de funcionar)
  const baseUrl = baseUrlStrategies[0];
  const fullUrl = `${baseUrl}/${normalizedImagePath}`;
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
      
      // Estratégia 1: Usar a origem atual para caminhos relativos
      if (!originalSrc.startsWith('http') && 
          !originalSrc.startsWith('data:') && 
          !originalSrc.startsWith('blob:')) {
        const relativePath = originalSrc.replace(/^\//, '');
        strategies.push(`${window.location.origin}/${relativePath}`);
      }
      
      // Estratégia 2: Usar a URL da API diretamente (sem /api)
      if (import.meta.env.VITE_API_URL && 
          !originalSrc.startsWith('data:') && 
          !originalSrc.startsWith('blob:')) {
        try {
          const apiUrl = new URL(import.meta.env.VITE_API_URL);
          const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`;
          const imagePath = originalSrc.replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
          strategies.push(`${baseUrl}/${imagePath}`);
        } catch (err) {
          console.error("[ImageUtils] Erro ao construir URL da API:", err);
        }
      }
      
      // Estratégia 3: Tentar caminho absoluto sem domínio
      if (originalSrc.startsWith('/')) {
        strategies.push(`${window.location.origin}${originalSrc}`);
      }
      
      // Tentar próxima estratégia ou mostrar placeholder
      if (strategies.length > 0) {
        const nextUrl = strategies.shift() as string;
        console.log("[ImageUtils] Tentando estratégia alternativa:", nextUrl);
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
