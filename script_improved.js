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
    
    // Cart
    cartModal: document.getElementById('cart-modal'),
    cartModalClose: document.getElementById('cart-modal-close'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartSendForm: document.getElementById('cart-send-form'),
    cartEmail: document.getElementById('cart-email'),
    cartCount: document.getElementById('cart-count')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadStockData();
    setupEventListeners();
    setupCartEvents();
    updateCartCount();
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
        if (e.key === 'Escape') {
            if (elements.modal.style.display === 'block') {
                closeModal();
            }
            if (elements.cartModal.style.display === 'block') {
                closeCartModal();
            }
        }
    });
}

// Setup cart events
function setupCartEvents() {
    const openCartBtn = document.getElementById('open-cart-btn');
    if (openCartBtn) {
        openCartBtn.addEventListener('click', showCartModal);
    }
    
    if (elements.cartModalClose) {
        elements.cartModalClose.addEventListener('click', closeCartModal);
    }
    
    if (elements.cartSendForm) {
        elements.cartSendForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendCartEmail();
        });
    }
    
    // Expose functions globally for onclick handlers
    window.removeFromCart = removeFromCart;
    window.updateCartItemQuantity = updateCartItemQuantity;
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
        container.innerHTML = '<div class="no-products">No products found with the selected criteria.</div>';
        return;
    }
    
    // Set container class based on view
    container.className = currentView === 'grid' ? 'products-grid' : 'products-list';
    
    container.innerHTML = filteredData.map(product => createProductCard(product)).join('');
    
    // Add event listeners to details buttons
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
                        <div class="product-specs">${product.Crates} crates available • ${product.Thickness}mm • ${product.Ply} ply</div>
                    </div>
                </div>
                <div class="product-price">$${formatCurrency(product.Price)} / m³ FOB</div>
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
                    <div class="product-specs">${product.Thickness}mm • ${product.Ply} ply</div>
                    <div class="product-specs">${product.Crates} crates available</div>
                </div>
                <div class="product-price">$${formatCurrency(product.Price)} / m³ FOB</div>
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
                        <div class="detail-label">Wood Species</div>
                        <div class="detail-value">${product.Logs}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Certificate</div>
                        <div class="detail-value">${product.Certificate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Grade</div>
                        <div class="detail-value">${formatGrade(product.Grade)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Dimensions</div>
                        <div class="detail-value">${product.Size}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Thickness</div>
                        <div class="detail-value">${product.Thickness}mm</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Ply</div>
                        <div class="detail-value">${product.Ply}</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>📦 Stock & Weight Info</h4>
                <div class="section-grid">
                    <div class="detail-item">
                        <div class="detail-label">Crates available</div>
                        <div class="detail-value">${product.Crates} crates</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Sheets/Crate</div>
                        <div class="detail-value">${product.SheetsPerCrate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Weight/Crate</div>
                        <div class="detail-value">${formatNumber(product.WeightPerCrate)} kg</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Density/m³</div>
                        <div class="detail-value">${formatNumber(densityPerM3)} kg/m³</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Weight/Sheet</div>
                        <div class="detail-value">${formatNumber(weightPerSheet)} kg</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Volume/Crate</div>
                        <div class="detail-value">${product.VolumePerCrate.toFixed(3)} m³</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>🚢 Shipping & Pricing</h4>
                <div class="section-grid">
                  
                    <div class="detail-item">
                        <div class="detail-label">Max Crates/ctnr</div>
                        <div class="detail-value">${maxCratesPerContainer}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Price/m³ fob</div>
                        <div class="detail-value">$${formatCurrency(product.Price)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Price/Sheet</div>
                        <div class="detail-value">$${formatNumber(pricePerSheet)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Price/Crate</div>
                        <div class="detail-value">$${formatNumber(pricePerCrate)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Container $</div>
                        <div class="detail-value">$${formatNumber(containerValue)}</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h4>🛒 ${t('addToCart')}</h4>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
                    <label for="cart-qty" style="font-weight:600;">Quantity (crates):</label>
                    <input type="number" id="cart-qty" min="1" max="${product.Crates}" value="1" class="cart-qty">
                    <button id="add-to-cart-btn" class="cart-btn">${t('addToCart')}</button>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: #64748b;">
                    ${t('maxAvailable', {qty: product.Crates})}
                </div>
            </div>
        </div>
    `;
    
    elements.modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Setup add to cart button
    const addBtn = document.getElementById('add-to-cart-btn');
    const qtyInput = document.getElementById('cart-qty');
    if (addBtn && qtyInput) {
        addBtn.addEventListener('click', () => {
            const qty = Math.max(1, Math.min(product.Crates, parseInt(qtyInput.value) || 1));
            addToCart(product, qty);
            showValidationMessage(t('cartAdded'));
            setTimeout(() => {
                closeModal();
            }, 1000);
        });
    }
}

// Close modal
function closeModal() {
    if (elements.modal) {
        elements.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cart functions
function addToCart(product, qty) {
    const productId = `${product.Logs}-${product.Grade}-${product.Size}-${product.Thickness}`;
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.qty += qty;
        if (existingItem.qty > product.Crates) {
            existingItem.qty = product.Crates;
        }
    } else {
        cart.push({
            id: productId,
            desc: `${product.Logs} ${formatGrade(product.Grade)} - ${product.Size} (${product.Thickness}mm)`,
            qty: Math.min(qty, product.Crates),
            price: product.Price,
            pricePerCrate: product.Price * product.VolumePerCrate,
            product: product
        });
    }
    
    updateCartCount();
    renderCartItems();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartCount();
    renderCartItems();
}

function updateCartItemQuantity(id, newQty) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.qty = Math.max(1, Math.min(item.product.Crates, newQty));
        renderCartItems();
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
    }
}

function renderCartItems() {
    if (!elements.cartItemsList) return;
    
    if (cart.length === 0) {
        elements.cartItemsList.innerHTML = `
            <div style="text-align:center; color:#64748b; padding:2rem;">
                <div style="font-size:3rem; margin-bottom:1rem;">🛒</div>
                <div>${t('cartEmptyTitle')}</div>
                <div style="font-size:0.9rem; margin-top:0.5rem;">${t('cartEmptySubtitle')}</div>
            </div>
        `;
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.pricePerCrate * item.qty), 0);
    const totalCrates = cart.reduce((sum, item) => sum + item.qty, 0);

    // Build the summary of items for the quote
    let resumo = `${t('cartQuoteRequest')}\n\n`;
    resumo += `${t('cartSelectedItems')}\n`;
    cart.forEach(item => {
        resumo += `- ${item.desc}\n`;
        resumo += `  Quantity: ${item.qty} crates\n`;
        resumo += `  ${t('cartUnitPrice')} $${formatCurrency(item.pricePerCrate)}\n`;
        resumo += `  ${t('cartSubtotal')} $${formatCurrency(item.pricePerCrate * item.qty)}\n\n`;
    });
    resumo += `${t('cartTotalCrates')} ${totalCrates}\n`;
    resumo += `${t('cartEstimatedTotal')} $${formatCurrency(total)}\n\n`;
    resumo += `${t('cartNote')}`;

    elements.cartItemsList.innerHTML = `
        ${cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-desc">
                    <div style="font-weight:600;">${item.desc}</div>
                    <div style="font-size:0.9rem; color:#64748b;">
                        $${formatCurrency(item.pricePerCrate)} per crate
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <input type="number" min="1" max="${item.product.Crates}" value="${item.qty}" 
                           onchange="updateCartItemQuantity('${item.id}', parseInt(this.value))"
                           style="width:60px; padding:0.3rem; border:1px solid #e2e8f0; border-radius:4px;">
                    <div style="font-weight:600; min-width:80px;">$${formatCurrency(item.pricePerCrate * item.qty)}</div>
                    <button onclick="removeFromCart('${item.id}')" 
                            style="background:#ef4444; color:white; border:none; padding:0.3rem 0.8rem; border-radius:6px; cursor:pointer;">
                        ${t('cartRemove')}
                    </button>
                </div>
            </div>
        `).join('')}
        <div style="border-top:2px solid #e2e8f0; margin-top:1rem; padding-top:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.2rem; font-weight:700;">
                <span>${t('cartTotal')}</span>
                <span style="color:#00B04F;">$${formatCurrency(total)}</span>
            </div>
            <div style="font-size:0.9rem; color:#64748b; margin-top:0.5rem;">
                ${t('cartCratesTotal', {qty: cart.reduce((sum, item) => sum + item.qty, 0)})}
            </div>
        </div>
        <form id="cart-formspree" action="https://formspree.io/f/xbladnvd" method="POST" style="margin-top:2rem; background:#f6f6f6; padding:1.5rem; border-radius:8px;">
            <h4 style="color:#00B04F; margin-bottom:1rem;">${t('cartSendTitle')}</h4>
            <label for="cart-email-form" style="font-weight:600;">${t('cartEmail')}</label>
            <input type="email" id="cart-email-form" name="email" required style="width:100%; margin-bottom:1rem; padding:0.5rem; border-radius:6px; border:1px solid #e2e8f0;">
            <label for="cart-message-form" style="font-weight:600;">${t('cartSummary')}</label>
            <textarea id="cart-message-form" name="message" readonly style="width:100%; min-height:120px; margin-bottom:1rem; padding:1rem; border-radius:8px; border:1px solid #e2e8f0; font-size:1rem;">${resumo}</textarea>
            <button type="submit" style="background:#00B04F; color:white; border:none; padding:0.7rem 2rem; border-radius:6px; font-weight:600; font-size:1.1rem; cursor:pointer;">${t('cartSendBtn')}</button>
            <div style="font-size:0.9rem; color:#64748b; margin-top:0.5rem;">${t('cartSendInfo')}</div>
        </form>
    `;
}

function showCartModal() {
    if (elements.cartModal) {
        renderCartItems();
        elements.cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeCartModal() {
    if (elements.cartModal) {
        elements.cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function sendCartEmail() {
    alert(t('cartFormAlert'));
}

function showValidationMessage(msg) {
    let validationDiv = document.getElementById('cart-validation-msg');
    if (!validationDiv) {
        validationDiv = document.createElement('div');
        validationDiv.id = 'cart-validation-msg';
        validationDiv.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: #00B04F;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            z-index: 4000;
            font-weight: 600;
            display: none;
        `;
        document.body.appendChild(validationDiv);
    }
    validationDiv.textContent = msg;
    validationDiv.style.display = 'block';
    setTimeout(() => {
        validationDiv.style.display = 'none';
    }, 3000);
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

