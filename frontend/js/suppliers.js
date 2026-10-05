let allSuppliers = [];

// DOM Elements
const suppliersTableBody = document.getElementById('suppliers-table-body');
const searchInput = document.getElementById('supplier-search-input');
const resetSearchBtn = document.getElementById('reset-supplier-search-btn');
const supplierCountSubtitle = document.getElementById('supplier-count-subtitle');

const modal = document.getElementById('supplier-modal');
const modalTitle = document.getElementById('supplier-modal-title');
const supplierForm = document.getElementById('supplier-form');
const openAddSupplierBtn = document.getElementById('open-add-supplier-btn');
const closeSupplierModalBtn = document.getElementById('close-supplier-modal-btn');
const cancelSupplierModalBtn = document.getElementById('cancel-supplier-modal-btn');

// Form input elements
const supplierIdInput = document.getElementById('supplier-id');
const suppNameInput = document.getElementById('supp-name');
const suppCompanyInput = document.getElementById('supp-company');
const suppEmailInput = document.getElementById('supp-email');
const suppPhoneInput = document.getElementById('supp-phone');
const suppAddressInput = document.getElementById('supp-address');

// Fetch suppliers from backend
async function fetchSuppliers() {
  try {
    const res = await apiRequest('/suppliers');
    allSuppliers = res.data || [];
    applySearch();
  } catch (err) {
    suppliersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Failed to load suppliers</h3>
          <p>${err.message}</p>
        </td>
      </tr>
    `;
    showToast('Failed to fetch suppliers', 'error');
  }
}

// Render suppliers list into table
function renderSuppliers(suppliers) {
  supplierCountSubtitle.textContent = `Showing ${suppliers.length} supplier(s)`;

  if (suppliers.length === 0) {
    suppliersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No suppliers found</h3>
          <p>No suppliers match your current search.</p>
        </td>
      </tr>
    `;
    return;
  }

  suppliersTableBody.innerHTML = suppliers.map(s => `
    <tr>
      <td><strong>${s.supplierName}</strong></td>
      <td><span class="badge badge-category">${s.companyName}</span></td>
      <td><a href="mailto:${s.email}" style="color: var(--primary); text-decoration: none;">${s.email}</a></td>
      <td>${s.phone}</td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">${s.address || 'N/A'}</td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="editSupplier('${s._id}')">✏️ Edit</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteSupplier('${s._id}', '${s.companyName.replace(/'/g, "\\'")}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Filter suppliers by search query
function applySearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderSuppliers(allSuppliers);
    return;
  }

  const filtered = allSuppliers.filter(s =>
    (s.supplierName && s.supplierName.toLowerCase().includes(query)) ||
    (s.companyName && s.companyName.toLowerCase().includes(query)) ||
    (s.email && s.email.toLowerCase().includes(query)) ||
    (s.phone && s.phone.toLowerCase().includes(query)) ||
    (s.address && s.address.toLowerCase().includes(query))
  );

  renderSuppliers(filtered);
}

// Modal control
function openModal(isEdit = false) {
  modal.classList.add('active');
  if (!isEdit) {
    modalTitle.textContent = 'Add New Supplier';
    supplierForm.reset();
    supplierIdInput.value = '';
  } else {
    modalTitle.textContent = 'Edit Supplier Details';
  }
}

function closeModal() {
  modal.classList.remove('active');
  supplierForm.reset();
  supplierIdInput.value = '';
}

// Edit supplier
window.editSupplier = async function(id) {
  try {
    const res = await apiRequest(`/suppliers/${id}`);
    const s = res.data;
    if (!s) return;

    supplierIdInput.value = s._id;
    suppNameInput.value = s.supplierName;
    suppCompanyInput.value = s.companyName;
    suppEmailInput.value = s.email;
    suppPhoneInput.value = s.phone;
    suppAddressInput.value = s.address || '';

    openModal(true);
  } catch (err) {
    showToast(err.message || 'Error fetching supplier details', 'error');
  }
};

// Delete supplier with confirmation
window.deleteSupplier = async function(id, companyName) {
  if (!confirm(`Are you sure you want to delete supplier "${companyName}"?\nThis might affect products linked to this supplier.`)) {
    return;
  }

  try {
    await apiRequest(`/suppliers/${id}`, { method: 'DELETE' });
    showToast(`Supplier "${companyName}" deleted successfully`, 'success');
    fetchSuppliers();
  } catch (err) {
    showToast(err.message || 'Failed to delete supplier', 'error');
  }
};

// Form submission (Add / Update)
supplierForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = supplierIdInput.value;
  const payload = {
    supplierName: suppNameInput.value.trim(),
    companyName: suppCompanyInput.value.trim(),
    email: suppEmailInput.value.trim(),
    phone: suppPhoneInput.value.trim(),
    address: suppAddressInput.value.trim()
  };

  // Basic email pattern check
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(payload.email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  try {
    if (id) {
      await apiRequest(`/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showToast('Supplier updated successfully!', 'success');
    } else {
      await apiRequest('/suppliers', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Supplier added successfully!', 'success');
    }

    closeModal();
    fetchSuppliers();
  } catch (err) {
    showToast(err.message || 'Operation failed', 'error');
  }
});

// Event listeners
openAddSupplierBtn.addEventListener('click', () => openModal(false));
closeSupplierModalBtn.addEventListener('click', closeModal);
cancelSupplierModalBtn.addEventListener('click', closeModal);

searchInput.addEventListener('input', applySearch);
resetSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  applySearch();
});

document.addEventListener('DOMContentLoaded', fetchSuppliers);
