/**
 * Configuração opcional para o Stock Date Addon
 * Este arquivo é opcional e permite personalizar o comportamento do addon
 */

// Configuração personalizada (opcional)
window.StockDateAddonConfig = {
    // ID do elemento onde a data será exibida
    dateElementId: 'stock-update-date',
    
    // Seletor CSS da hero-section onde o elemento será injetado
    heroSelector: '.hero-content',
    
    // Formato da data (atualmente suporta apenas DD/MM/YYYY)
    dateFormat: 'DD/MM/YYYY',
    
    // Se deve usar data atual como fallback quando não conseguir obter a data real
    fallbackToCurrentDate: true,
    
    // Número de tentativas para obter a data
    retryAttempts: 3,
    
    // Delay entre tentativas (em milissegundos)
    retryDelay: 1000,
    
    // Textos personalizados (opcional)
    customTexts: {
        en: {
            lastUpdated: 'Last updated:',
            loading: 'Loading...',
            unavailable: 'Date unavailable'
        },
        es: {
            lastUpdated: 'Última actualización:',
            loading: 'Cargando...',
            unavailable: 'Fecha no disponible'
        },
        pt: {
            lastUpdated: 'Última atualização:',
            loading: 'Carregando...',
            unavailable: 'Data indisponível'
        }
    },
    
    // CSS personalizado (opcional)
    customCSS: `
        .hero-date-info {
            /* Adicione seus estilos personalizados aqui */
        }
    `
};

