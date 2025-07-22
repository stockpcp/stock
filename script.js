// Global variables
let stockData = [];
let infoData = {};
let filteredProducts = [];
let currentView = 'grid';

// DOM Elements
const elements = {
    // Filters
    logsFilter: document.getElementById('logs-filter'),
    certificateFilter: document.getElementById('certificate-filter'),
    gradeFilter: document.getElementById('grade-filter'),
    sizeFilter: document.getElementById('size-filter'),
    thicknessFilter: document.getElementById('thickness-filter'),
    plyFilter: document.getElementById('ply-filter'),
    priceMin: document.getElementById('price-min'),
    priceMax: document.getElementById('price-max'),
    cratesMin: document.getElementById('crates-min'),
    clearFilters: document.getElementById('clear-filters'),
    toggleAdvanced: document.getElementById('toggle-advanced'),
    advancedFilters: document.getElementById('advanced-filters'),
    
    // Results
    productsGrid: document.getElementById('products-grid'),
    resultsCount: document.getElementById('results-count'),
    loading: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state'),
    
    // View controls
    viewGrid: document.getElementById('view-grid'),
    viewList: document.getElementById('view-list'),
    
    // Summary
    totalProducts: document.getElementById('total-products'),
    totalCrates: document.getElementById('total-crates'),
    priceRange: document.getElementById('price-range'),
    lastUpdate: document.getElementById('last-update'),
    
    // New summary cards
    materialCount: document.getElementById('material-count'),
    certificateCount: document.getElementById('certificate-count'),
    gradeCount: document.getElementById('grade-count'),
    
    // Modal
    modal: document.getElementById('product-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.getElementById('modal-close'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalContact: document.getElementById('modal-contact'),
    
    // Contact
    contactBtn: document.getElementById('contact-btn')
};

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    initializeFilters();
    setupEventListeners();
    updateSummary();
    updateLastUpdate();
    filterProducts();
});

// Load data from JSON files
async function loadData() {
    try {
        // Load stock data
        const stockResponse = await fetch('stock_data.json');
        if (!stockResponse.ok) {
            throw new Error('Failed to load stock data');
        }
        stockData = await stockResponse.json();
        
        // Load info data
        const infoResponse = await fetch('info_data.json');
        if (!infoResponse.ok) {
            throw new Error('Failed to load info data');
        }
        infoData = await infoResponse.json();
        
        console.log('Data loaded successfully:', {
            products: stockData.length,
            infoCategories: Object.keys(infoData).length
        });
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Error loading product data. Please refresh the page.');
    }
}

// Show error message
function showError(message) {
    elements.loading.style.display = 'none';
    elements.emptyState.style.display = 'block';
    elements.emptyState.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Initialize filter options
function initializeFilters() {
    populateFilterOptions('Logs', elements.logsFilter, 'All Materials');
    populateFilterOptions('Certificate', elements.certificateFilter, 'All Certificates');
    populateFilterOptions('Grade', elements.gradeFilter, 'All Grades');
    populateFilterOptions('Size', elements.sizeFilter, 'All Sizes');
    populateFilterOptions('Thickness', elements.thicknessFilter, 'All Thickness');
    populateFilterOptions('Ply', elements.plyFilter, 'All Plies');
}

// Populate filter dropdown options with cascading logic
function populateFilterOptions(field, selectElement, defaultText, availableData = null) {
    // Use provided data or all stock data
    const dataToUse = availableData || stockData;
    
    // Get unique values and sort appropriately
    let values = [...new Set(dataToUse.map(item => item[field]))];
    
    // Sort numerically for thickness and plies, alphabetically for others
    if (field === 'Thickness' || field === 'Ply') {
        values.sort((a, b) => Number(a) - Number(b));
    } else {
        values.sort();
    }
    
    // Clear and repopulate
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = formatFilterOption(field, value);
        selectElement.appendChild(option);
    });
}

// Update cascading filters based on current selections
function updateCascadingFilters() {
    // Get currently filtered data based on hierarchy
    let availableData = stockData;
    
    // Apply filters in hierarchy order
    if (elements.logsFilter.value) {
        availableData = availableData.filter(item => item.Logs === elements.logsFilter.value);
    }
    
    if (elements.certificateFilter.value) {
        availableData = availableData.filter(item => item.Certificate === elements.certificateFilter.value);
    }
    
    if (elements.gradeFilter.value) {
        availableData = availableData.filter(item => item.Grade === elements.gradeFilter.value);
    }
    
    // Update subsequent filters with available options
    const currentValues = {
        logs: elements.logsFilter.value,
        certificate: elements.certificateFilter.value,
        grade: elements.gradeFilter.value,
        size: elements.sizeFilter.value,
        thickness: elements.thicknessFilter.value,
        ply: elements.plyFilter.value
    };
    
    // Update Certificate filter if Logs is selected
    if (elements.logsFilter.value) {
        populateFilterOptions('Certificate', elements.certificateFilter, 'All Certificates', availableData);
        elements.certificateFilter.value = currentValues.certificate;
    }
    
    // Update Grade filter if Certificate is selected
    if (elements.certificateFilter.value) {
        populateFilterOptions('Grade', elements.gradeFilter, 'All Grades', availableData);
        elements.gradeFilter.value = currentValues.grade;
    }
    
    // Update Size filter if Grade is selected
    if (elements.gradeFilter.value) {
        populateFilterOptions('Size', elements.sizeFilter, 'All Sizes', availableData);
        elements.sizeFilter.value = currentValues.size;
    }
    
    // Update Thickness filter
    populateFilterOptions('Thickness', elements.thicknessFilter, 'All Thickness', availableData);
    elements.thicknessFilter.value = currentValues.thickness;
    
    // Update Plies filter
    populateFilterOptions('Ply', elements.plyFilter, 'All Plies', availableData);
    elements.plyFilter.value = currentValues.ply;
}

// Format filter option display text
function formatFilterOption(field, value) {
    if (field === 'Thickness') {
        return `${value}mm`;
    } else if (field === 'Ply') {
        return `${value} plies`;
    } else if (field === 'Size') {
        return `${value}mm`;
    } else if (field === 'Price') {
        return `$${value}/m³`;
    }
    
    // Use description from info data if available
    if (infoData[field] && infoData[field][value]) {
        return `${value} - ${infoData[field][value].description}`;
    }
    
    return value;
}

// Setup event listeners
function setupEventListeners() {
    // Filter change events with cascading updates
    const hierarchyFilters = [elements.logsFilter, elements.certificateFilter, elements.gradeFilter];
    const otherFilters = [elements.sizeFilter, elements.thicknessFilter, elements.plyFilter, elements.priceMin, elements.priceMax, elements.cratesMin];
    
    // Hierarchy filters trigger cascading updates
    hierarchyFilters.forEach(element => {
        element.addEventListener('change', () => {
            updateCascadingFilters();
            filterProducts();
        });
    });
    
    // Other filters just trigger filtering
    otherFilters.forEach(element => {
        element.addEventListener('change', filterProducts);
        if (element.type === 'number') {
            element.addEventListener('input', debounce(filterProducts, 500));
        }
    });
    
    // Clear filters
    elements.clearFilters.addEventListener('click', clearAllFilters);
    
    // Advanced filters toggle
    elements.toggleAdvanced.addEventListener('click', toggleAdvancedFilters);
    
    // View controls
    elements.viewGrid.addEventListener('click', () => setView('grid'));
    elements.viewList.addEventListener('click', () => setView('list'));
    
    // Modal events
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCloseBtn.addEventListener('click', closeModal);
    elements.modalContact.addEventListener('click', handleContactRequest);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });
    
    // Contact button
    elements.contactBtn.addEventListener('click', handleGeneralContact);
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Filter products based on current filter values
function filterProducts() {
    elements.loading.style.display = 'block';
    elements.productsGrid.style.display = 'none';
    elements.emptyState.style.display = 'none';
    
    setTimeout(() => {
        filteredProducts = stockData.filter(product => {
            // Primary filters (hierarchy)
            if (elements.logsFilter.value && product.Logs !== elements.logsFilter.value) return false;
            if (elements.certificateFilter.value && product.Certificate !== elements.certificateFilter.value) return false;
            if (elements.gradeFilter.value && product.Grade !== elements.gradeFilter.value) return false;
            
            // Secondary filters
            if (elements.sizeFilter.value && product.Size !== elements.sizeFilter.value) return false;
            if (elements.thicknessFilter.value && product.Thickness != elements.thicknessFilter.value) return false;
            if (elements.plyFilter.value && product.Ply != elements.plyFilter.value) return false;
            
            // Advanced filters
            if (elements.priceMin.value && product.Price < parseFloat(elements.priceMin.value)) return false;
            if (elements.priceMax.value && product.Price > parseFloat(elements.priceMax.value)) return false;
            if (elements.cratesMin.value && product.Crates < parseInt(elements.cratesMin.value)) return false;
            
            return true;
        });
        
        renderProducts();
        updateResultsCount();
        updateDynamicSummary();
        elements.loading.style.display = 'none';
    }, 300);
}

// Update dynamic summary with filtered data
function updateDynamicSummary() {
    const dataToUse = filteredProducts.length > 0 ? filteredProducts : stockData;
    const isFiltered = filteredProducts.length !== stockData.length;
    
    // Calculate counts
    const totalProducts = dataToUse.length;
    const totalCrates = dataToUse.reduce((sum, product) => sum + product.Crates, 0);
    const prices = dataToUse.map(product => product.Price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    // Calculate distinct counts
    const materialCount = new Set(dataToUse.map(p => p.Logs)).size;
    const certificateCount = new Set(dataToUse.map(p => p.Certificate)).size;
    const gradeCount = new Set(dataToUse.map(p => p.Grade)).size;
    
    // Update main summary
    const filteredText = '';
    const noResultsText = totalProducts === 0 ? ' (no results)' : '';
    
    elements.totalProducts.textContent = totalProducts + noResultsText;
    elements.totalCrates.textContent = formatNumber(totalCrates) + noResultsText;
    elements.priceRange.textContent = `$${formatCurrency(minPrice)}-${formatCurrency(maxPrice)}` + noResultsText;
    
    // Update distinct counts
    if (elements.materialCount) {
        elements.materialCount.textContent = materialCount + noResultsText;
    }
    if (elements.certificateCount) {
        elements.certificateCount.textContent = certificateCount + noResultsText;
    }
    if (elements.gradeCount) {
        elements.gradeCount.textContent = gradeCount + noResultsText;
    }
    
    // Update card colors based on state
    updateSummaryCardColors(isFiltered, totalProducts === 0);
}

// Update summary card colors
function updateSummaryCardColors(isFiltered, noResults) {
    const cards = document.querySelectorAll('.summary-card');
    cards.forEach(card => {
        card.classList.remove('filtered', 'no-results');
        if (noResults) {
            card.classList.add('no-results');
        } else if (isFiltered) {
            card.classList.add('filtered');
        }
    });
}

// Render products in current view
function renderProducts() {
    if (filteredProducts.length === 0) {
        elements.productsGrid.style.display = 'none';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    elements.productsGrid.style.display = 'grid';
    
    if (currentView === 'grid') {
        renderGridView();
    } else {
        renderListView();
    }
}

// Render grid view (cards)
function renderGridView() {
    elements.productsGrid.className = 'products-grid';
    elements.productsGrid.innerHTML = '';
    
    filteredProducts.forEach((product, index) => {
        const card = createProductCard(product, index);
        elements.productsGrid.appendChild(card);
    });
}

// Render list view
function renderListView() {
    elements.productsGrid.className = 'products-list';
    elements.productsGrid.innerHTML = '';
    
    // Create table for list view
    const table = document.createElement('table');
    table.className = 'products-table';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="text-align: center;">Material</th>
            <th style="text-align: center;">Grade</th>
            <th style="text-align: center;">Size</th>
            <th style="text-align: center;">Thickness</th>
            <th style="text-align: center;">Plies</th>
            <th style="text-align: center;">Crates</th>
            <th style="text-align: center;">Weight/Crate</th>
            <th style="text-align: center;">Price/m³</th>
            <th style="text-align: center;">Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    filteredProducts.forEach((product, index) => {
        const row = createProductRow(product, index);
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    elements.productsGrid.appendChild(table);
}

// Create product card for grid view
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductDetails(product);
    
    // Get material class for background color
    const materialClass = getMaterialClass(product.Logs);
    const gradeClass = getGradeClass(product.Grade);
    
    card.innerHTML = `
        <div class="product-header">
            <div class="product-badges">
                <span class="badge logs ${materialClass}">${product.Logs.toUpperCase()}</span>
                <span class="badge grade ${gradeClass}">${product.Grade}</span>
            </div>
            <div class="stock-indicator">
                <div class="stock-dot"></div>
                <span>${product.Crates} crates</span>
            </div>
        </div>
        
        <div class="product-main">
            <div class="product-size">${product.Size}mm</div>
            <div class="product-thickness">${product.Thickness}mm thick</div>
            <div class="product-specs">${product.Ply} plies • ${formatWeight(product.WeightPerCrate || 0)}/crate</div>
        </div>
        
        <div class="product-footer">
            <div class="product-price">
                $${formatCurrency(product.Price)}
                <span class="price-unit">/m³</span>
            </div>
            <button class="btn-details" onclick="event.stopPropagation(); showProductDetails(stockData[${stockData.indexOf(product)}])">
                Details
            </button>
        </div>
    `;
    
    return card;
}

// Create product row for list view
function createProductRow(product, index) {
    const row = document.createElement('tr');
    row.className = 'product-row';
    row.onclick = () => showProductDetails(product);
    
    const materialClass = getMaterialClass(product.Logs);
    const gradeClass = getGradeClass(product.Grade);
    
    row.innerHTML = `
        <td style="text-align: left;"><span class="badge logs ${materialClass}">${product.Logs.toUpperCase()}</span></td>
        <td style="text-align: left;"><span class="badge grade ${gradeClass}">${product.Grade}</span></td>
        <td style="text-align: right;">${product.Size}mm</td>
        <td style="text-align: right;">${product.Thickness}mm</td>
        <td style="text-align: right;">${product.Ply}</td>
        <td style="text-align: right;">${product.Crates}</td>
        <td style="text-align: right;">${formatWeight(product.WeightPerCrate || 0)}</td>
        <td style="text-align: right;">$${formatCurrency(product.Price)}</td>
        <td style="text-align: center;">
            <button class="btn-details" onclick="event.stopPropagation(); showProductDetails(stockData[${stockData.indexOf(product)}])">
                Details
            </button>
        </td>
    `;
    
    return row;
}

// Get material class for color coding
function getMaterialClass(material) {
    switch(material.toLowerCase()) {
        case 'pine': return 'material-pine';
        case 'combi': return 'material-combi';
        case 'combi e': return 'material-combi-e';
        case 'euca': return 'material-euca';
        default: return 'material-default';
    }
}

// Get grade class for color coding
function getGradeClass(grade) {
    switch(grade.toLowerCase()) {
        case 'c+/c': return 'grade-premium';
        case 'cp/c': return 'grade-premium';
        case 'bcx': return 'grade-good';
        case 'c/c': return 'grade-standard';
        case 'ccx': return 'grade-standard';
        case 'cdx': return 'grade-standard';
        case 'falldown': return 'grade-falldown';
        case 'shop grade': return 'grade-shop';
        default: return 'grade-default';
    }
}

// Show product details in modal
function showProductDetails(product) {
    // Calculate real weight information
    const weightPerCrate = product.WeightPerCrate || 0;
    const volumePerCrate = product.VolumePerCrate || 0;
    const densityPerM3 = volumePerCrate > 0 ? weightPerCrate / volumePerCrate : 0;
    const sheetsPerCrate = product.SheetsPerCrate || 0;
    const weightPerSheet = sheetsPerCrate > 0 ? weightPerCrate / sheetsPerCrate : 0;
    
    // Container calculations
    const payloadLimit = product.PayloadLimit || 28500;
    const maxCratesByWeight = weightPerCrate > 0 ? Math.floor(payloadLimit / weightPerCrate) : 0;
    const practicalCapacity = maxCratesByWeight * volumePerCrate;
    
    // Pricing calculations
    const pricePerCrate = volumePerCrate * product.Price;
    const pricePerSheet = sheetsPerCrate > 0 ? pricePerCrate / sheetsPerCrate : 0;
    const containerValue = maxCratesByWeight * pricePerCrate;
    
    elements.modalTitle.textContent = `${product.Logs.toUpperCase()} ${product.Grade} - ${product.Size}mm`;
    
    elements.modalBody.innerHTML = `
        <div class="product-details">
            <div class="detail-section">
                <h3>Product Specifications</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Raw Material:</label>
                        <span>${product.Logs.toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <label>Certificate:</label>
                        <span>${product.Certificate}</span>
                    </div>
                    <div class="detail-item">
                        <label>Grade:</label>
                        <span>${product.Grade}</span>
                    </div>
                    <div class="detail-item">
                        <label>Dimensions:</label>
                        <span>${product.Size}mm</span>
                    </div>
                    <div class="detail-item">
                        <label>Thickness:</label>
                        <span>${product.Thickness}mm</span>
                    </div>
                    <div class="detail-item">
                        <label>Plies:</label>
                        <span>${product.Ply} plies</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Availability & Stock</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Available Stock:</label>
                        <span>${product.Crates} crates</span>
                    </div>
                    <div class="detail-item">
                        <label>Sheets per crate:</label>
                        <span>${sheetsPerCrate} sheets</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Real Weight Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Actual weight per crate:</label>
                        <span>${formatWeight(weightPerCrate)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Density per m³:</label>
                        <span>${formatDensity(densityPerM3)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Weight per sheet:</label>
                        <span>${formatWeight(weightPerSheet)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Volume per crate:</label>
                        <span>${formatVolume(volumePerCrate)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Container Information (40' HC)</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Practical capacity:</label>
                        <span>${formatVolume(practicalCapacity)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Max crates per container:</label>
                        <span>${maxCratesByWeight} crates</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Pricing Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>FOB Price per m³:</label>
                        <span>$${formatCurrency(product.Price)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Price per sheet:</label>
                        <span>$${formatCurrency(pricePerSheet)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Price per crate:</label>
                        <span>$${formatCurrency(pricePerCrate)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Container value:</label>
                        <span>$${formatNumber(containerValue)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Additional Information</h3>
                <div class="info-notes">
                    <p><strong>Weight Data:</strong> Based on real measurements from production</p>
                    <p><strong>Delivery Port:</strong> Estimated 10 days from order confirmation</p>
                    <p><strong>Payment:</strong> Cash against copy documents / Port Payment</p>
                    <p><strong>Packaging:</strong> Export packaging with 5 steel straps and over 3 wooded skids</p>
                    <p><strong>Documentation:</strong> BL / Invoice / PList / EUTR / CO / Others</p>
                </div>
            </div>
        </div>
    `;
    
    // Store current product for contact
    elements.modalContact.dataset.product = JSON.stringify(product);
    
    elements.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    elements.modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Handle contact request for specific product
function handleContactRequest() {
    const productData = JSON.parse(elements.modalContact.dataset.product || '{}');
    
    const message = `Hello! I'm interested in your plywood stock:\\n\\n` +
                   `Product: ${productData.Logs} ${productData.Grade}\\n` +
                   `Size: ${productData.Size}mm\\n` +
                   `Thickness: ${productData.Thickness}mm\\n` +
                   `Available: ${productData.Crates} crates\\n` +
                   `Listed Price: $${productData.Price}/m³\\n\\n` +
                   `Please provide:\\n` +
                   `- Final pricing for my quantity\\n` +
                   `- Delivery timeline\\n` +
                   `- Payment terms\\n\\n` +
                   `Looking forward to your response.`;
    
    // For demo purposes, show alert. In production, integrate with email/contact system
    alert('Contact request prepared. In production, this would send an email or open your preferred contact method.');
    console.log('Contact message:', message);
    
    closeModal();
}

// Handle general contact
function handleGeneralContact() {
    const message = `Hello! I'm interested in your Brazilian plywood products and would like to discuss available stock and pricing.`;
    
    // For demo purposes, show alert. In production, integrate with email/contact system
    alert('General contact request. In production, this would open your preferred contact method.');
    console.log('General contact message:', message);
}

// Clear all filters
function clearAllFilters() {
    elements.logsFilter.value = '';
    elements.certificateFilter.value = '';
    elements.gradeFilter.value = '';
    elements.sizeFilter.value = '';
    elements.thicknessFilter.value = '';
    elements.plyFilter.value = '';
    elements.priceMin.value = '';
    elements.priceMax.value = '';
    elements.cratesMin.value = '';
    
    // Reset all filters to show all options
    initializeFilters();
    filterProducts();
}

// Toggle advanced filters
function toggleAdvancedFilters() {
    const isVisible = elements.advancedFilters.classList.contains('show');
    
    if (isVisible) {
        elements.advancedFilters.classList.remove('show');
        elements.toggleAdvanced.classList.remove('active');
        elements.toggleAdvanced.querySelector('i:last-child').className = 'fas fa-chevron-down';
    } else {
        elements.advancedFilters.classList.add('show');
        elements.toggleAdvanced.classList.add('active');
        elements.toggleAdvanced.querySelector('i:last-child').className = 'fas fa-chevron-up';
    }
}

// Set view mode
function setView(view) {
    currentView = view;
    
    elements.viewGrid.classList.toggle('active', view === 'grid');
    elements.viewList.classList.toggle('active', view === 'list');
    
    renderProducts();
}

// Update results count
function updateResultsCount() {
    const total = stockData.length;
    const filtered = filteredProducts.length;
    
    if (filtered === total) {
        elements.resultsCount.textContent = `Showing all ${total} products`;
    } else {
        elements.resultsCount.textContent = `Showing ${filtered} of ${total} products`;
    }
}

// Update summary statistics (initial load)
function updateSummary() {
    updateDynamicSummary();
}

// Update last update time
function updateLastUpdate() {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    elements.lastUpdate.textContent = formatted;
}

// Formatting functions
function formatCurrency(value) {
    return Math.round(value).toLocaleString('en-US');
}

function formatNumber(value) {
    return Math.round(value).toLocaleString('en-US');
}

function formatWeight(value) {
    return `${value.toFixed(1)}kg`;
}

function formatVolume(value) {
    return `${value.toFixed(3)}m³`;
}

function formatDensity(value) {
    return `${value.toFixed(1)}kg/m³`;
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for enhanced features
const enhancedCSS = `
.products-list {
    display: block !important;
}

.products-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.products-table th {
    background: #f7fafc;
    padding: 1rem;
    font-weight: 600;
    color: #2d3748;
    border-bottom: 2px solid #e2e8f0;
}

.products-table td {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
}

.product-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.product-row:hover {
    background-color: #f7fafc;
}

/* Material colors based on density */
.material-pine { background-color: #e8f5e8 !important; color: #2d5016 !important; }
.material-combi { background-color: #e0f2f1 !important; color: #1b5e20 !important; }
.material-combi-e { background-color: #e0f2f1 !important; color: #1b5e20 !important; }
.material-euca { background-color: #c8e6c9 !important; color: #1b5e20 !important; }

/* Grade colors */
.grade-premium { background-color: #e8f5e8; color: #2d5016; }
.grade-good { background-color: #fff3cd; color: #856404; }
.grade-standard { background-color: #d1ecf1; color: #0c5460; }
.grade-falldown { background-color: #f8d7da; color: #721c24; }
.grade-shop { background-color: #e2e3e5; color: #383d41; }

/* Summary card states */
.summary-card.filtered {
    border-color: #00B04F;
    background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
}

.summary-card.no-results {
    border-color: #e53e3e;
    background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
}

.summary-card.filtered .summary-value {
    color: #00B04F;
}

.summary-card.no-results .summary-value {
    color: #e53e3e;
}

.detail-section {
    margin-bottom: 2rem;
}

.detail-section h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #00B04F;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-item label {
    font-weight: 500;
    color: #4a5568;
    font-size: 0.9rem;
}

.detail-item span {
    color: #2d3748;
    font-size: 1rem;
}

.info-notes {
    background: #f7fafc;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #00B04F;
}

.info-notes p {
    margin-bottom: 0.5rem;
    color: #4a5568;
    line-height: 1.5;
}

.info-notes p:last-child {
    margin-bottom: 0;
}

.error-message {
    text-align: center;
    padding: 2rem;
    color: #e53e3e;
}

.error-message i {
    font-size: 3rem;
    margin-bottom: 1rem;
}
`;

// Inject enhanced CSS
const style = document.createElement('style');
style.textContent = enhancedCSS;
document.head.appendChild(style);

