// ============================================================
// GUN GOBAR — Admin Panel JS v2
// Categories | Multi-image | Amazon link | Inquiries | No stock
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  isAdminLoggedIn() ? showDashboard() : showLogin();
});

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display   = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display   = 'block';
  renderStats();
  renderProductTable();
  renderCategoryManager();
  renderCategoryDropdowns();
  renderInquiries();
}

function handleLogin(e) {
  e.preventDefault();
  const pwd = document.getElementById('adminPassword').value;
  const err = document.getElementById('loginError');
  if (checkAdmin(pwd)) { loginAdmin(); showDashboard(); showToast('Welcome back, Admin! 🌿'); }
  else { err.textContent = 'Incorrect password. Hint: gobar@admin'; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); }
}

function handleLogout() { logoutAdmin(); showLogin(); showToast('Logged out.', 'info'); }

// ── Stats ──────────────────────────────────────────────────
function renderStats() {
  const products = getAllProducts();
  document.getElementById('statTotal').textContent       = products.length;
  document.getElementById('statFeatured').textContent    = products.filter(p => p.featured).length;
  document.getElementById('statInquiries').textContent   = getInquiries().length;
  document.getElementById('statCategories').textContent  = getCategories().length;
}

// ── Image Upload ───────────────────────────────────────────
let addImages    = [];
let editImages   = [];

function initImageUpload(containerId, previewId, imagesArray, maxImgs = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.addEventListener('click', () => {
    if (imagesArray.length >= maxImgs) { showToast(`Max ${maxImgs} images allowed.`, 'info'); return; }
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
    input.onchange = async e => {
      const files = Array.from(e.target.files).slice(0, maxImgs - imagesArray.length);
      for (const file of files) {
        const compressed = await compressImage(file);
        imagesArray.push(compressed);
      }
      renderImagePreview(previewId, imagesArray);
    };
    input.click();
  });
}

function renderImagePreview(previewId, imagesArray) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.innerHTML = imagesArray.map((src, i) => `
    <div class="img-thumb-wrap">
      <img src="${src}" class="img-thumb" alt="Product image ${i+1}" />
      <button class="img-thumb-del" onclick="removeUploadedImg('${previewId}',${i})" title="Remove">✕</button>
    </div>`).join('') +
    (imagesArray.length < 5
      ? `<div class="img-add-slot" id="${previewId.replace('Preview','Upload')}">
           <span>+</span><small>Add Photo</small>
         </div>` : '');
  // Re-attach click for add slot
  const slot = preview.querySelector('.img-add-slot');
  if (slot) {
    slot.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
      input.onchange = async e => {
        const files = Array.from(e.target.files).slice(0, 5 - imagesArray.length);
        for (const file of files) { imagesArray.push(await compressImage(file)); }
        renderImagePreview(previewId, imagesArray);
      };
      input.click();
    };
  }
}

function removeUploadedImg(previewId, idx) {
  const arr = previewId.includes('edit') ? editImages : addImages;
  arr.splice(idx, 1);
  renderImagePreview(previewId, arr);
}

// ── Add Product ────────────────────────────────────────────
function handleAddProduct(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  data.featured = form.querySelector('[name="featured"]').checked;
  data.images   = [...addImages];
  const product = addProduct(data);
  showToast(`"${product.name}" added! 🌿`);
  form.reset();
  addImages = [];
  renderImagePreview('addPreview', addImages);
  renderStats();
  renderProductTable();
  renderCategoryDropdowns();
  document.getElementById('productTableSection')?.scrollIntoView({ behavior: 'smooth' });
}

// ── Edit Product ───────────────────────────────────────────
let editingId = null;

function openEditForm(id) {
  const p = getProductById(id);
  if (!p) return;
  editingId = id;
  editImages = [...(p.images || [])];

  const fields = ['name', 'price', 'originalPrice', 'category', 'emoji', 'description', 'tags', 'amazonLink'];
  fields.forEach(f => {
    const el = document.getElementById('edit_' + f);
    if (el) el.value = f === 'tags' ? (p.tags || []).join(', ') : (p[f] ?? '');
  });
  document.getElementById('edit_featured').checked = !!p.featured;
  renderImagePreview('editPreview', editImages);
  populateCategoryDropdown('edit_category', p.category);

  document.getElementById('editModal').classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  document.getElementById('editModal')?.classList.remove('modal-open');
  document.body.style.overflow = '';
  editingId = null;
}

function handleEditProduct(e) {
  e.preventDefault();
  if (!editingId) return;
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  data.featured   = form.querySelector('[name="featured"]').checked;
  data.images     = [...editImages];
  updateProduct(editingId, data);
  showToast('Product updated! ✅');
  closeEditModal();
  renderStats();
  renderProductTable();
}

// ── Delete Product ─────────────────────────────────────────
function confirmDelete(id) {
  const p = getProductById(id);
  if (!p) return;
  if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
    deleteProduct(id);
    showToast(`"${p.name}" deleted.`, 'info');
    renderStats();
    renderProductTable();
  }
}

// ── Product Table ──────────────────────────────────────────
function renderProductTable() {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;
  const products = getAllProducts();
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">No products yet. Add one above!</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => {
    const thumb = (p.images && p.images.length > 0)
      ? `<img src="${p.images[0]}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;" />`
      : `<span style="font-size:2rem;">${p.emoji || '🪴'}</span>`;
    return `<tr id="row-${p.id}">
      <td>${thumb}</td>
      <td><strong>${p.name}</strong></td>
      <td>${p.category}</td>
      <td>₹${p.price}${p.originalPrice ? ` <s style="color:var(--text-muted);font-size:.82em;">₹${p.originalPrice}</s>` : ''}</td>
      <td>${p.featured ? '<span class="tag">⭐ Featured</span>' : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td class="action-btns">
        <button class="btn-edit" onclick="openEditForm('${p.id}')">✏️ Edit</button>
        <button class="btn-delete" onclick="confirmDelete('${p.id}')">🗑️ Delete</button>
      </td>
    </tr>`;
  }).join('');
}

// ── Category Manager ───────────────────────────────────────
function renderCategoryManager() {
  const list = document.getElementById('categoryList');
  if (!list) return;
  const cats = getCategories();
  list.innerHTML = cats.map(c => `
    <div class="cat-pill">
      <span>${c}</span>
      <button onclick="handleDeleteCategory('${c}')" title="Delete category">✕</button>
    </div>`).join('');
}

function handleAddCategory(e) {
  e.preventDefault();
  const input = document.getElementById('newCategoryInput');
  const name  = input.value.trim();
  if (!name) return;
  if (addCategory(name)) {
    showToast(`Category "${name}" added! ✅`);
    input.value = '';
    renderCategoryManager();
    renderCategoryDropdowns();
  } else {
    showToast('Category already exists.', 'info');
  }
}

function handleDeleteCategory(name) {
  if (confirm(`Delete category "${name}"? Products in this category won't be affected.`)) {
    deleteCategory(name);
    showToast(`"${name}" removed.`, 'info');
    renderCategoryManager();
    renderCategoryDropdowns();
  }
}

function renderCategoryDropdowns() {
  populateCategoryDropdown('add_category', null);
  if (editingId) {
    const p = getProductById(editingId);
    populateCategoryDropdown('edit_category', p?.category);
  }
}

function populateCategoryDropdown(selectId, selectedValue) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const cats = getCategories();
  sel.innerHTML = '<option value="">Select category…</option>' +
    cats.map(c => `<option value="${c}" ${c === selectedValue ? 'selected' : ''}>${c}</option>`).join('');
}

// ── Inquiries ──────────────────────────────────────────────
function renderInquiries() {
  const container = document.getElementById('inquiryList');
  if (!container) return;
  const inquiries = getInquiries();
  renderStats();
  if (!inquiries.length) {
    container.innerHTML = `<div class="empty-state" style="padding:3rem 2rem;">
      <div class="empty-icon">📭</div>
      <h3>No inquiries yet</h3>
      <p>Bulk order submissions will appear here.</p>
    </div>`;
    return;
  }
  container.innerHTML = inquiries.map(inq => `
    <div class="inquiry-card" id="inq-${inq.id}">
      <div class="inquiry-header">
        <div>
          <strong>${inq.name}</strong>
          <span class="inquiry-date">${new Date(inq.submittedAt).toLocaleString('en-IN')}</span>
        </div>
        <button class="btn-delete" onclick="handleDeleteInquiry('${inq.id}')">🗑️ Delete</button>
      </div>
      <div class="inquiry-grid">
        <div><span class="inq-label">📧 Email</span><span>${inq.email}</span></div>
        <div><span class="inq-label">📱 Phone</span><span>${inq.phone}</span></div>
        <div><span class="inq-label">📦 Product</span><span>${inq.product}</span></div>
        <div><span class="inq-label">🔢 Quantity</span><span>${inq.quantity}</span></div>
      </div>
      ${inq.message ? `<div class="inq-message"><span class="inq-label">💬 Message</span><p>${inq.message}</p></div>` : ''}
    </div>`).join('');
}

function handleDeleteInquiry(id) {
  if (confirm('Delete this inquiry?')) {
    deleteInquiry(id);
    showToast('Inquiry deleted.', 'info');
    renderInquiries();
  }
}

function handleClearInquiries() {
  if (confirm('Clear ALL inquiries? This cannot be undone.')) {
    clearInquiries();
    showToast('All inquiries cleared.', 'info');
    renderInquiries();
  }
}

// ── Reset to defaults ──────────────────────────────────────
function handleReset() {
  if (confirm('Reset all products to default data? Your custom products will be lost.')) {
    resetProducts();
    addImages = [];
    renderImagePreview('addPreview', addImages);
    showToast('Products reset to defaults 🌿');
    renderStats();
    renderProductTable();
  }
}

// Close edit modal on backdrop
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('editModal')?.addEventListener('click', e => {
    if (e.target.id === 'editModal') closeEditModal();
  });
});
