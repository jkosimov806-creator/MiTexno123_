/* MI TEXNO — MAIN.JS */

const API_URL = 'https://script.google.com/macros/s/AKfycbzbu6V02zkph363958bJx7UPYw5fVQ7Vi7pKWMY6AMokV24a-HHw6AF6N2mjjl57IGJ/exec';

const SHEETS = [
  { name: 'Кондиционеры и обогреватели', category: 'climate',  icon: '❄️' },
  { name: 'Телевизоры',                  category: 'tv',       icon: '📺' },
  { name: 'Стиральная машина',           category: 'washing',  icon: '🫧' },
  { name: 'Холодильник',                 category: 'fridge',   icon: '🧊' },
  { name: 'Очистители, увлажнители воздуха', category: 'air', icon: '💨' },
  { name: 'Всё для дома',               category: 'home',     icon: '🏠' },
  { name: 'Пылесос и фен',              category: 'vacuum',   icon: '🌀' },
  { name: 'Гаджеты',                    category: 'gadgets',  icon: '📱' },
  { name: 'Мониторы и дисплеи',         category: 'monitors', icon: '🖥️' },
  { name: 'Камеры',                     category: 'cameras',  icon: '📷' },
];

let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('mi_texno_cart') || '[]');
let currentCategory = '';

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  buildCategoryUI();
  loadData();
  updateCartUI();
  animateStats();
});

/* HEADER */
function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => header.classList.toggle('header--scrolled', window.scrollY > 20));
}
function toggleMenu() {
  document.getElementById('nav').classList.toggle('open');
  document.getElementById('burger').classList.toggle('active');
}
document.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', () => {
  document.getElementById('nav').classList.remove('open');
  document.getElementById('burger').classList.remove('active');
}));

/* BUILD CATEGORY GRID */
function buildCategoryUI() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;
  grid.innerHTML = SHEETS.map(s => `
    <div class="cat-card" onclick="filterCatalog('${s.category}')">
      <div class="cat-card__icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <span class="cat-card__count" id="count-${s.category}">—</span>
    </div>
  `).join('');
}

/* LOAD FROM APPS SCRIPT */
async function loadData() {
  const bar = document.getElementById('loadingBar');
  bar.style.display = 'block';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('net');
    const json = await res.json();

    allProducts = [];
    Object.entries(json).forEach(([sheetName, rows]) => {
      const sheet = SHEETS.find(s => s.name.trim() === sheetName.trim());
      if (!sheet) return;
      allProducts.push(...parseRows(rows, sheet.category, sheet.name));
    });

    if (!allProducts.length) throw new Error('empty');

  } catch (e) {
    console.warn('Fallback to demo:', e);
    allProducts = demoProducts();
  }

  filteredProducts = [...allProducts];
  bar.style.display = 'none';
  renderProducts(filteredProducts);
  updateCounts();
}

/* PARSE ROWS FROM APPS SCRIPT */
function parseRows(rows, category, catName) {
  if (!rows || rows.length < 2) return [];

  // Строка 0 = заголовок листа, Строка 1 = заголовки колонок, Строки 2+ = данные
  // Но если строка 0 — это и есть заголовки (нет строки-заголовка листа), пробуем оба варианта
  let headerRow = 1;
  let dataStart = 2;

  // Проверяем: если строка 1 не содержит "наименование" — пробуем строку 0
  const row1 = rows[1] ? rows[1].map(h => String(h).toLowerCase()) : [];
  if (!row1.some(h => h.includes('наимен') || h.includes('назв') || h.includes('name'))) {
    headerRow = 0;
    dataStart = 1;
  }

  const headers = (rows[headerRow] || []).map(h => String(h).toLowerCase().trim());

  const col = (kws) => {
    for (const kw of kws) {
      const i = headers.findIndex(h => h.includes(kw));
      if (i !== -1) return i;
    }
    return -1;
  };

  const iName  = col(['наимен','назв','name','товар']) !== -1 ? col(['наимен','назв','name','товар']) : 0;
  const iQty   = col(['количество','qty','кол']);
  const iPrice = col(['цена','price','стоим']);
  const iOld   = col(['старая','old','скидка','было']);
  const iImg   = col(['фото','photo','image','картин']);
  const iDesc  = col(['описан','desc']);
  const iStock = col(['наличие','instock','stock']);

  const products = [];
  for (let i = dataStart; i < rows.length; i++) {
    const r = rows[i] || [];
    const name = String(r[iName] || '').trim();
    if (!name) continue;

    const qty   = parseInt(r[iQty])   || 0;
    const price = toNum(r[iPrice]);
    const old   = toNum(r[iOld]);
    const img   = iImg   !== -1 ? String(r[iImg]   || '') : '';
    const desc  = iDesc  !== -1 ? String(r[iDesc]  || '') : '';
    const instock = iStock !== -1
      ? (String(r[iStock]).trim() !== '0' && String(r[iStock]).trim().toLowerCase() !== 'нет')
      : qty > 0 || price === 0; // если нет qty — считаем в наличии

    products.push({ id: `${category}_${i}`, name, category, catName, price, old_price: old, image: img, desc, qty, instock });
  }
  return products;
}

function toNum(v) {
  if (v === undefined || v === null || v === '') return 0;
  return parseInt(String(v).replace(/[^\d]/g, '')) || 0;
}

/* DEMO PRODUCTS */
function demoProducts() {
  return [
    { id:'d1', name:'Кондиционер Xiaomi Mijia', category:'climate', catName:'Кондиционеры', price:45990, old_price:52000, image:'', desc:'Инвертор, Wi-Fi, 18000 BTU', instock:true },
    { id:'d2', name:'Кондиционер KFR-72LW/N1A1', category:'climate', catName:'Кондиционеры', price:89990, old_price:0, image:'', desc:'Стоячий, 30 кубовый', instock:true },
    { id:'d3', name:'Обогреватель Xiaomi Graphene', category:'climate', catName:'Кондиционеры', price:12990, old_price:15000, image:'', desc:'Умный обогреватель с Wi-Fi', instock:true },
    { id:'d4', name:'Телевизор Xiaomi TV A 55"', category:'tv', catName:'Телевизоры', price:34990, old_price:39990, image:'', desc:'4K UHD, Android TV', instock:true },
    { id:'d5', name:'Телевизор Redmi Smart TV 43"', category:'tv', catName:'Телевизоры', price:24990, old_price:0, image:'', desc:'4K, 60Hz, Dolby Audio', instock:true },
    { id:'d6', name:'Стиральная машина Xiaomi', category:'washing', catName:'Стиральная машина', price:38990, old_price:45000, image:'', desc:'8кг, 1200 об/мин, Wi-Fi', instock:true },
    { id:'d7', name:'Холодильник Xiaomi 500L', category:'fridge', catName:'Холодильник', price:79990, old_price:89990, image:'', desc:'No Frost, умный, 2-камерный', instock:true },
    { id:'d8', name:'Очиститель воздуха Mi 4 Pro', category:'air', catName:'Очистители', price:18990, old_price:0, image:'', desc:'HEPA, 500 м³/ч, PM2.5', instock:true },
    { id:'d9', name:'Пылесос Xiaomi Robot S20+', category:'vacuum', catName:'Пылесос', price:34990, old_price:39990, image:'', desc:'Лазерная навигация, 4000Pa', instock:true },
    { id:'d10', name:'Mi Smart Band 9', category:'gadgets', catName:'Гаджеты', price:4990, old_price:5990, image:'', desc:'AMOLED, SpO2, 21 день', instock:true },
    { id:'d11', name:'Redmi Buds 6 Active', category:'gadgets', catName:'Гаджеты', price:3990, old_price:0, image:'', desc:'ANC, BT 5.4, 30 часов', instock:true },
    { id:'d12', name:'Монитор Xiaomi 27" 4K', category:'monitors', catName:'Мониторы', price:29990, old_price:34990, image:'', desc:'4K IPS, 144Hz, HDR', instock:true },
  ];
}

/* RENDER */
function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('productsEmpty');

  if (!products.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = products.map((p, i) => `
    <div class="product-card" style="animation-delay:${Math.min(i,12)*0.04}s">
      <img class="product-card__img"
        src="${p.image || `https://via.placeholder.com/300x300/161616/ff6900?text=${encodeURIComponent(p.catName||'Mi')}`}"
        alt="${escHtml(p.name)}"
        onerror="this.src='https://via.placeholder.com/300x300/1e1e1e/ff6900?text=Mi'"
        loading="lazy"
      />
      <div class="product-card__body">
        <span class="product-card__cat">${escHtml(p.catName || p.category)}</span>
        <h3 class="product-card__name">${escHtml(p.name)}</h3>
        ${p.desc ? `<p class="product-card__desc">${escHtml(p.desc)}</p>` : ''}
        <div class="product-card__footer">
          <div>
            ${p.old_price ? `<span class="product-card__old-price">${fmt(p.old_price)} ₽</span>` : ''}
            ${p.price ? `<span class="product-card__price">${fmt(p.price)} ₽</span>`
                      : `<span class="product-card__no-price">Цена по запросу</span>`}
          </div>
          ${p.instock
            ? `<button class="product-card__btn" onclick='addToCart(${JSON.stringify({id:p.id,name:p.name,price:p.price,image:p.image,catName:p.catName})})'>В корзину</button>`
            : `<span style="font-size:0.8rem;color:var(--text-muted)">Нет в наличии</span>`}
        </div>
      </div>
    </div>
  `).join('');
}

function fmt(n) { return Number(n).toLocaleString('ru-RU'); }
function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* FILTER */
function filterCatalog(category) {
  currentCategory = category;
  const sheet = SHEETS.find(s => s.category === category);
  document.getElementById('productsTitle').textContent = sheet ? sheet.name : 'Все товары';
  document.getElementById('btnReset').style.display = category ? 'inline-flex' : 'none';
  document.getElementById('searchInput').value = '';
  filteredProducts = category ? allProducts.filter(p => p.category === category) : [...allProducts];
  renderProducts(filteredProducts);
  setTimeout(() => document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

/* SEARCH */
function searchProducts(q) {
  q = q.toLowerCase().trim();
  const base = currentCategory ? allProducts.filter(p => p.category === currentCategory) : allProducts;
  filteredProducts = q ? base.filter(p => p.name.toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q)) : [...base];
  renderProducts(filteredProducts);
}

/* COUNTS */
function updateCounts() {
  SHEETS.forEach(s => {
    const n = allProducts.filter(p => p.category === s.category).length;
    const el = document.getElementById('count-' + s.category);
    if (el) el.textContent = n ? n + ' товаров' : 'скоро';
  });
}

/* STATS ANIMATION */
function animateStats() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let cur = 0;
      const step = target / 100;
      const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.floor(cur).toLocaleString('ru-RU');
        if (cur >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat__num').forEach(el => observer.observe(el));
}

/* CART */
function addToCart(product) {
  const ex = cart.find(i => i.id === product.id);
  if (ex) ex.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart();
  updateCartUI();
  toast(`✅ ${product.name} добавлен в корзину`);
  if (!document.getElementById('cartSidebar').classList.contains('active')) toggleCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartUI();
}

function changeQty(id, d) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + d);
  if (item.qty === 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); }
}

function saveCart() { localStorage.setItem('mi_texno_cart', JSON.stringify(cart)); }

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const el = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    el.innerHTML = '<p class="cart-empty">🛒 Корзина пуста</p>';
    footer.style.display = 'none';
    return;
  }
  const total = cart.reduce((s, i) => s + (i.price||0) * i.qty, 0);
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image || 'https://via.placeholder.com/52x52/1e1e1e/ff6900?text=Mi'}" alt="${escHtml(item.name)}"
           onerror="this.src='https://via.placeholder.com/52x52/1e1e1e/ff6900?text=Mi'"/>
      <div class="cart-item__info">
        <div class="cart-item__name">${escHtml(item.name)}</div>
        <div class="cart-item__price">${item.price ? fmt(item.price * item.qty)+' ₽' : 'По запросу'}</div>
        <div class="cart-item__qty">
          <button onclick="changeQty('${item.id}',-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}',+1)">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `).join('');
  document.getElementById('cartTotal').textContent = total ? fmt(total)+' ₽' : 'По запросу';
  footer.style.display = 'flex';
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
  document.body.style.overflow = document.getElementById('cartSidebar').classList.contains('active') ? 'hidden' : '';
}

function toast(msg) {
  const old = document.getElementById('miToast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'miToast';
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e1e1e;border:1px solid rgba(255,105,0,0.4);color:#f5f5f5;padding:12px 24px;border-radius:50px;font-family:Nunito,sans-serif;font-size:0.9rem;z-index:300;animation:fadeInUp 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);white-space:nowrap;';
  t.innerHTML = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
