// ============================================================
// GUN GOBAR — Data Layer v2
// No cart | Amazon links | Multi-image | Categories | Inquiries
// ============================================================

const DB_KEY         = 'gungobar_products';
const CATS_KEY       = 'gungobar_categories';
const INQUIRIES_KEY  = 'gungobar_inquiries';

// ── Default Categories ─────────────────────────────────────
const DEFAULT_CATEGORIES = ['Diyas', 'Incense', 'Pots', 'Soaps', 'Art'];

// ── Default Products ───────────────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    id: 'gg001',
    name: 'Handcrafted Cow Dung Diya',
    price: 49, originalPrice: 79,
    category: 'Diyas',
    description: 'Beautifully hand-shaped earthen diyas made from pure cow dung and clay. Eco-friendly, burns longer than regular diyas and fills the air with a sacred, natural fragrance. Set of 6.',
    emoji: '🪔', images: [],
    featured: true, amazonLink: '#',
    tags: ['diya', 'festival', 'eco', 'diwali']
  },
  {
    id: 'gg002',
    name: 'Natural Cow Dung Incense Sticks',
    price: 89, originalPrice: 120,
    category: 'Incense',
    description: 'Pure cow dung agarbatti blended with sandalwood, tulsi & neem. Chemical-free, long-lasting fragrance. Perfect for daily puja and meditation. Pack of 20 sticks.',
    emoji: '🌿', images: [],
    featured: true, amazonLink: '#',
    tags: ['incense', 'agarbatti', 'puja', 'sandalwood']
  },
  {
    id: 'gg003',
    name: 'Cow Dung Planting Pot (Set of 3)',
    price: 199, originalPrice: 280,
    category: 'Pots',
    description: 'Biodegradable cow dung pots that nourish your plants as they decompose. Simply plant directly into soil — the pot becomes natural fertilizer. Set of 3, various sizes.',
    emoji: '🌱', images: [],
    featured: true, amazonLink: '#',
    tags: ['pot', 'garden', 'plant', 'biodegradable']
  },
  {
    id: 'gg004',
    name: 'Herbal Cow Dung Soap',
    price: 75, originalPrice: null,
    category: 'Soaps',
    description: 'Handmade cold-process soap with cow dung, turmeric, neem oil and rose water. Deeply purifying, anti-bacterial and gentle on skin.',
    emoji: '🧼', images: [],
    featured: false, amazonLink: '#',
    tags: ['soap', 'skin', 'herbal', 'turmeric', 'neem']
  },
  {
    id: 'gg005',
    name: 'Ganesh Sculpture (Cow Dung)',
    price: 349, originalPrice: 450,
    category: 'Art',
    description: 'Hand-sculpted Ganesha idol made from pure cow dung and natural clay. Each piece is unique, lovingly crafted by rural artisans. Fully eco-friendly and biodegradable.',
    emoji: '🐘', images: [],
    featured: true, amazonLink: '#',
    tags: ['ganesh', 'sculpture', 'idol', 'art', 'festival']
  },
  {
    id: 'gg006',
    name: 'Cow Dung Dhoop Cones',
    price: 65, originalPrice: 90,
    category: 'Incense',
    description: 'Pyramid-shaped dhoop cones made from cow dung, camphor, and natural herbs. Purifies the air, wards off insects and creates a calming atmosphere. Pack of 12.',
    emoji: '🔺', images: [],
    featured: false, amazonLink: '#',
    tags: ['dhoop', 'incense', 'camphor', 'puja']
  },
  {
    id: 'gg007',
    name: 'Decorative Wall Plate (Gobar Art)',
    price: 499, originalPrice: 650,
    category: 'Art',
    description: 'Intricately hand-painted decorative plate crafted from cow dung paste and clay. Traditional Indian motifs painted with natural colours. A stunning piece of sustainable wall art.',
    emoji: '🎨', images: [],
    featured: false, amazonLink: '#',
    tags: ['art', 'decor', 'wall', 'handpainted', 'ethnic']
  },
  {
    id: 'gg008',
    name: 'Cow Dung Mosquito Repellent Coils',
    price: 55, originalPrice: null,
    category: 'Incense',
    description: 'Chemical-free mosquito repellent coils made from cow dung, neem leaves and citronella. Safe for children & elders. Burns for 8+ hours. Pack of 10 coils.',
    emoji: '🌀', images: [],
    featured: false, amazonLink: '#',
    tags: ['mosquito', 'repellent', 'neem', 'safe']
  },
  {
    id: 'gg009',
    name: 'Mini Diya Gift Box (Festival Pack)',
    price: 299, originalPrice: 399,
    category: 'Diyas',
    description: 'Curated Diwali gift box with 12 hand-painted cow dung diyas in assorted floral designs. Packed in a beautiful eco-kraft box. Makes a perfect festive gift.',
    emoji: '🎁', images: [],
    featured: false, amazonLink: '#',
    tags: ['gift', 'diwali', 'diya', 'festive', 'pack']
  },
  {
    id: 'gg010',
    name: 'Cow Dung Organic Fertilizer (500g)',
    price: 120, originalPrice: null,
    category: 'Pots',
    description: 'Premium dried and processed cow dung vermicompost for your garden. Rich in nitrogen, phosphorus and potassium. Boosts plant growth naturally. Odour-free after processing.',
    emoji: '🌾', images: [],
    featured: false, amazonLink: '#',
    tags: ['fertilizer', 'garden', 'organic', 'compost']
  }
];

// ── Init ───────────────────────────────────────────────────
function initDB() {
  if (!localStorage.getItem(DB_KEY))   localStorage.setItem(DB_KEY,   JSON.stringify(DEFAULT_PRODUCTS));
  if (!localStorage.getItem(CATS_KEY)) localStorage.setItem(CATS_KEY, JSON.stringify(DEFAULT_CATEGORIES));
}

// ── Products ───────────────────────────────────────────────
function getAllProducts() {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}
function getProductById(id) { return getAllProducts().find(p => p.id === id) || null; }
function getFeaturedProducts() { return getAllProducts().filter(p => p.featured); }

function getProductsByCategory(cat) {
  if (!cat || cat === 'All') return getAllProducts();
  return getAllProducts().filter(p => p.category === cat);
}

function searchProducts(q) {
  const query = q.toLowerCase();
  return getAllProducts().filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    (p.tags || []).some(t => t.includes(query)) ||
    p.category.toLowerCase().includes(query)
  );
}

function sortProducts(products, sort) {
  const arr = [...products];
  if (sort === 'low')  return arr.sort((a, b) => a.price - b.price);
  if (sort === 'high') return arr.sort((a, b) => b.price - a.price);
  return arr;
}

function addProduct(product) {
  const products = getAllProducts();
  const newProduct = {
    ...product,
    id: 'gg' + Date.now(),
    price: parseFloat(product.price) || 0,
    originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
    featured: product.featured || false,
    images: product.images || [],
    amazonLink: product.amazonLink || '#',
    tags: typeof product.tags === 'string'
      ? product.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : (product.tags || [])
  };
  products.push(newProduct);
  localStorage.setItem(DB_KEY, JSON.stringify(products));
  return newProduct;
}

function updateProduct(id, updates) {
  const products = getAllProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  if (updates.tags && typeof updates.tags === 'string') {
    updates.tags = updates.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  }
  products[idx] = { ...products[idx], ...updates };
  localStorage.setItem(DB_KEY, JSON.stringify(products));
  return true;
}

function deleteProduct(id) {
  localStorage.setItem(DB_KEY, JSON.stringify(getAllProducts().filter(p => p.id !== id)));
}

function resetProducts() { localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_PRODUCTS)); }

// ── Categories ─────────────────────────────────────────────
function getCategories() {
  initDB();
  return JSON.parse(localStorage.getItem(CATS_KEY)) || DEFAULT_CATEGORIES;
}

function addCategory(name) {
  const cats = getCategories();
  const trimmed = name.trim();
  if (!trimmed || cats.includes(trimmed)) return false;
  cats.push(trimmed);
  localStorage.setItem(CATS_KEY, JSON.stringify(cats));
  return true;
}

function deleteCategory(name) {
  const cats = getCategories().filter(c => c !== name);
  localStorage.setItem(CATS_KEY, JSON.stringify(cats));
}

function getCategoryOptions() { return ['All', ...getCategories()]; }

// ── Inquiries ──────────────────────────────────────────────
function getInquiries() {
  return JSON.parse(localStorage.getItem(INQUIRIES_KEY)) || [];
}

function addInquiry(data) {
  const inquiries = getInquiries();
  const entry = { ...data, id: 'inq' + Date.now(), submittedAt: new Date().toISOString() };
  inquiries.unshift(entry);
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  return entry;
}

function deleteInquiry(id) {
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(getInquiries().filter(i => i.id !== id)));
}

function clearInquiries() { localStorage.removeItem(INQUIRIES_KEY); }

// ── Image compression utility ──────────────────────────────
function compressImage(file, maxWidth = 700, quality = 0.78) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Admin Auth ─────────────────────────────────────────────
const ADMIN_PASSWORD = 'gobar@admin';
function checkAdmin(pwd)    { return pwd === ADMIN_PASSWORD; }
function isAdminLoggedIn()  { return sessionStorage.getItem('gg_admin') === '1'; }
function loginAdmin()       { sessionStorage.setItem('gg_admin', '1'); }
function logoutAdmin()      { sessionStorage.removeItem('gg_admin'); }
