/* =============================================
   MI TEXNO — MAIN JS
   Google Sheets интеграция + корзина
   ============================================= */

// ============================================================
//  НАСТРОЙКИ — ЗАМЕНИТЕ НА СВОИ ДАННЫЕ
// ============================================================
const CONFIG = {
  // 1. Откройте вашу Google Таблицу
  // 2. Файл → Опубликовать в Интернете → CSV → Скопируйте ссылку
  // Пример ссылки:
  // https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=csv
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=csv',

  // Если используете Google Sheets JSON API (gviz):
  // https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:csv
};

// ============================================================
//  СТРУКТУРА ТАБЛИЦЫ (порядок колонок):
//  A: id        — уникальный номер товара
//  B: name      — название товара
//  C: category  — категория (phones, tablets, wearables, audio, smarthome, accessories)
//  D: price     — цена в рублях (только цифры)
//  E: old_price — старая цена (если есть скидка, иначе пусто)
//  F: image     — прямая ссылка на фото товара
//  G: desc      — краткое описание
//  H: instock   — наличие (1 = есть, 0 = нет)
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
  loadProducts();
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

// Закрыть меню при клике на ссылку
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('nav').classList.remove('open');
    document.getElementById('burger').classList.remove('active');
  });
});

// ============================================================
//  ЗАГРУЗКА ТОВАРОВ ИЗ GOOGLE SHEETS
// ============================================================
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const loading = document.getElementById('loadingBar');

  // Если ссылка не настроена — покажем демо-товары
  if (CONFIG.SHEET_URL.includes('YOUR_SHEET_ID')) {
    console.warn('⚠️ Google Sheets не подключён. Используются демо-товары.');
    loading.style.display = 'none';
    allProducts = getDemoProducts();
    filteredProducts = [...allProducts];
    renderProducts(filteredProducts);
    updateCategoryCounts();
    return;
  }

  try {
    const res = await fetch(CONFIG.SHEET_URL);
    if (!res.ok) throw new Error('Ошибка загрузки');
    const csv = await res.text();
    allProducts = parseCSV(csv);
    filteredProducts = [...allProducts];
    loading.style.display = 'none';
    renderProducts(filteredProducts);
    updateCategoryCounts();
  } catch (err) {
    console.error('Ошибка загрузки таблицы:', err);
    loading.innerHTML = `<p style="color:#ef4444">⚠️ Не удалось загрузить каталог. Проверьте настройки Google Sheets.</p>`;
    // Fallback на демо
    setTimeout(() => {
      loading.style.display = 'none';
      allProducts = getDemoProducts();
      filteredProducts = [...allProducts];
      renderProducts(filteredProducts);
      updateCategoryCounts();
    }, 2000);
  }
}

// ============================================================
//  ПАРСИНГ CSV
// ============================================================
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length < 2) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] || '').replace(/"/g, '').trim();
    });
    // Пропускаем пустые строки
    if (!obj.name) continue;
    products.push({
      id: obj.id || String(i),
      name: obj.name || 'Товар',
      category: obj.category || 'accessories',
      price: parseInt(obj.price) || 0,
      old_price: parseInt(obj.old_price) || 0,
      image: obj.image || obj['image'] || '',
      desc: obj.desc || obj['description'] || '',
      instock: obj.instock !== '0',
    });
  }
  return products;
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { result.push(cur); cur = ''; continue; }
    cur += c;
  }
  result.push(cur);
  return result;
}

// ============================================================
//  ДЕМО-ТОВАРЫ (когда таблица не подключена)
// ============================================================
function getDemoProducts() {
  return [
    { id:'1', name:'Xiaomi 15 Pro', category:'phones', price:89990, old_price:99990, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-pro.jpg', desc:'Snapdragon 8 Elite, 50MP, 6000mAh', instock:true },
    { id:'2', name:'Redmi Note 14 Pro', category:'phones', price:34990, old_price:0, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-14-pro.jpg', desc:'Dimensity 7300-Ultra, 200MP', instock:true },
    { id:'3', name:'Xiaomi 14T', category:'phones', price:59990, old_price:64990, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14t.jpg', desc:'Dimensity 8300-Ultra, Leica камера', instock:true },
    { id:'4', name:'Redmi Note 13', category:'phones', price:24990, old_price:0, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-4g.jpg', desc:'6.67" AMOLED, 108MP камера', instock:true },
    { id:'5', name:'Xiaomi Pad 7', category:'tablets', price:44990, old_price:49990, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-pad-7.jpg', desc:'11.2" 144Hz, Snapdragon 7+ Gen 3', instock:true },
    { id:'6', name:'Redmi Pad SE 8.7', category:'tablets', price:18990, old_price:0, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-pad-se-8-7.jpg', desc:'8.7" 90Hz, 8020mAh батарея', instock:true },
    { id:'7', name:'Mi Band 9', category:'wearables', price:4990, old_price:5990, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-smart-band-9.jpg', desc:'AMOLED, SpO2, 21 день работы', instock:true },
    { id:'8', name:'Redmi Watch 5', category:'wearables', price:8990, old_price:0, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-watch-5.jpg', desc:'1.96" AMOLED, GPS, 20 спортрежимов', instock:true },
    { id:'9', name:'Redmi Buds 6', category:'audio', price:5990, old_price:7490, image:'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-buds-6-active.jpg', desc:'ANC, 30ч, BT 5.4', instock:true },
    { id:'10', name:'Mi True Wireless Earphones 3', category:'audio', price:3490, old_price:0, image:'https://i.imgur.com/placeholder.jpg', desc:'TWS, 24ч, IPX4', instock:true },
    { id:'11', name:'Mi Smart Hub', category:'smarthome', price:3990, old_price:0, image:'https://i.imgur.com/placeholder.jpg', desc:'Умный центр управления домом', instock:true },
    { id:'12', name:'Mi Robot Vacuum S20+', category:'smarthome', price:34990, old_price:39990, image:'https://i.imgur.com/placeholder.jpg', desc:'Лазерная навигация, 4000Pa', instock:true },
    { id:'13', name:'67W GaN Зарядка', category:'accessories', price:2490, old_price:0, image:'https://i.imgur.com/placeholder.jpg', desc:'2×USB-C + USB-A, складная', instock:true },
    { id:'14', name:'Xiaomi Power Bank 3 20000', category:'accessories', price:3990, old_price:4490, image:'https://i.imgur.com/placeholder.jpg', desc:'20000mAh, 65W быстрая зарядка', instock:true },
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

  const catNames = {
    phones: 'Смартфоны',
    tablets: 'Планшеты',
    wearables: 'Носимые',
    audio: 'Аудио',
    smarthome: 'Умный дом',
    accessories: 'Аксессуары',
  };

  grid.innerHTML = products.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.04}s">
      <img class="product-card__img"
        src="${p.image || 'https://via.placeholder.com/300x300/161616/ff6900?text=Xiaomi'}"
        alt="${p.name}"
        onerror="this.src='https://via.placeholder.com/300x300/161616/ff6900?text=Mi'"
        loading="lazy"
      />
      <div class="product-card__body">
        <span class="product-card__cat">${catNames[p.category] || p.category}</span>
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
  const catNames = {
    phones: 'Смартфоны', tablets: 'Планшеты', wearables: 'Носимые',
    audio: 'Аудио', smarthome: 'Умный дом', accessories: 'Аксессуары', '': 'Все товары'
  };
  document.getElementById('productsTitle').textContent = catNames[category] || 'Все товары';
  document.getElementById('btnReset').style.display = category ? 'inline-flex' : 'none';
  document.getElementById('searchInput').value = '';

  filteredProducts = category ? allProducts.filter(p => p.category === category) : [...allProducts];
  renderProducts(filteredProducts);

  // Прокрутить к каталогу
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
  const cats = ['phones','tablets','wearables','audio','smarthome','accessories'];
  cats.forEach(cat => {
    const count = allProducts.filter(p => p.category === cat).length;
    const el = document.getElementById('count-' + cat);
    if (el) el.textContent = count + ' товаров';
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
