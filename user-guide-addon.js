/* USER GUIDE ADDON JAVASCRIPT */

/**
 * Função para abrir o guia do usuário
 * Abre o PDF em uma nova aba do navegador
 */
function openUserGuide() {
    // Abre o UserGuide.pdf em uma nova aba
    window.open('UserGuide.pdf', '_blank');
    
    // Log para analytics (opcional)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'user_guide_opened', {
            'event_category': 'engagement',
            'event_label': 'user_guide_pdf'
        });
    }
    
    console.log('User Guide opened');
}

/**
 * Inicialização quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar event listeners para os botões do guia do usuário
    const userGuideBtn = document.getElementById('user-guide-btn');
    const helpDownloadBtn = document.querySelector('.help-download-btn');
    
    if (userGuideBtn) {
        userGuideBtn.addEventListener('click', openUserGuide);
    }
    
    if (helpDownloadBtn) {
        helpDownloadBtn.addEventListener('click', openUserGuide);
    }
    
    // Adicionar tooltips (opcional)
    if (userGuideBtn) {
        userGuideBtn.setAttribute('title', 'Access the comprehensive user guide (PDF)');
    }
    
    console.log('User Guide addon initialized');
});

/**
 * Função para verificar se o PDF existe (opcional)
 * Pode ser usada para mostrar uma mensagem de erro se o arquivo não existir
 */
function checkUserGuideAvailability() {
    fetch('UserGuide.pdf', { method: 'HEAD' })
        .then(response => {
            if (!response.ok) {
                console.warn('User Guide PDF not found');
                // Opcional: mostrar mensagem de erro ou desabilitar botões
            }
        })
        .catch(error => {
            console.warn('Could not check User Guide availability:', error);
        });
}

// Verificar disponibilidade do PDF quando a página carregar (opcional)
// checkUserGuideAvailability();
