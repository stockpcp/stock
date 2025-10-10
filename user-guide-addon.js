/* USER GUIDE ADDON JAVASCRIPT */

/**
 * Função para abrir o guia do usuário
 * Abre o PDF em uma nova aba do navegador
 */
function openUserGuide() {
    try {
        // Abre o UserGuide.pdf em uma nova aba
        window.open('UserGuide.pdf', '_blank');
        
        // Log para analytics (opcional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'user_guide_opened', {
                'event_category': 'engagement',
                'event_label': 'user_guide_pdf'
            });
        }
        
        console.log('User Guide opened successfully');
    } catch (error) {
        console.error('Error opening User Guide:', error);
        // Fallback: tentar abrir em uma nova janela
        try {
            window.open('UserGuide.pdf', '_blank', 'noopener,noreferrer');
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            alert('Unable to open User Guide. Please check if the file exists.');
        }
    }
}

/**
 * Inicialização quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('User Guide addon initializing...');
    
    // Adicionar event listeners para os botões do guia do usuário
    const userGuideBtn = document.getElementById('user-guide-btn');
    const helpDownloadBtn = document.querySelector('.help-download-btn');
    
    if (userGuideBtn) {
        userGuideBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openUserGuide();
        });
        console.log('Header User Guide button initialized');
    } else {
        console.warn('Header User Guide button not found');
    }
    
    if (helpDownloadBtn) {
        helpDownloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openUserGuide();
        });
        console.log('Help section User Guide button initialized');
    } else {
        console.warn('Help section User Guide button not found');
    }
    
    // Adicionar tooltips melhorados
    if (userGuideBtn) {
        userGuideBtn.setAttribute('title', 'Access the comprehensive user guide (PDF)');
        userGuideBtn.setAttribute('aria-label', 'Open user guide in new tab');
    }
    
    if (helpDownloadBtn) {
        helpDownloadBtn.setAttribute('aria-label', 'Download user guide PDF');
    }
    
    console.log('User Guide addon initialized successfully');
});

/**
 * Função para verificar se o PDF existe (opcional)
 * Pode ser usada para mostrar uma mensagem de erro se o arquivo não existir
 */
function checkUserGuideAvailability() {
    fetch('UserGuide.pdf', { method: 'HEAD' })
        .then(response => {
            if (!response.ok) {
                console.warn('User Guide PDF not found (HTTP ' + response.status + ')');
                // Opcional: desabilitar botões ou mostrar mensagem
                const buttons = document.querySelectorAll('.user-guide-btn, .help-download-btn');
                buttons.forEach(btn => {
                    btn.style.opacity = '0.5';
                    btn.title = 'User Guide temporarily unavailable';
                });
            } else {
                console.log('User Guide PDF is available');
            }
        })
        .catch(error => {
            console.warn('Could not check User Guide availability:', error);
        });
}

/**
 * Função para adicionar tracking de eventos (opcional)
 */
function trackUserGuideUsage() {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'user_guide_interaction', {
            'event_category': 'help',
            'event_label': 'pdf_access',
            'value': 1
        });
    }
    
    // Google Analytics Universal
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'Help', 'User Guide', 'PDF Access');
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
            content_type: 'user_guide',
            content_category: 'help'
        });
    }
}

// Verificar disponibilidade do PDF quando a página carregar (opcional)
// Descomente a linha abaixo se quiser verificar se o PDF existe
// document.addEventListener('DOMContentLoaded', checkUserGuideAvailability);

// Adicionar suporte para teclas de atalho (opcional)
document.addEventListener('keydown', function(e) {
    // Ctrl+H ou Cmd+H para abrir o guia
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        openUserGuide();
    }
});

// Exportar função para uso global (se necessário)
window.openUserGuide = openUserGuide;
