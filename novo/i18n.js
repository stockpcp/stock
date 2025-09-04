// Sistema de Internacionalização (i18n)
class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'es'];
        
        // Detectar idioma do navegador
        this.detectLanguage();
    }

    // Detectar idioma preferido do usuário
    detectLanguage() {
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
            return;
        }

        const browserLanguage = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLanguage)) {
            this.currentLanguage = browserLanguage;
        }
    }

    // Carregar traduções para um idioma
    async loadTranslations(language) {
        if (this.translations[language]) {
            return this.translations[language];
        }

        try {
            const response = await fetch(`translations/${language}.json`);
            const translations = await response.json();
            this.translations[language] = translations;
            return translations;
        } catch (error) {
            console.error(`Erro ao carregar traduções para ${language}:`, error);
            return null;
        }
    }

    // Obter tradução por chave
    t(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return defaultValue || key;
            }
        }
        
        return value;
    }

    // Trocar idioma
    async changeLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.error(`Idioma ${language} não suportado`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('preferred-language', language);
        
        await this.loadTranslations(language);
        this.updatePageTexts();
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language }
        }));
    }

    // Atualizar todos os textos da página
    updatePageTexts() {
        // Atualizar elementos com data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Atualizar elementos com data-i18n-html (para HTML)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            element.innerHTML = translation;
        });

        // Atualizar título da página
        document.title = this.t('hero.title', 'stock availability');
    }

    // Inicializar sistema i18n
    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.createLanguageSelector();
        this.updatePageTexts();
    }

    // Criar seletor de idioma
    createLanguageSelector() {
        const headerInfo = document.querySelector('.header-info');
        if (!headerInfo) return;

        const languageSelector = document.createElement('div');
        languageSelector.className = 'language-selector';
        languageSelector.innerHTML = `
            <select id="language-select" class="language-select">
                <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>🇺🇸 English</option>
                <option value="es" ${this.currentLanguage === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
            </select>
        `;

        headerInfo.appendChild(languageSelector);

        // Adicionar event listener
        const select = document.getElementById('language-select');
        select.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    // Obter idioma atual
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Verificar se idioma é suportado
    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }
}

// Instância global do sistema i18n
const i18n = new I18n();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    i18n.init();
});

// Exportar para uso global
window.i18n = i18n;

