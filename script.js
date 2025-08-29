// Global variables
let stockData = [];
let filteredData = [];
let currentView = 'grid';
let cart = [];

// DOM elements
const elements = {
    // Filters
    woodTypeFilter: document.getElementById('wood-type-filter'),
    certificateFilter: document.getElementById('certificate-filter'),
    gradeFilter: document.getElementById('grade-filter'),
    thicknessFilter: document.getElementById('thickness-filter'),
    clearFiltersBtn: document.getElementById('clear-filters'),
    
    // Results
    productsCount: document.getElementById('products-count'),
    productsContainer: document.getElementById('products-container'),
    
    // View controls
    gridViewBtn: document.getElementById('grid-view-btn'),
    listViewBtn: document.getElementById('list-view-btn'),
    
    // Modal
    modal: document.getElementById('product-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.getElementById('modal-close'),
    
    // Stats
    totalProducts: document.getElementById('total-products'),
    rawMaterials: document.getElementById('raw-materials'),
    certificates: document.getElementById('certificates'),
    grades: document.getElementById('grades'),
    totalCrates: document.getElementById('total-crates'),
    cartModal: document.getElementById('cart-modal'),
    cartModalClose: document.getElementById('cart-modal-close'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartSendForm: document.getElementById('cart-send-form'),
    cartEmail: document.getElementById('cart-email')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadStockData();
    setupEventListeners();
    setupCartEvents();
    const openCartBtn = document.getElementById('open-cart-btn');
    if (openCartBtn) {
        openCartBtn.onclick = showCartModal;
    }
    // Adicionar evento ao botão de adicionar ao carrinho
    setTimeout(() => {
        const addBtn = document.getElementById('add-to-cart-btn');
        const qtyInput = document.getElementById('cart-qty');
        if (addBtn && qtyInput) {
            addBtn.onclick = () => {
                const qty = Math.max(1, Math.min(1000, parseInt(qtyInput.value)));
                addToCart(product, qty);
                // Exibe mensagem de validação
                showValidationMessage('Item adicionado ao carrinho!');
                setTimeout(() => {
                    closeModal();
                    showCartModal();
                }, 900);
            };
        }

    // Função para exibir mensagem de validação
    function showValidationMessage(msg) {
        let validationDiv = document.getElementById('cart-validation-msg');
        if (!validationDiv) {
            validationDiv = document.createElement('div');
            validationDiv.id = 'cart-validation-msg';
            validationDiv.style.position = 'fixed';
            validationDiv.style.top = '24px';
            validationDiv.style.right = '24px';
            validationDiv.style.background = '#00B04F';
            validationDiv.style.color = 'white';
            validationDiv.style.padding = '1rem 2rem';
            validationDiv.style.borderRadius = '8px';
            validationDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
            validationDiv.style.zIndex = '4000';
            validationDiv.style.fontWeight = '600';
            document.body.appendChild(validationDiv);
        }
        validationDiv.textContent = msg;
        validationDiv.style.display = 'block';
        setTimeout(() => {
            validationDiv.style.display = 'none';
        }, 1200);
    }
    }, 100);
});

// Load stock data
async function loadStockData() {
    try {
        const response = await fetch('stock_data.json');
        stockData = await response.json();
        filteredData = [...stockData];
        
        initializeFilters();
        updateStats();
        renderProducts();
    } catch (error) {
        console.error('Error loading stock data:', error);
    }
}

// Initialize filters with data
function initializeFilters() {
    if (!stockData || stockData.length === 0) return;
    
    // Get unique values for each filter
    const woodTypes = [...new Set(stockData.map(item => item.Logs))].sort();
    const certificates = [...new Set(stockData.map(item => item.Certificate))].sort();
    const grades = [...new Set(stockData.map(item => item.Grade))].sort();
    const thicknesses = [...new Set(stockData.map(item => item.Thickness))].sort((a, b) => a - b);
    
    // Populate filter dropdowns
    populateSelect(elements.woodTypeFilter, woodTypes);
    populateSelect(elements.certificateFilter, certificates);
    populateSelect(elements.gradeFilter, grades, formatGrade);
    populateSelect(elements.thicknessFilter, thicknesses, (value) => `${value}mm`);
}

// Populate select element with options
function populateSelect(selectElement, values, formatter = null) {
    // Keep the default option
    const defaultOption = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = '';
    selectElement.appendChild(defaultOption);
    
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = formatter ? formatter(value) : value;
        selectElement.appendChild(option);
    });
}

// Format grade display
function formatGrade(grade) {
    const upperGrade = grade.toUpperCase();
    if (['BCX', 'CCX', 'CDX'].includes(upperGrade)) {
        return upperGrade;
    }
    return grade;
}

// Setup event listeners
function setupEventListeners() {
    // Filter change events
    [elements.woodTypeFilter, elements.certificateFilter, elements.gradeFilter, elements.thicknessFilter]
        .forEach(filter => {
            filter.addEventListener('change', applyFilters);
        });
    
    // Clear filters
    elements.clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    // View controls
    elements.gridViewBtn.addEventListener('click', () => setView('grid'));
    elements.listViewBtn.addEventListener('click', () => setView('list'));
    
    // Modal events
    elements.modalClose.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Apply filters
function applyFilters() {
    const filters = {
        woodType: elements.woodTypeFilter.value,
        certificate: elements.certificateFilter.value,
        grade: elements.gradeFilter.value,
        thickness: elements.thicknessFilter.value
    };
    
    filteredData = stockData.filter(product => {
        return (!filters.woodType || product.Logs === filters.woodType) &&
               (!filters.certificate || product.Certificate === filters.certificate) &&
               (!filters.grade || product.Grade === filters.grade) &&
               (!filters.thickness || product.Thickness.toString() === filters.thickness);
    });
    
    updateStats();
    renderProducts();
}

// Clear all filters
function clearAllFilters() {
    elements.woodTypeFilter.value = '';
    elements.certificateFilter.value = '';
    elements.gradeFilter.value = '';
    elements.thicknessFilter.value = '';
    
    filteredData = [...stockData];
    updateStats();
    renderProducts();
}

// Set view mode
function setView(viewMode) {
    currentView = viewMode;
    
    // Update button states
    elements.gridViewBtn.classList.toggle('active', viewMode === 'grid');
    elements.listViewBtn.classList.toggle('active', viewMode === 'list');
    
    renderProducts();
}

// Update statistics
function updateStats() {
    const uniqueWoodTypes = new Set(filteredData.map(item => item.Logs)).size;
    const uniqueCertificates = new Set(filteredData.map(item => item.Certificate)).size;
    const uniqueGrades = new Set(filteredData.map(item => item.Grade)).size;
    const totalCrates = filteredData.reduce((sum, item) => sum + item.Crates, 0);
    
    elements.totalProducts.textContent = filteredData.length;
    elements.rawMaterials.textContent = uniqueWoodTypes;
    elements.certificates.textContent = uniqueCertificates;
    elements.grades.textContent = uniqueGrades;
    elements.totalCrates.textContent = formatNumber(totalCrates);
    elements.productsCount.textContent = filteredData.length;
}

// Render products
function renderProducts() {
    const container = elements.productsContainer;
    
    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
        return;
    }
    
    // Set container class based on view
    container.className = currentView === 'grid' ? 'products-grid' : 'products-list';
    
    container.innerHTML = filteredData.map(product => createProductCard(product)).join('');
    
    // Add event listeners to details buttons only
    container.querySelectorAll('.details-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => showProductDetails(filteredData[index]));
    });
}

// Create product card HTML
function createProductCard(product) {
    const isListView = currentView === 'list';
    
    if (isListView) {
        return `
            <div class="product-card">
                <div class="product-info">
                    <div class="product-badges">
                        <span class="badge badge-material">${product.Logs}</span>
                        <span class="badge badge-certificate">${product.Certificate}</span>
                        <span class="badge badge-grade">${formatGrade(product.Grade)}</span>
                    </div>
                    <div class="product-details">
                        <div class="product-title">${product.Size}</div>
                        <div class="product-specs">${product.Crates} crates available • ${product.Thickness}mm • ${product.Ply} layers</div>
                    </div>
                </div>
                <div class="product-price">$${formatCurrency(product.Price)} per m³</div>
                <div class="product-actions">
                    <button class="details-btn">View Details</button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="product-card">
                <div class="product-badges">
                    <span class="badge badge-material">${product.Logs}</span>
                    <span class="badge badge-certificate">${product.Certificate}</span>
                    <span class="badge badge-grade">${formatGrade(product.Grade)}</span>
                </div>
                <div class="product-details">
                    <div class="product-title">${product.Size}</div>
                    <div class="product-specs">${product.Thickness}mm • ${product.Ply} layers</div>
                    <div class="product-specs">${product.Crates} crates available</div>
                </div>
                <div class="product-price">$${formatCurrency(product.Price)} per m³</div>
                <div class="product-actions">
                    <button class="details-btn">View Details</button>
                </div>
            </div>
        `;
    }
}

// Show product details modal
function showProductDetails(product) {
    if (!elements.modal) return;
    
    elements.modalTitle.textContent = `${product.Logs} ${formatGrade(product.Grade)} - ${product.Size}`;
    
    // Calculate values
    const densityPerM3 = product.WeightPerCrate / product.VolumePerCrate;
    const weightPerSheet = product.WeightPerCrate / product.SheetsPerCrate;
    const pricePerSheet = (product.Price * product.VolumePerCrate) / product.SheetsPerCrate;
    const pricePerCrate = product.Price * product.VolumePerCrate;
    const practicalCapacity = product.PayloadLimit / product.WeightPerCrate;
    const maxCratesPerContainer = Math.floor(practicalCapacity);
    const containerValue = maxCratesPerContainer * pricePerCrate;
    
    elements.modalBody.innerHTML = `
        <div class="modal-sections">
            <div class="modal-section">
                <h4>📋 Product Specifications</h4>
                <div class="section-grid">
                    <div class="detail-item">
                        <div class="detail-label">raw material</div>
                        <div class="detail-value">${product.Logs}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">certificate</div>
                        <div class="detail-value">${product.Certificate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">grade</div>
                        <div class="detail-value">${formatGrade(product.Grade)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">dimensions</div>
                        <div class="detail-value">${product.Size}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">thickness</div>
                        <div class="detail-value">${product.Thickness}mm</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">plies</div>
                        <div class="detail-value">${product.Ply}</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>📦 Stock & Weight Information</h4>
                <div class="section-grid">
                    <div class="detail-item">
                        <div class="detail-label">Available Stock</div>
                        <div class="detail-value">${product.Crates} crates</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Sheets per Crate</div>
                        <div class="detail-value">${product.SheetsPerCrate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Weight per Crate</div>
                        <div class="detail-value">${formatNumber(product.WeightPerCrate)} kg</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Density per m³</div>
                        <div class="detail-value">${formatNumber(densityPerM3)} kg/m³</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Weight per Sheet</div>
                        <div class="detail-value">${formatNumber(weightPerSheet)} kg</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Volume per Crate</div>
                        <div class="detail-value">${product.VolumePerCrate.toFixed(3)} m³</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>🚢 Shipping & Pricing</h4>
                <div class="section-grid">
                    <div class="detail-item">
                        <div class="detail-label">Practical Capacity</div>
                        <div class="detail-value">${formatNumber(practicalCapacity)} crates</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Max Crates/Container</div>
                        <div class="detail-value">${maxCratesPerContainer}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">FOB Price per m³</div>
                        <div class="detail-value">$${formatCurrency(product.Price)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Price per Sheet</div>
                        <div 
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)