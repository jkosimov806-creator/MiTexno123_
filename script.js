// ============================================================
//  Mi Techno — script.js
// ============================================================

// === PRODUCTS DATA ===
const products = [
  { id: 1, name: 'Xiaomi 14 Pro',       cat: 'phone',    category: 'Смартфоны', price: 89990,  oldPrice: 99990, emoji: '📱', desc: '50MP Leica · 120W быстрая зарядка',     badge: 'Хит'     },
  { id: 2, name: 'Xiaomi 14 Ultra',     cat: 'phone',    category: 'Смартфоны', price: 119990, oldPrice: null,  emoji: '📱', desc: 'Snapdragon 8 Gen 3 · 5000 mAh',        badge: 'Новинка' },
  { id: 3, name: 'Redmi Note 13 Pro+',  cat: 'phone',    category: 'Смартфоны', price: 39990,  oldPrice: 44990, emoji: '📱', desc: '200MP · IP68 · 120Гц AMOLED',          badge: '-10%'    },
  { id: 4, name: 'Xiaomi Pad 6 Pro',    cat: 'tablet',   category: 'Планшеты',  price: 54990,  oldPrice: null,  emoji: '📟', desc: '11" 144Гц · Snapdragon 8+ Gen 1',     badge: null      },
  { id: 5, name: 'Mi Band 8 Pro',       cat: 'wearable', category: 'Носимые',   price: 7990,   oldPrice: 9490,  emoji: '⌚', desc: 'AMOLED · GPS · 14 дней работы',       badge: '-15%'    },
  { id: 6, name: 'Xiaomi Watch S3',     cat: 'wearable', category: 'Носимые',   price: 19990,  oldPrice: null,  emoji: '⌚', desc: 'eSIM · AMOLED · SpO2 · GPS',          badge: 'Новинка' },
  { id: 7, name: 'Buds 4 Pro',          cat: 'audio',    category: 'Аудио',     price: 14990,  oldPrice: 17490, emoji: '🎧', desc: 'ANC · LDAC · 38 часов работы',        badge: '-14%'    },
  { id: 8, name: 'Mi Robot Vacuum S20', cat: 'smart',    category: 'Умный дом', price: 29990,  oldPrice: null,  emoji: '🤖', desc: '6000 Па · Лазерная навигация · Моп',  badge: null      },
];

let cart = [];
let activeFilter = 'all';

// ── RENDER PRODUCTS ─────────────────────────────────────────
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter);

  grid.innerHTML = filtered.map(p => `
    <div class="product-card fade-up">
      ${p.badge ? `<div class="product-badge ${p.badge === 'Новинка' ? 'new' : ''}">${p.badge}</div>` : ''}
      <div class="product-img">${p.emoji}</div>
      <div class="product-info">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div>
            <div class="product-price">${p.price.toLocaleString('ru')} ₽</div>
            ${p.oldPrice ? `<div class="product-price-old">${p.oldPrice.toLocaleString('ru')} ₽</div>` : ''}
          </div>
          <button class="add-to-cart" onclick="addToCart(${p.id})" title="В корзину">
            <svg viewBox="0 0 24 24" stroke-width="2.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  observeFadeUps();
}

function filterProducts(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(filter);
}

// ── CART ────────────────────────────────────────────────────
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCart();
  showToast(`${product.name} добавлен в корзину`);

  const countEl = document.getElementById('cartCount');
  countEl.classList.add('bump');
  setTimeout(() => countEl.classList.remove('bump'), 300);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCart();
}

function updateCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  document.getElementById('cartCount').textContent = totalItems;
  document.getElementById('cartTotal').textContent = totalPrice.toLocaleString('ru') + ' ₽';

  const cartItemsEl = document.getElementById('cartItems');
  const emptyEl     = document.getElementById('cartEmpty');
  const footerEl    = document.getElementById('cartFooter');

  if (cart.length === 0) {
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(emptyEl);
  } else {
    emptyEl.style.display = 'none';
    footerEl.style.display = 'block';
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${(item.price * item.qty).toLocaleString('ru')} ₽</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-del" onclick="removeFromCart(${item.id})">
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    `).join('');
  }
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartPanel').classList.toggle('open');
}

// ── TOAST ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── CHAT ─────────────────────────────────────────────────────
const chatReplies = [
  'Конечно! Расскажите подробнее, чем могу помочь? 😊',
  'Отличный выбор! Xiaomi всегда радует соотношением цены и качества.',
  'Для этой модели у нас есть официальная гарантия 2 года. Всё в наличии!',
  'Доставка 1–3 дня по России. Курьером или в пункт выдачи — как удобнее?',
  'Рассрочка 0% на 12 месяцев — оформляем прямо на сайте при оформлении заказа.',
  'Понял вас! Сейчас уточню информацию и вернусь с ответом через минуту.',
];
let chatReplyIdx = 0;

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML += `<div class="chat-msg user">${msg}</div>`;
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    msgs.innerHTML += `<div class="chat-msg bot">${chatReplies[chatReplyIdx % chatReplies.length]}</div>`;
    chatReplyIdx++;
    msgs.scrollTop = msgs.scrollHeight;
  }, 800);
}

// ── SCROLL ANIMATIONS ────────────────────────────────────────
function observeFadeUps() {
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) el.classList.add('visible');
  });
}

window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 20);
  observeFadeUps();
});

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  observeFadeUps();
});
