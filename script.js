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
    cartCount: document.getElementById('cart-count')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadStockData();
    setupEventListeners();
    setupCartEvents();
    updateCartCount();
    loadCartFromStorage();
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
    if (!selectElement) return;
    
    // Keep the default option
    const defaultOption = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = '';
    if (defaultOption) {
        selectElement.appendChild(defaultOption);
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'All';
        selectElement.appendChild(option);
    }
    
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = formatter ? formatter(value) : value;
        selectElement.appendChild(option);
    });
}

// Format grade for display (uppercase)
function formatGrade(grade) {
    return grade.toUpperCase();
}

// Setup event listeners
function setupEventListeners() {
    // Filter events
    if (elements.woodTypeFilter) elements.woodTypeFilter.addEventListener('change', applyFilters);
    if (elements.certificateFilter) elements.certificateFilter.addEventListener('change', applyFilters);
    if (elements.gradeFilter) elements.gradeFilter.addEventListener('change', applyFilters);
    if (elements.thicknessFilter) elements.thicknessFilter.addEventListener('change', applyFilters);
    if (elements.clearFiltersBtn) elements.clearFiltersBtn.addEventListener('click', clearFilters);
    
    // View controls
    if (elements.gridViewBtn) elements.gridViewBtn.addEventListener('click', () => setView('grid'));
    if (elements.listViewBtn) elements.listViewBtn.addEventListener('click', () => setView('list'));
    
    // Modal events
    if (elements.modalClose) elements.modalClose.addEventListener('click', closeModal);
    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) closeModal();
        });
    }
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeCartModal();
        }
    });
}

// Setup cart events
function setupCartEvents() {
    const openCartBtn = document.getElementById('open-cart-btn');
    if (openCartBtn) openCartBtn.addEventListener('click', showCartModal);
    
    if (elements.cartModalClose) elements.cartModalClose.addEventListener('click', closeCartModal);
    if (elements.cartModal) {
        elements.cartModal.addEventListener('click', (e) => {
            if (e.target === elements.cartModal) closeCartModal();
        });
    }
}

// Apply filters
function applyFilters() {
    const woodType = elements.woodTypeFilter?.value || '';
    const certificate = elements.certificateFilter?.value || '';
    const grade = elements.gradeFilter?.value || '';
    const thickness = elements.thicknessFilter?.value || '';
    
    filteredData = stockData.filter(item => {
        return (!woodType || item.Logs === woodType) &&
               (!certificate || item.Certificate === certificate) &&
               (!grade || item.Grade === grade) &&
               (!thickness || item.Thickness.toString() === thickness);
    });
    
    renderProducts();
    updateProductCount();
}

// Clear filters
function clearFilters() {
    if (elements.woodTypeFilter) elements.woodTypeFilter.value = '';
    if (elements.certificateFilter) elements.certificateFilter.value = '';
    if (elements.gradeFilter) elements.gradeFilter.value = '';
    if (elements.thicknessFilter) elements.thicknessFilter.value = '';
    
    filteredData = [...stockData];
    renderProducts();
    updateProductCount();
}

// Set view mode
function setView(view) {
    currentView = view;
    
    // Update button states
    if (elements.gridViewBtn) elements.gridViewBtn.classList.toggle('active', view === 'grid');
    if (elements.listViewBtn) elements.listViewBtn.classList.toggle('active', view === 'list');
    
    // Update container class
    if (elements.productsContainer) {
        elements.productsContainer.classList.toggle('products-grid', view === 'grid');
        elements.productsContainer.classList.toggle('products-list', view === 'list');
    }
    
    renderProducts();
}

// Update statistics
function updateStats() {
    if (!stockData || stockData.length === 0) return;
    
    const woodTypes = new Set(stockData.map(item => item.Logs)).size;
    const certificates = new Set(stockData.map(item => item.Certificate)).size;
    const grades = new Set(stockData.map(item => item.Grade)).size;
    const totalCrates = stockData.reduce((sum, item) => sum + (item.Crates || 0), 0);
    
    if (elements.totalProducts) elements.totalProducts.textContent = stockData.length;
    if (elements.rawMaterials) elements.rawMaterials.textContent = woodTypes;
    if (elements.certificates) elements.certificates.textContent = certificates;
    if (elements.grades) elements.grades.textContent = grades;
    if (elements.totalCrates) elements.totalCrates.textContent = totalCrates;
}

// Update product count
function updateProductCount() {
    if (elements.productsCount) {
        elements.productsCount.textContent = filteredData.length;
    }
}

// Render products
function renderProducts() {
    if (!elements.productsContainer) return;
    
    if (filteredData.length === 0) {
        elements.productsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #64748b;">
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    const productsHTML = filteredData.map((product, index) => createProductCard(product, index)).join('');
    elements.productsContainer.innerHTML = productsHTML;
    
    // Add event listeners to product cards
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.productId);
            const product = filteredData[productId];
            if (product) {
                showProductModal(product);
            }
        });
    });
}

// Create product card HTML (mantendo layout original)
function createProductCard(product, index) {
    const price = product.Price || 0;
    const formattedPrice = price > 0 ? `$${price.toLocaleString()}` : 'Contact for price';
    
    return `
        <div class="product-card">
            <div class="product-header">
                <div>
                    <h3 class="product-title">${product.Logs} ${product.Size}</h3>
                    <div class="product-price">${formattedPrice}</div>
                </div>
            </div>
            
            <div class="product-badges">
                <span class="badge badge-material">${product.Logs}</span>
                <span class="badge badge-certificate">${product.Certificate}</span>
                <span class="badge badge-grade">${product.Grade}</span>
            </div>
            
            <div class="product-specs">
                <div class="spec-item">
                    <span class="spec-label">Thickness:</span>
                    <span class="spec-value">${product.Thickness}mm</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Ply:</span>
                    <span class="spec-value">${product.Ply}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Crates:</span>
                    <span class="spec-value">${product.Crates}</span>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="details-btn" data-product-id="${index}">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Show product modal
function showProductModal(product) {
    if (!elements.modal || !product) return;
    
    if (elements.modalTitle) elements.modalTitle.textContent = `${product.Logs} ${product.Size}`;
    if (elements.modalBody) elements.modalBody.innerHTML = createModalContent(product);
    elements.modal.style.display = 'flex';
    
    // Add event listener for add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('cart-quantity')?.value) || 1;
            addToCart(product, quantity);
        });
    }
}

// Create modal content
function createModalContent(product) {
    const price = product.Price || 0;
    const formattedPrice = price > 0 ? `$${price.toLocaleString()}` : 'Contact for price';
    
    return `
        <div class="modal-section">
            <h4>📦 Product Information</h4>
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
                    <div class="detail-value">${product.Grade}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Size (L×W)</div>
                    <div class="detail-value">${product.Size}mm</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Thickness</div>
                    <div class="detail-value">${product.Thickness}mm</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Plies</div>
                    <div class="detail-value">${product.Ply}</div>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h4>📊 Stock & Logistics</h4>
            <div class="section-grid">
                <div class="detail-item">
                    <div class="detail-label">Available Crates</div>
                    <div class="detail-value">${product.Crates}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Price per Crate</div>
                    <div class="detail-value">${formattedPrice}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Weight per Crate</div>
                    <div class="detail-value">${product.WeightPerCrate || 0} kg</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Volume per Crate</div>
                    <div class="detail-value">${product.VolumePerCrate || 0} m³</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Sheets per Crate</div>
                    <div class="detail-value">${product.SheetsPerCrate || 0}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Payload Limit</div>
                    <div class="detail-value">${product.PayloadLimit || 0} kg</div>
                </div>
            </div>
        </div>
        
        <div class="modal-section">
            <h4>🛒 Add to Interest List</h4>
            <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem;">
                <label for="cart-quantity">Quantity (crates):</label>
                <input type="number" id="cart-quantity" min="1" max="${product.Crates}" value="1" 
                       style="width: 80px; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px;">
                <button id="add-to-cart-btn" class="cart-btn">
                    Add to List
                </button>
            </div>
        </div>
    `;
}

// Close modal
function closeModal() {
    if (elements.modal) {
        elements.modal.style.display = 'none';
    }
}

// Cart functions
function addToCart(product, quantity = 1) {
    const existingItem = cart.find(item => 
        item.product.Logs === product.Logs && 
        item.product.Certificate === product.Certificate &&
        item.product.Grade === product.Grade &&
        item.product.Thickness === product.Thickness &&
        item.product.Size === product.Size
    );
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ product, quantity });
    }
    
    updateCartCount();
    saveCartToStorage();
    showMessage(`Added ${quantity} crate(s) to interest list`, 'success');
    closeModal();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    saveCartToStorage();
    renderCartItems();
    showMessage('Item removed from interest list', 'success');
}

function updateCartQuantity(index, quantity) {
    if (quantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = quantity;
    saveCartToStorage();
    renderCartItems();
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
    }
}

function showCartModal() {
    if (elements.cartModal) {
        elements.cartModal.style.display = 'flex';
        renderCartItems();
    }
}

function closeCartModal() {
    if (elements.cartModal) {
        elements.cartModal.style.display = 'none';
    }
}

function renderCartItems() {
    if (!elements.cartItemsList) return;
    
    if (cart.length === 0) {
        elements.cartItemsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #64748b;">
                <p>Your interest list is empty</p>
                <p>Add products to create a quotation request</p>
            </div>
        `;
        return;
    }
    
    const cartHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-desc">
                <strong>${item.product.Logs} ${item.product.Size}</strong><br>
                <small>${item.product.Certificate} • ${item.product.Grade} • ${item.product.Thickness}mm</small>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="number" value="${item.quantity}" min="1" max="${item.product.Crates}"
                       onchange="updateCartQuantity(${index}, parseInt(this.value))"
                       style="width: 60px; padding: 0.3rem; border: 1px solid #e2e8f0; border-radius: 4px; text-align: center;">
                <button onclick="removeFromCart(${index})" style="background: #ef4444; color: white; border: none; padding: 0.3rem 0.8rem; border-radius: 6px; cursor: pointer;">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
    
    elements.cartItemsList.innerHTML = cartHTML + `
        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
            <button onclick="sendQuotationRequest()" class="cart-btn" style="width: 100%;">
                Send Quotation Request
            </button>
        </div>
    `;
}

function sendQuotationRequest() {
    if (cart.length === 0) {
        showMessage('Please add items to your interest list first', 'error');
        return;
    }
    
    const cartSummary = cart.map(item => 
        `${item.quantity}x ${item.product.Logs} ${item.product.Size} (${item.product.Certificate}, ${item.product.Grade}, ${item.product.Thickness}mm)`
    ).join('\n');
    
    const subject = 'Quotation Request - Stock Available';
    const body = `Hello,\n\nI would like to request a quotation for the following products:\n\n${cartSummary}\n\nPlease provide pricing and availability information.\n\nThank you.`;
    
    const mailtoLink = `mailto:comercial01@repinho.ind.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    
    showMessage('Opening email client...', 'success');
}

// Storage functions
function saveCartToStorage() {
    try {
        localStorage.setItem('stockCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('stockCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        cart = [];
    }
}

// Utility functions
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = 'validation-message';
    messageEl.textContent = message;
    messageEl.style.background = type === 'error' ? '#ef4444' : '#00B04F';
    messageEl.style.position = 'fixed';
    messageEl.style.top = '24px';
    messageEl.style.right = '24px';
    messageEl.style.color = 'white';
    messageEl.style.padding = '1rem 2rem';
    messageEl.style.borderRadius = '8px';
    messageEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    messageEl.style.zIndex = '4000';
    messageEl.style.fontWeight = '600';
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Global functions for inline event handlers
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.sendQuotationRequest = sendQuotationRequest;
