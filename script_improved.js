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
