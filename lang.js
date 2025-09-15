// Sistema de tradução para textos dinâmicos
const LANGUAGES = {
    en: {
    cartBtn: "List",
    heroTitle: "Stock Available",
    statsProducts: "Products",
    statsRawMaterials: "Wood species",
    statsCertificates: "Certificates",
    statsGrades: "Grades",
    statsTotalCrates: "Crates",
    filtersTitle: "Filters",
    clearFilters: "clear filters",
    // NOVOS: Labels dos filtros
    filterWoodSpecies: "wood species",
    filterCertificate: "certificate",
    filterGrade: "grade",
    filterThickness: "thickness",
    resultsFound: "products found",
    grid: "Grid",
    list: "List",
    modalTitle: "product details",
    cartModalTitle: "interest list",
    // footerProductInfo removido
    footerProductDesc1: "Brazilian plywood for construction, packaging, and furniture industries",
    footerProductDesc2: "Quality wood products with international certifications",
    footerProductDesc3: "Sustainable forestry practices and environmental compliance",
    // footerContactInfo removido
    footerCompanyName: "Repinho Reflorestadora Madeiras & Compensados",
    footerPhone: "+55 (42) 3629-8500",
    footerEmail: "comercial01@repinho.ind.br",
    footerAddress: "Rua Ver.Sebastião de Camargo Ribas nº 950<br>Guarapuava, Paraná - Brazil",
    footerCopyright: "©2025 Repinho - all rights reserved.",
    footerDev: "developed by commercial export",
        noProducts: "no products found with the selected criteria.",
        viewDetails: "view details",
    addToCart: "add to list",
        maxAvailable: "maximum available: {qty} crates",
    cartEmptyTitle: "your list is empty",
        cartEmptySubtitle: "add products to start your quote",
        cartRemove: "remove",
        cartTotal: "total:",
        cartCratesTotal: "{qty} crates in total",
        cartSendTitle: "contact",
        cartEmail: "your email:",
        cartSummary: "items summary:",
        cartSendBtn: "send list intent",
        cartSendInfo: "you will receive confirmation by email.",
    cartAdded: "item added to list!",
        cartQuoteRequest: "list request",
        cartSelectedItems: "selected items:",
        cartUnitPrice: "unit price/m³:",
        cartSubtotal: "subtotal:",
        cartTotalCrates: "total crates:",
        cartEstimatedTotal: "estimated total value:",
        cartNote: "Note: prices and weights may vary depending on market conditions and availability.",
        cartFormAlert: "to send your interest list, click the green 'list request' button on the screen and fill out the form."
    },
    es: {
    cartBtn: "Listado",
    heroTitle: "Stock Disponible",
    statsProducts: "Productos",
    statsRawMaterials: "Especies Madera",
    statsCertificates: "Certificados",
    statsGrades: "Calidades",
    statsTotalCrates: "Cajas",
    filtersTitle: "Filtros",
    clearFilters: "limpiar filtros",
    // NOVOS: Labels dos filtros em espanhol
    filterWoodSpecies: "especies madera",
    filterCertificate: "certificado",
    filterGrade: "calidad",
    filterThickness: "espesor",
    resultsFound: "productos encontrados",
    grid: "cuadrícula",
    list: "listado",
    modalTitle: "detalles del producto",
    cartModalTitle: "lista de intereses",
    // footerProductInfo removido
    footerProductDesc1: "Madera contrachapada brasileña para construcción, embalaje y muebles",
    footerProductDesc2: "Productos de madera de calidad con certificaciones internacionales",
    footerProductDesc3: "Prácticas forestales sostenibles y cumplimiento ambiental",
    // footerContactInfo removido
    footerCompanyName: "Repinho Reflorestadora Madeiras & Compensados",
    footerPhone: "+55 (42) 3629-8500",
    footerEmail: "comercial01@repinho.ind.br",
    footerAddress: "Rua Ver.Sebastião de Camargo Ribas nº 950<br>Guarapuava, Paraná - Brasil",
    footerCopyright: "©2025 Repinho. Todos los derechos reservados.",
    footerDev: "desarrollado por comercial export",
        noProducts: "no se encontraron productos con los criterios seleccionados.",
        viewDetails: "ver detalles",
    addToCart: "agregar a la lista",
        maxAvailable: "máximo disponible: {qty} cajas",
    cartEmptyTitle: "tu lista está vacía",
        cartEmptySubtitle: "agrega productos de interés",
        cartRemove: "eliminar",
        cartTotal: "total:",
        cartCratesTotal: "{qty} cajas en total",
        cartSendTitle: "contacto",
        cartEmail: "tu correo electrónico:",
        cartSummary: "resumen de artículos:",
        cartSendBtn: "enviar listado",
        cartSendInfo: "recibirás confirmación por correo electrónico.",
    cartAdded: "¡artículo agregado a la lista!",
        cartQuoteRequest: "listado de interés",
        cartSelectedItems: "artículos seleccionados:",
        cartUnitPrice: "precio unitario/m³:",
        cartSubtotal: "subtotal:",
        cartTotalCrates: "total de cajas:",
        cartEstimatedTotal: "valor estimado:",
        cartNote: "Nota: los precios y pesos pueden variar según las condiciones del mercado y disponibilidad.",
        cartFormAlert: "para enviar tu intención de compra, haz clic en el botón verde 'solicitud de cotización' y completa el formulario."
    }
};

let currentLang = 'en';

function setLang(lang) {
    currentLang = LANGUAGES[lang] ? lang : 'en';
}

function t(key, params = {}) {
    let text = LANGUAGES[currentLang][key] || LANGUAGES['en'][key] || key;
    Object.keys(params).forEach(k => {
        text = text.replace(`{${k}}`, params[k]);
    });
    return text;
}

// Detect troca de idioma

// Troca de idioma por clique nas bandeiras
document.querySelectorAll('.lang-flag').forEach(btn => {
    btn.addEventListener('click', function() {
        setLang(this.getAttribute('data-lang'));
        if (window.updateStaticTexts) window.updateStaticTexts();
        if (window.updateDynamicTexts) window.updateDynamicTexts();
    });
});

// Atualiza textos estáticos do HTML
window.updateStaticTexts = function() {
    // Header
    const infoText = document.querySelector('.info-text');
    // Cart button
    const cartBtnText = document.getElementById('cart-btn-text');
    if (cartBtnText) cartBtnText.textContent = t('cartBtn');
    // Hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = t('heroTitle');
    // Stats
    const statsLabels = document.querySelectorAll('.stat-label');
    if (statsLabels.length === 5) {
        statsLabels[0].textContent = t('statsProducts');
        statsLabels[1].textContent = t('statsRawMaterials');
        statsLabels[2].textContent = t('statsCertificates');
        statsLabels[3].textContent = t('statsGrades');
        statsLabels[4].textContent = t('statsTotalCrates');
    }
    // Filters
    const filtersTitle = document.querySelector('.filters-title');
    if (filtersTitle) filtersTitle.textContent = t('filtersTitle');
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) clearFiltersBtn.textContent = t('clearFilters');
    
    // NOVO: Labels dos filtros
    const woodSpeciesLabel = document.querySelector('label[for="wood-type-filter"]');
    if (woodSpeciesLabel) woodSpeciesLabel.textContent = t('filterWoodSpecies');
    
    const certificateLabel = document.querySelector('label[for="certificate-filter"]');
    if (certificateLabel) certificateLabel.textContent = t('filterCertificate');
    
    const gradeLabel = document.querySelector('label[for="grade-filter"]');
    if (gradeLabel) gradeLabel.textContent = t('filterGrade');
    
    const thicknessLabel = document.querySelector('label[for="thickness-filter"]');
    if (thicknessLabel) thicknessLabel.textContent = t('filterThickness');
    
    // Results
    const productsCount = document.getElementById('products-count');
    if (productsCount) {
        const resultsText = document.querySelector('.results-count');
        if (resultsText) {
            resultsText.childNodes[2].textContent = ' ' + t('resultsFound');
        }
    }
    // View controls
    const gridBtn = document.getElementById('grid-view-btn');
    if (gridBtn) gridBtn.textContent = t('grid');
    const listBtn = document.getElementById('list-view-btn');
    if (listBtn) listBtn.textContent = t('list');
    // Modal titles
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = t('modalTitle');
    const cartModalTitle = document.querySelector('.cart-modal-title');
    if (cartModalTitle) cartModalTitle.textContent = t('cartModalTitle');
    // Footer
    // Atualiza coluna de informações do produto
    // Removido: não atualiza mais o título do produto no footer
    const footerProductDesc = document.querySelectorAll('.footer-column')[0]?.querySelectorAll('p');
    if (footerProductDesc && footerProductDesc.length >= 3) {
        footerProductDesc[0].textContent = t('footerProductDesc1');
        footerProductDesc[1].textContent = t('footerProductDesc2');
        footerProductDesc[2].textContent = t('footerProductDesc3');
    }
    // Atualiza coluna de contato sem sobrescrever estrutura da contact-info
    // Removido: não atualiza mais o título de contato no footer
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo) {
        const companyName = contactInfo.querySelector('.company-name');
        if (companyName) companyName.textContent = t('footerCompanyName');
        const contactItems = contactInfo.querySelectorAll('.contact-item');
        if (contactItems.length >= 3) {
            // Telefone
            const phoneSpan = contactItems[0].querySelectorAll('span')[1];
            if (phoneSpan) phoneSpan.textContent = t('footerPhone');
            // Email
            const emailSpan = contactItems[1].querySelectorAll('span')[1];
            if (emailSpan) emailSpan.textContent = t('footerEmail');
            // Endereço
            const addressSpan = contactItems[2].querySelectorAll('span')[1];
            if (addressSpan) addressSpan.innerHTML = t('footerAddress');
        }
    }
    const footerCopyright = document.querySelector('.footer-bottom p');
    if (footerCopyright) footerCopyright.textContent = t('footerCopyright');
    const footerDev = document.querySelectorAll('.footer-bottom p')[1];
    if (footerDev) footerDev.textContent = t('footerDev');
}

