// Sistema de tradução para textos dinâmicos
const LANGUAGES = {
    en: {
    cartBtn: "List",
    heroTitle: "Stock Management",
    heroSubtitle: "Complete management system for Brazilian plywood stock",
    statsProducts: "Products",
    statsRawMaterials: "Raw Materials",
    statsCertificates: "Certificates",
    statsGrades: "Grades",
    statsTotalCrates: "Total Crates",
    filtersTitle: "Filters",
    clearFilters: "Clear Filters",
    resultsFound: "products found",
    grid: "Grid",
    list: "List",
    modalTitle: "Product Details",
    cartModalTitle: "Shopping List",
    footerProductInfo: "Product Information",
    footerProductDesc1: "Brazilian plywood for construction, packaging, and furniture industries",
    footerProductDesc2: "Quality wood products with international certifications",
    footerProductDesc3: "Sustainable forestry practices and environmental compliance",
    footerContactInfo: "Contact Information",
    footerCompanyName: "Repinho",
    footerPhone: "+55 (42) 3629-8500",
    footerEmail: "comercial01@repinho.ind.br",
    footerAddress: "Rua Ver.Sebastião de Camargo Ribas nº 950<br>Guarapuava, Paraná - Brazil",
    footerCopyright: "© 2025 Repinho. All rights reserved.",
    footerDev: "developed by commercial export",
        noProducts: "No products found with the selected criteria.",
        viewDetails: "View Details",
    addToCart: "Add to List",
        maxAvailable: "Maximum available: {qty} crates",
    cartEmptyTitle: "Your list is empty",
        cartEmptySubtitle: "Add products to start your quote",
        cartRemove: "Remove",
        cartTotal: "Total:",
        cartCratesTotal: "{qty} crates in total",
        cartSendTitle: "Send purchase intent",
        cartEmail: "Your email:",
        cartSummary: "Items summary:",
        cartSendBtn: "Send purchase intent",
        cartSendInfo: "You will receive confirmation by email.",
    cartAdded: "Item added to list!",
        cartQuoteRequest: "Quote Request",
        cartSelectedItems: "Selected items:",
        cartUnitPrice: "Unit price:",
        cartSubtotal: "Subtotal:",
        cartTotalCrates: "Total crates:",
        cartEstimatedTotal: "Estimated total value:",
        cartNote: "Note: This is a quote request. Prices may vary according to market conditions and final quantity.",
        cartFormAlert: "To send your purchase intent, click the green 'Quote Request' button on the screen and fill out the form."
    },
    es: {
    cartBtn: "Lista",
    heroTitle: "Gestión de Stock",
    heroSubtitle: "Sistema completo de gestión para stock de madera contrachapada brasileña",
    statsProducts: "Productos",
    statsRawMaterials: "Materias primas",
    statsCertificates: "Certificados",
    statsGrades: "Calidades",
    statsTotalCrates: "Total de cajas",
    filtersTitle: "Filtros",
    clearFilters: "Limpiar filtros",
    resultsFound: "productos encontrados",
    grid: "Cuadrícula",
    list: "Lista",
    modalTitle: "Detalles del producto",
    cartModalTitle: "Lista de compras",
    footerProductInfo: "Información del producto",
    footerProductDesc1: "Madera contrachapada brasileña para construcción, embalaje y muebles",
    footerProductDesc2: "Productos de madera de calidad con certificaciones internacionales",
    footerProductDesc3: "Prácticas forestales sostenibles y cumplimiento ambiental",
    footerContactInfo: "Información de contacto",
    footerCompanyName: "Repinho",
    footerPhone: "+55 (42) 3629-8500",
    footerEmail: "comercial01@repinho.ind.br",
    footerAddress: "Rua Ver.Sebastião de Camargo Ribas nº 950<br>Guarapuava, Paraná - Brasil",
    footerCopyright: "© 2025 Repinho. Todos los derechos reservados.",
    footerDev: "desarrollado por comercial export",
        noProducts: "No se encontraron productos con los criterios seleccionados.",
        viewDetails: "Ver detalles",
    addToCart: "Agregar a la lista",
        maxAvailable: "Máximo disponible: {qty} cajas",
    cartEmptyTitle: "Tu lista está vacía",
        cartEmptySubtitle: "Agrega productos para iniciar tu cotización",
        cartRemove: "Eliminar",
        cartTotal: "Total:",
        cartCratesTotal: "{qty} cajas en total",
        cartSendTitle: "Enviar intención de compra",
        cartEmail: "Tu correo electrónico:",
        cartSummary: "Resumen de artículos:",
        cartSendBtn: "Enviar intención de compra",
        cartSendInfo: "Recibirás confirmación por correo electrónico.",
    cartAdded: "¡Artículo agregado a la lista!",
        cartQuoteRequest: "Solicitud de cotización",
        cartSelectedItems: "Artículos seleccionados:",
        cartUnitPrice: "Precio unitario:",
        cartSubtotal: "Subtotal:",
        cartTotalCrates: "Total de cajas:",
        cartEstimatedTotal: "Valor total estimado:",
        cartNote: "Nota: Esto es una solicitud de cotización. Los precios pueden variar según las condiciones del mercado y la cantidad final.",
        cartFormAlert: "Para enviar tu intención de compra, haz clic en el botón verde 'Solicitud de cotización' y completa el formulario."
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
const langSelect = document.getElementById('lang-select');
if (langSelect) {
    langSelect.addEventListener('change', (e) => {
        setLang(e.target.value);
        if (window.updateStaticTexts) window.updateStaticTexts();
        if (window.updateDynamicTexts) window.updateDynamicTexts();
    });
}

// Atualiza textos estáticos do HTML
window.updateStaticTexts = function() {
    // Header
    const companyName = document.querySelector('.company-name');
    if (companyName) companyName.textContent = t('headerCompany');
    const infoText = document.querySelector('.info-text');
    // Cart button
    const cartBtnText = document.getElementById('cart-btn-text');
    if (cartBtnText) cartBtnText.textContent = t('cartBtn');
    // Hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.textContent = t('heroTitle');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = t('heroSubtitle');
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
    const footerProductInfo = document.querySelector('.footer-column h4');
    if (footerProductInfo) footerProductInfo.textContent = t('footerProductInfo');
    const footerProductDesc = document.querySelectorAll('.footer-column p');
    if (footerProductDesc.length >= 3) {
        footerProductDesc[0].textContent = t('footerProductDesc1');
        footerProductDesc[1].textContent = t('footerProductDesc2');
        footerProductDesc[2].textContent = t('footerProductDesc3');
    }
    const footerContactInfo = document.querySelectorAll('.footer-column h4')[1];
    if (footerContactInfo) footerContactInfo.textContent = t('footerContactInfo');
    const footerCompanyName = document.querySelector('.company-name');
    if (footerCompanyName) footerCompanyName.textContent = t('footerCompanyName');
    const footerPhone = document.querySelector('.contact-item .contact-icon + span');
    if (footerPhone) footerPhone.textContent = t('footerPhone');
    const footerEmail = document.querySelectorAll('.contact-item span')[3];
    if (footerEmail) footerEmail.textContent = t('footerEmail');
    const footerAddress = document.querySelectorAll('.contact-item span')[4];
    if (footerAddress) footerAddress.innerHTML = t('footerAddress');
    const footerCopyright = document.querySelector('.footer-bottom p');
    if (footerCopyright) footerCopyright.textContent = t('footerCopyright');
    const footerDev = document.querySelectorAll('.footer-bottom p')[1];
    if (footerDev) footerDev.textContent = t('footerDev');
}
