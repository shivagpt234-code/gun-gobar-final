// ============================================================
// GUN GOBAR — Products Page JS v2
// Sort | Amazon link | Image carousel | No cart
// ============================================================

let currentCategory = 'All';
let currentSearch   = '';
let currentSort     = 'default';

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryTabs();
  renderProductGrid();

  document.getElementById('searchInput')?.addEventListener('input', e => {
    currentSearch = e.target.value.trim();
    renderProductGrid();
  });

  document.getElementById('sortSelect')?.addEventListener('change', e => {
    currentSort = e.target.value;
    renderProductGrid();
  });
});

// ── Category Tabs ──────────────────────────────────────────
function renderCategoryTabs() {
  const container = document.getElementById('categoryTabs');
  if (!container) return;
  container.innerHTML = getCategoryOptions().map(cat => `
    <button class="cat-tab ${cat === currentCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">
      ${cat}
    </button>`).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  currentSearch = '';
  const si = document.getElementById('searchInput');
  if (si) si.value = '';
  renderCategoryTabs();
  renderProductGrid();
}

// ── Product Grid ───────────────────────────────────────────
function renderProductGrid() {
  const container = document.getElementById('productGrid');
  if (!container) return;

  let products = currentSearch
    ? searchProducts(currentSearch)
    : getProductsByCategory(currentCategory);

  products = sortProducts(products, currentSort);

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌾</div>
        <h3>No products found</h3>
        <p>Try a different search or category.</p>
      </div>`;
    return;
  }
  container.innerHTML = products.map(p => productCard(p)).join('');
}

function productCard(p) {
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  const thumb = (p.images && p.images.length > 0) ? p.images[0] : null;
  return `
    <div class="product-card" onclick="openModal('${p.id}')">
      <div class="product-img">
        ${thumb
          ? `<img src="${thumb}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" />`
          : `<span class="product-emoji">${p.emoji || '🪴'}</span>`}
        ${discount ? `<span class="badge-discount">-${discount}%</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price">
          <span class="price-current">₹${p.price}</span>
          ${p.originalPrice ? `<span class="price-original">₹${p.originalPrice}</span>` : ''}
        </div>
        <a class="btn-amazon" href="${p.amazonLink || '#'}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.42 14.58c-.28.2-.68.1-.92-.16-.52-.6-1.06-1.08-1.58-1.48-1.02 1.04-2.1 1.74-3.28 2.08-1.62.46-3.32.22-4.64-.66-1.54-1.02-2.36-2.72-2.2-4.52.14-1.6.98-3 2.3-3.9 1.3-.88 3-.98 4.54-.42 1.04.38 1.96 1.1 2.62 2.06l.04.06-.82.54c-.52-.74-1.26-1.28-2.08-1.56-1.1-.4-2.36-.34-3.3.26-.94.6-1.58 1.66-1.68 2.84-.12 1.34.46 2.62 1.6 3.36.9.6 2.14.76 3.36.4.88-.26 1.72-.78 2.54-1.58-.44-.46-.88-.96-1.24-1.44-.26-.34-.14-.82.22-.98.26-.12.56-.04.72.18.42.58.9 1.1 1.4 1.6.44-.52.82-1.08 1.12-1.7.18-.38.62-.52.96-.32.34.2.46.64.28 1-.36.72-.8 1.38-1.3 1.98.5.42 1 .88 1.48 1.44.24.28.22.7-.16.92zm3.44 2.18c-2.22 1.62-5.44 2.48-8.22 2.48-3.88 0-7.38-1.44-10.02-3.82-.2-.18-.02-.44.24-.3 2.86 1.66 6.38 2.66 10.02 2.66 2.46 0 5.16-.5 7.64-1.56.38-.16.7.24.34.54zm.96-1.08c-.28-.36-1.86-.18-2.58-.08-.22.02-.26-.16-.06-.3 1.26-.88 3.34-.62 3.58-.34.24.3-.06 2.38-1.24 3.36-.18.16-.36.08-.28-.12.26-.66.86-2.16.58-2.52z"/></svg>
          Order on Amazon
        </a>
      </div>
    </div>`;
}

// ── Modal ──────────────────────────────────────────────────
let modalImgIndex = 0;
let modalImages   = [];

function openModal(id) {
  const p = getProductById(id);
  if (!p) return;
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  modalImages   = (p.images && p.images.length > 0) ? p.images : [];
  modalImgIndex = 0;

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-product">
      <div class="modal-img-area">
        <div class="modal-carousel" id="modalCarousel">
          ${modalImages.length > 0
            ? `<img id="carouselImg" src="${modalImages[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-xl) 0 0 var(--radius-xl);" />`
            : `<span class="modal-emoji">${p.emoji || '🪴'}</span>`}
        </div>
        ${modalImages.length > 1 ? `
        <div class="carousel-controls">
          <button class="carousel-btn" onclick="changeModalImg(-1)">‹</button>
          <div class="carousel-dots" id="carouselDots">
            ${modalImages.map((_, i) => `<span class="dot ${i===0?'active':''}" onclick="goModalImg(${i})"></span>`).join('')}
          </div>
          <button class="carousel-btn" onclick="changeModalImg(1)">›</button>
        </div>` : ''}
      </div>
      <div class="modal-details">
        <span class="product-cat">${p.category}</span>
        <h2 class="modal-name">${p.name}</h2>
        <div class="modal-price">
          <span class="price-current large">₹${p.price}</span>
          ${p.originalPrice ? `<span class="price-original">₹${p.originalPrice}</span>` : ''}
          ${discount ? `<span class="badge-discount">-${discount}%</span>` : ''}
        </div>
        <p class="modal-desc">${p.description}</p>
        <div class="modal-tags">
          ${(p.tags||[]).map(t => `<span class="tag">#${t}</span>`).join('')}
        </div>
        <a class="btn-amazon large" href="${p.amazonLink || '#'}" target="_blank" rel="noopener">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.42 14.58c-.28.2-.68.1-.92-.16-.52-.6-1.06-1.08-1.58-1.48-1.02 1.04-2.1 1.74-3.28 2.08-1.62.46-3.32.22-4.64-.66-1.54-1.02-2.36-2.72-2.2-4.52.14-1.6.98-3 2.3-3.9 1.3-.88 3-.98 4.54-.42 1.04.38 1.96 1.1 2.62 2.06l.04.06-.82.54c-.52-.74-1.26-1.28-2.08-1.56-1.1-.4-2.36-.34-3.3.26-.94.6-1.58 1.66-1.68 2.84-.12 1.34.46 2.62 1.6 3.36.9.6 2.14.76 3.36.4.88-.26 1.72-.78 2.54-1.58-.44-.46-.88-.96-1.24-1.44-.26-.34-.14-.82.22-.98.26-.12.56-.04.72.18.42.58.9 1.1 1.4 1.6.44-.52.82-1.08 1.12-1.7.18-.38.62-.52.96-.32.34.2.46.64.28 1-.36.72-.8 1.38-1.3 1.98.5.42 1 .88 1.48 1.44.24.28.22.7-.16.92zm3.44 2.18c-2.22 1.62-5.44 2.48-8.22 2.48-3.88 0-7.38-1.44-10.02-3.82-.2-.18-.02-.44.24-.3 2.86 1.66 6.38 2.66 10.02 2.66 2.46 0 5.16-.5 7.64-1.56.38-.16.7.24.34.54zm.96-1.08c-.28-.36-1.86-.18-2.58-.08-.22.02-.26-.16-.06-.3 1.26-.88 3.34-.62 3.58-.34.24.3-.06 2.38-1.24 3.36-.18.16-.36.08-.28-.12.26-.66.86-2.16.58-2.52z"/></svg>
          Order on Amazon
        </a>
        <a href="bulk-orders.html" class="btn-bulk">📦 Request Bulk Order</a>
      </div>
    </div>`;

  document.getElementById('productModal').classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function changeModalImg(dir) {
  if (!modalImages.length) return;
  modalImgIndex = (modalImgIndex + dir + modalImages.length) % modalImages.length;
  goModalImg(modalImgIndex);
}

function goModalImg(idx) {
  modalImgIndex = idx;
  const img = document.getElementById('carouselImg');
  if (img) { img.style.opacity = '0'; setTimeout(() => { img.src = modalImages[idx]; img.style.opacity = '1'; }, 150); }
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function closeModal() {
  document.getElementById('productModal')?.classList.remove('modal-open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('productModal')?.addEventListener('click', e => { if (e.target.id === 'productModal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
