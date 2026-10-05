let allProducts = [];
let allSuppliers = [];

// DOM Elements
const productsTableBody = document.getElementById('products-table-body');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const stockFilter = document.getElementById('stock-filter');
const resetFilterBtn = document.getElementById('reset-filter-btn');
const productCountSubtitle = document.getElementById('product-count-subtitle');

const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const openAddProductBtn = document.getElementById('open-add-product-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');

// Form input elements
const productIdInput = document.getElementById('product-id');
const prodNameInput = document.getElementById('prod-name');
const prodCodeInput = document.getElementById('prod-code');
const prodCategoryInput = document.getElementById('prod-category');
const prodSupplierInput = document.getElementById('prod-supplier');
const prodQtyInput = document.getElementById('prod-qty');
const prodPriceInput = document.getElementById('prod-price');
const prodReorderInput = document.getElementById('prod-reorder');
const prodDescInput = document.getElementById('prod-desc');

// Fetch suppliers to populate supplier select options
async function loadSuppliersForDropdown() {
  try {
    const res = await apiRequest('/suppliers');
    allSuppliers = res.data || [];
    
    prodSupplierInput.innerHTML = '<option value="">Select Supplier</option>' +
      allSuppliers.map(s => `<option value="${s.companyName}">${s.companyName} (${s.supplierName})</option>`).join('');
  } catch (err) {
    console.error('Failed to load suppliers for dropdown', err);
  }
}

// Fetch products from backend
async function fetchProducts() {
  try {
    const res = await apiRequest('/products');
    allProducts = res.data || [];
    applyFilters();
  } catch (err) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Failed to load products</h3>
          <p>${err.message}</p>
        </td>
      </tr>
    `;
    showToast('Failed to fetch products from backend', 'error');
  }
}

// Render products list into table
function renderProducts(products) {
  productCountSubtitle.textContent = `Showing ${products.length} product(s)`;

  if (products.length === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No products found</h3>
          <p>No products match your current search or filter criteria.</p>
        </td>
      </tr>
    `;
    return;
  }

  productsTableBody.innerHTML = products.map(p => {
    const isLowStock = p.quantity <= p.reorderLevel;
    const statusBadge = isLowStock
      ? `<span class="badge badge-low-stock">⚠️ LOW STOCK (${p.quantity}/${p.reorderLevel})</span>`
      : `<span class="badge badge-in-stock">✓ IN STOCK (${p.quantity})</span>`;

    return `
      <tr>
        <td><span class="badge badge-code">${p.productCode}</span></td>
        <td>
          <div style="font-weight: 700; color: var(--text-dark);">${p.productName}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${p.description || 'No description'}</div>
        </td>
        <td><span class="badge badge-category">${p.category}</span></td>
        <td>${p.supplier}</td>
        <td style="font-weight: 700; font-size: 1rem; color: ${isLowStock ? 'var(--danger)' : 'var(--text-dark)'};">
          ${p.quantity}
        </td>
        <td style="font-weight: 600;">${formatCurrency(p.price)}</td>
        <td>${p.reorderLevel} units</td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="editProduct('${p._id}')">✏️ Edit</button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct('${p._id}', '${p.productName.replace(/'/g, "\\'")}')">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Client-side search and filters
function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedStock = stockFilter.value;

  const filtered = allProducts.filter(p => {
    // Search matching
    const matchesSearch = !searchTerm || (
      (p.productName && p.productName.toLowerCase().includes(searchTerm)) ||
      (p.productCode && p.productCode.toLowerCase().includes(searchTerm)) ||
      (p.category && p.category.toLowerCase().includes(searchTerm)) ||
      (p.supplier && p.supplier.toLowerCase().includes(searchTerm))
    );

    // Category filter
    const matchesCategory = !selectedCategory || p.category === selectedCategory;

    // Stock filter
    let matchesStock = true;
    if (selectedStock === 'low') {
      matchesStock = p.quantity <= p.reorderLevel;
    } else if (selectedStock === 'normal') {
      matchesStock = p.quantity > p.reorderLevel;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  renderProducts(filtered);
}

// Modal control
function openModal(isEdit = false) {
  modal.classList.add('active');
  if (!isEdit) {
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    productIdInput.value = '';
    prodReorderInput.value = '10';
  } else {
    modalTitle.textContent = 'Edit Product Details';
  }
}

function closeModal() {
  modal.classList.remove('active');
  productForm.reset();
  productIdInput.value = '';
}

// Open Edit modal and prefill data
window.editProduct = async function(id) {
  try {
    const res = await apiRequest(`/products/${id}`);
    const p = res.data;
    if (!p) return;

    productIdInput.value = p._id;
    prodNameInput.value = p.productName;
    prodCodeInput.value = p.productCode;
    prodCategoryInput.value = p.category;
    
    // Ensure supplier is present in select or add dynamically
    let foundOption = Array.from(prodSupplierInput.options).some(o => o.value === p.supplier);
    if (!foundOption) {
      const opt = document.createElement('option');
      opt.value = p.supplier;
      opt.textContent = p.supplier;
      prodSupplierInput.appendChild(opt);
    }
    prodSupplierInput.value = p.supplier;

    prodQtyInput.value = p.quantity;
    prodPriceInput.value = p.price;
    prodReorderInput.value = p.reorderLevel;
    prodDescInput.value = p.description || '';

    openModal(true);
  } catch (err) {
    showToast(err.message || 'Error fetching product for edit', 'error');
  }
};

// Delete Product with confirmation
window.deleteProduct = async function(id, name) {
  if (!confirm(`Are you sure you want to delete product "${name}"?\nThis action cannot be undone.`)) {
    return;
  }

  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    showToast(`Product "${name}" deleted successfully`, 'success');
    fetchProducts();
  } catch (err) {
    showToast(err.message || 'Failed to delete product', 'error');
  }
};

// Form submit (Add or Update)
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = productIdInput.value;
  const payload = {
    productName: prodNameInput.value.trim(),
    productCode: prodCodeInput.value.trim().toUpperCase(),
    category: prodCategoryInput.value,
    supplier: prodSupplierInput.value,
    quantity: Number(prodQtyInput.value),
    price: Number(prodPriceInput.value),
    reorderLevel: Number(prodReorderInput.value),
    description: prodDescInput.value.trim()
  };

  // Validation
  if (!payload.productName || !payload.productCode || !payload.category || !payload.supplier) {
    showToast('Please fill all required fields', 'error');
    return;
  }
  if (payload.quantity < 0 || payload.price < 0 || payload.reorderLevel < 0) {
    showToast('Values cannot be negative', 'error');
    return;
  }

  try {
    if (id) {
      // Update
      await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Product updated successfully!', 'success');
    } else {
      // Create
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Product added successfully!', 'success');
    }

    closeModal();
    fetchProducts();
  } catch (err) {
    showToast(err.message || 'Operation failed', 'error');
  }
});

// Event listeners
openAddProductBtn.addEventListener('click', () => openModal(false));
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
stockFilter.addEventListener('change', applyFilters);

resetFilterBtn.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = '';
  stockFilter.value = 'all';
  applyFilters();
});

// Check URL params for quick filter (e.g. ?filter=lowStock)
document.addEventListener('DOMContentLoaded', async () => {
  await loadSuppliersForDropdown();
  await fetchProducts();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('filter') === 'lowStock') {
    stockFilter.value = 'low';
    applyFilters();
  }
});
