/* =============================================
   MI TEXNO — MAIN JS
   Google Sheets интеграция + корзина
   ============================================= */

// ============================================================
//  НАСТРОЙКИ — GOOGLE ТАБЛИЦА Mi Texno
// ============================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzbu6V02zkph363958bJx7UPYw5fVQ7Vi7pKWMY6AMokV24a-HHw6AF6N2mjjl57IGJ/exec';

// Листы таблицы и их соответствие категориям сайта
// gid — номер листа (0 = первый лист, остальные смотри в URL при открытии листа)
const SHEETS = [
  { gid: '0',          name: 'Кондиционеры и обогреватели', category: 'climate',   icon: '❄️' },
  { gid: '1928893186', name: 'Телевизоры',                  category: 'tv',        icon: '📺' },
  { gid: '889425737',  name: 'Стиральная машина',           category: 'washing',   icon: '🫧' },
  { gid: '1259960612', name: 'Холодильник',                 category: 'fridge',    icon: '🧊' },
  { gid: '1654071551', name: 'Очистители, увлажнители',     category: 'air',       icon: '💨' },
  { gid: '2108699428', name: 'Всё для дома',                category: 'home',      icon: '🏠' },
  { gid: '547820568',  name: 'Пылесос и фен',               category: 'vacuum',    icon: '🌀' },
  { gid: '2016948510', name: 'Гаджеты',                     category: 'gadgets',   icon: '📱' },
  { gid: '1744526773', name: 'Мониторы и дисплеи',          category: 'monitors',  icon: '🖥️' },
  { gid: '963855809',  name: 'Камеры',                      category: 'cameras',   icon: '📷' },
];

// ============================================================
//  СТРУКТУРА ТВОЕЙ ТАБЛИЦЫ:
//  Строка 1: название категории (заголовок листа)
//  Строка 2: наименование | количество | цена | старая_цена | фото | описание
//  Строки 3+: данные товаров
//
//  Колонки A и B уже есть (наименование, количество).
//  Добавь C=цена, D=старая_цена, E=фото, F=описание — опционально.
// ============================================================

// ============================================================
//  ГЛОБАЛЬНЫЕ ДАННЫЕ
// ============================================================
let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('mi_texno_cart') || '[]');
let currentCategory = '';

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  buildCategoryUI();
  loadAllSheets();
  updateCartUI();
  animateStats();
});

// ============================================================
//  HEADER — скролл + бургер
// ============================================================
function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 20);
  });
}

function toggleMenu() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  nav.classList.toggle('open');
  burger.classList.toggle('active');
}

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('nav').classList.remove('open');
    document.getElementById('burger').classList.remove('active');
  });
});

// ============================================================
//  СТРОИМ КАТЕГОРИИ ИЗ SHEETS[]
// ============================================================
function buildCategoryUI() {
  const grid = document.querySelector('.cat-grid');
  if (!grid) return;
  grid.innerHTML = SHEETS.map(s => `
    <div class="cat-card" onclick="filterCatalog('${s.category}')">
      <div class="cat-card__icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <span class="cat-card__count" id="count-${s.category}">—</span>
    </div>
  `).join('');
}

// ============================================================
//  ЗАГРУЗКА ДАННЫХ ЧЕРЕЗ APPS SCRIPT API
// ============================================================
async function loadAllSheets() {
  const loading = document.getElementById('loadingBar');
  loading.style.display = 'block';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Ошибка сети');
    const json = await res.json();

    allProducts = [];

    // json — объект вида { "Название листа": [[строка1], [строка2], ...] }
    Object.entries(json).forEach(([sheetName, rows]) => {
      const sheet = SHEETS.find(s => s.name === sheetName);
      if (!sheet) return; // пропускаем неизвестные листы
      const products = parseRowsToProducts(rows, sheet.category, sheetName);
      allProducts.push(...products);
    });

    if (!allProducts.length) throw new Error('Нет товаров');

  } catch (err) {
    console.warn('API недоступен, показываем демо:', err);
    allProducts = getDemoProducts();
  }

  filteredProducts = [...allProducts];
  loading.style.display = 'none';
  renderProducts(filteredProducts);
  updateCategoryCounts();
}

// ============================================================
//  ПАРСИНГ СТРОК ИЗ APPS SCRIPT (массив массивов)
//  Строка 0: название категории
//  Строка 1: заголовки колонок
//  Строки 2+: данные
// ============================================================
function parseRowsToProducts(rows, category, catName) {
  if (!rows || rows.length < 3) return [];

  // Строка 1 — заголовки
  const headers = rows[1].map(h => String(h).toLowerCase().trim());

  const idx = {
    name:      findCol(headers, ['наименование','название','name','товар']),
    qty:       findCol(headers, ['количество','qty','кол']),
    price:     findCol(headers, ['цена','price','стоимость']),
    old_price: findCol(headers, ['старая','old','скидка','было']),
    image:     findCol(headers, ['фото','photo','image','картинка']),
    desc:      findCol(headers, ['описание','desc','description']),
    instock:   findCol(headers, ['наличие','instock','stock']),
  };

  // Fallback: нет заголовков — A=наименование, B=количество, C=цена
  if (idx.name === -1) { idx.name = 0; idx.qty = 1; idx.price = 2; }

  const products = [];
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row[idx.name] || '').trim();
    if (!name) continue;

    const qty       = parseInt(row[idx.qty])       || 0;
    const price     = parsePrice(String(row[idx.price]     || ''));
    const old_price = parsePrice(String(row[idx.old_price] || ''));
    const image     = idx.image    !== -1 ? String(row[idx.image]    || '') : '';
    const desc      = idx.desc     !== -1 ? String(row[idx.desc]     || '') : '';
    const instock   = idx.instock  !== -1
      ? (String(row[idx.instock]).trim() !== '0' && String(row[idx.instock]).trim().toLowerCase() !== 'нет')
      : qty > 0;

    products.push({ id: `${category}_${i}`, name, category, catName, price, old_price, image, desc, qty, instock });
  }
  return products;
}

function findCol(headers, keywords) {
  for (const kw of keywords) {
    const i = headers.findIndex(h => h.includes(kw));
    if (i !== -1) return i;
  }
  return -1;
}

function get(arr, idx) { return idx !== -1 && idx < arr.length ? arr[idx] : ''; }

function parsePrice(str) {
  if (!str) return 0;
  return parseInt(str.replace(/[^\d]/g, '')) || 0;
}

function splitCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (const c of line) {
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { result.push(cur); cur = ''; continue; }
    cur += c;
  }
  result.push(cur);
  return result;
}

// ============================================================
//  ДЕМО-ТОВАРЫ (fallback)
// ============================================================
function getDemoProducts() {
  return [
    { id:'d1', name:'Кондиционер Xiaomi Mijia 1.5HP', category:'climate', catName:'Кондиционеры', price:45990, old_price:52000, image:'', desc:'Инвертор, 18000 BTU, Wi-Fi', instock:true },
    { id:'d2', name:'Кондиционер KFR-72LW/N1A1', category:'climate', catName:'Кондиционеры', price:89990, old_price:0, image:'', desc:'Стоячий, 30 кубовый', instock:true },
    { id:'d3', name:'Обогреватель Xiaomi Mijia', category:'climate', catName:'Кондиционеры', price:12990, old_price:15000, image:'', desc:'Graphene Baseboard Heater 2', instock:true },
    { id:'d4', name:'Телевизор Xiaomi TV A 55"', category:'tv', catName:'Телевизоры', price:34990, old_price:39990, image:'', desc:'4K UHD, Android TV, HDR10', instock:true },
    { id:'d5', name:'Телевизор Redmi Smart TV X 43"', category:'tv', catName:'Телевизоры', price:24990, old_price:0, image:'', desc:'4K, 60Hz, Dolby Audio', instock:true },
    { id:'d6', name:'Пылесос Xiaomi Robot Vacuum S20+', category:'vacuum', catName:'Пылесос и фен', price:34990, old_price:39990, image:'', desc:'Лазерная навигация, 4000Pa', instock:true },
    { id:'d7', name:'Mi Smart Air Purifier 4 Pro', category:'air', catName:'Очистители', price:18990, old_price:0, image:'', desc:'HEPA, 500 м³/ч, PM2.5 сенсор', instock:true },
    { id:'d8', name:'Xiaomi Smart Band 9', category:'gadgets', catName:'Гаджеты', price:4990, old_price:5990, image:'', desc:'AMOLED, SpO2, 21 день работы', instock:true },
    { id:'d9', name:'Redmi Buds 6 Active', category:'gadgets', catName:'Гаджеты', price:3990, old_price:0, image:'', desc:'ANC, BT 5.4, 30 часов', instock:true },
    { id:'d10', name:'Холодильник Xiaomi Mijia 500L', category:'fridge', catName:'Холодильник', price:79990, old_price:89990, image:'', desc:'No Frost, 2-камерный, умный', instock:true },
  ];
}

// ============================================================
//  РЕНДЕР ТОВАРОВ
// ============================================================
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
    <div class="product-card" style="animation-delay:${i * 0.04}s">
      <img class="product-card__img"
        src="${p.image || 'https://via.placeholder.com/300x300/161616/ff6900?text=Xiaomi'}"
        alt="${p.name}"
        onerror="this.src='https://via.placeholder.com/300x300/161616/ff6900?text=Mi'"
        loading="lazy"
      />
      <div class="product-card__body">
        <span class="product-card__cat">${p.catName || p.category}</span>
        <h3 class="product-card__name">${p.name}</h3>
        ${p.desc ? `<p class="product-card__desc">${p.desc}</p>` : ''}
        <div class="product-card__footer">
          <div>
            ${p.old_price ? `<span class="product-card__old-price">${formatPrice(p.old_price)} ₽</span>` : ''}
            <span class="product-card__price">${formatPrice(p.price)} ₽</span>
          </div>
          ${p.instock
            ? `<button class="product-card__btn" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">В корзину</button>`
            : `<span style="font-size:0.8rem;color:var(--text-muted)">Нет в наличии</span>`
          }
        </div>
      </div>
    </div>
  `).join('');
}

function formatPrice(n) {
  return Number(n).toLocaleString('ru-RU');
}

// ============================================================
//  ФИЛЬТРАЦИЯ ПО КАТЕГОРИИ
// ============================================================
function filterCatalog(category) {
  currentCategory = category;
  const sheet = SHEETS.find(s => s.category === category);
  document.getElementById('productsTitle').textContent = sheet ? sheet.name : 'Все товары';
  document.getElementById('btnReset').style.display = category ? 'inline-flex' : 'none';
  document.getElementById('searchInput').value = '';

  filteredProducts = category ? allProducts.filter(p => p.category === category) : [...allProducts];
  renderProducts(filteredProducts);

  setTimeout(() => {
    document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ============================================================
//  ПОИСК
// ============================================================
function searchProducts(query) {
  const q = query.toLowerCase().trim();
  const base = currentCategory ? allProducts.filter(p => p.category === currentCategory) : allProducts;
  filteredProducts = q ? base.filter(p =>
    p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q))
  ) : [...base];
  renderProducts(filteredProducts);
}

// ============================================================
//  СЧЁТЧИКИ КАТЕГОРИЙ
// ============================================================
function updateCategoryCounts() {
  SHEETS.forEach(sheet => {
    const count = allProducts.filter(p => p.category === sheet.category).length;
    const el = document.getElementById('count-' + sheet.category);
    if (el) el.textContent = count ? count + ' товаров' : 'скоро';
  });
}

// ============================================================
//  АНИМАЦИЯ ЧИСЕЛ (STATS)
// ============================================================
function animateStats() {
  const nums = document.querySelectorAll('.stat__num');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1600;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString('ru-RU');
        if (current >= target) clearInterval(timer);
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(el => observer.observe(el));
}

// ============================================================
//  КОРЗИНА
// ============================================================
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showCartToast(product.name);
  // Автооткрытие корзины
  if (!document.getElementById('cartSidebar').classList.contains('active')) {
    toggleCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); }
}

function saveCart() {
  localStorage.setItem('mi_texno_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    itemsEl.innerHTML = '<p class="cart-empty">🛒 Корзина пуста</p>';
    footer.style.display = 'none';
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image || 'https://via.placeholder.com/56x56/161616/ff6900?text=Mi'}" alt="${item.name}"
           onerror="this.src='https://via.placeholder.com/56x56/161616/ff6900?text=Mi'"/>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">${formatPrice(item.price * item.qty)} ₽</div>
        <div class="cart-item__qty">
          <button onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', +1)">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart('${item.id}')" title="Удалить">✕</button>
    </div>
  `).join('');

  document.getElementById('cartTotal').textContent = formatPrice(total) + ' ₽';
  footer.style.display = 'flex';
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// Тост-уведомление
function showCartToast(name) {
  const existing = document.getElementById('cartToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:#1e1e1e; border:1px solid rgba(255,105,0,0.4);
    color:#f5f5f5; padding:12px 24px; border-radius:50px;
    font-family:'Nunito',sans-serif; font-size:0.9rem;
    z-index:300; animation:fadeInUp 0.3s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  `;
  toast.innerHTML = `✅ <strong>${name}</strong> добавлен в корзину`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
