/* ══════════════════════════════════════════════════════════════
   Mi Techno — script.js
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   1. ДАННЫЕ ТОВАРОВ
   ══════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  { id:'p1', name:'Xiaomi 14 Pro', cat:'phone', badge:'sale', badgeText:'−10%', emoji:'📱', desc:'12/256 ГБ · Titanium Black · Snapdragon 8 Gen 3', price:89990, oldPrice:99990 },
  { id:'p2', name:'Xiaomi 14', cat:'phone', badge:'new', badgeText:'Новинка', emoji:'📱', desc:'8/256 ГБ · White · Snapdragon 8 Gen 3', price:69990, oldPrice:null },
  { id:'p3', name:'Redmi Note 13 Pro', cat:'phone', badge:null, emoji:'📱', desc:'8/256 ГБ · Midnight Black · 200 МП камера', price:34990, oldPrice:39990 },
  { id:'p4', name:'Xiaomi Pad 6', cat:'tablet', badge:'sale', badgeText:'−15%', emoji:'📟', desc:'8/256 ГБ · Snapdragon 870 · 144 Гц', price:44990, oldPrice:52990 },
  { id:'p5', name:'Redmi Pad SE', cat:'tablet', badge:null, emoji:'📟', desc:'6/128 ГБ · 90 Гц · 8650 мАч', price:19990, oldPrice:null },
  { id:'p6', name:'Mi Band 8', cat:'wearable', badge:'new', badgeText:'Новинка', emoji:'⌚', desc:'1.62" AMOLED · 16 дней · 150 режимов', price:4990, oldPrice:null },
  { id:'p7', name:'Xiaomi Watch S3', cat:'wearable', badge:null, emoji:'⌚', desc:'AMOLED · HyperOS · GPS · NFC', price:14990, oldPrice:17990 },
  { id:'p8', name:'Redmi Buds 5 Pro', cat:'audio', badge:'sale', badgeText:'−20%', emoji:'🎧', desc:'ANC 52 дБ · Hi-Res Audio · 38 ч', price:7990, oldPrice:9990 },
  { id:'p9', name:'Mi True Wireless 3', cat:'audio', badge:null, emoji:'🎧', desc:'ANC · 32 ч · Bluetooth 5.2', price:5990, oldPrice:null },
  { id:'p10', name:'Mi Robot Vacuum S20', cat:'smart', badge:'new', badgeText:'Новинка', emoji:'🤖', desc:'5500 Па · Лазерная навигация · Mop', price:29990, oldPrice:null },
  { id:'p11', name:'Mi Air Purifier 4 Pro', cat:'smart', badge:null, emoji:'💨', desc:'500 м³/ч · HEPA · Wi-Fi · 31 м²', price:18990, oldPrice:22990 },
  { id:'p12', name:'Mi Smart Bulb 2', cat:'smart', badge:null, emoji:'💡', desc:'RGBW · 810 лм · Wi-Fi · Голос', price:990, oldPrice:null },
];

/* ══════════════════════════════════════════════════════════════
   2. ДАННЫЕ КОНДИЦИОНЕРОВ
   ══════════════════════════════════════════════════════════════
   img: null → показывает SVG-иконку.
   Замени null на путь к фото: img: 'img/ac1.jpg'
   ══════════════════════════════════════════════════════════════ */
const AC_DATA = [
  {
    id:'ac1', name:'Xiaomi Mijia KFR-35GW', model:'KFR-35GW/N1A1',
    cat:'Кондиционер', badge:'hot', badgeText:'Хит', energy:'A+++',
    btu:'12k', type:'inverter', price:42990, oldPrice:52990, img:null,
    specs:['12 000 BTU','Инвертор','до 35 м²','Wi-Fi','-15°C старт']
  },
  {
    id:'ac2', name:'Xiaomi Mijia KFR-26GW', model:'KFR-26GW/N1A1',
    cat:'Кондиционер', badge:'new', badgeText:'Новинка', energy:'A++',
    btu:'9k', type:'inverter', price:34990, oldPrice:null, img:null,
    specs:['9 000 BTU','Инвертор','до 25 м²','Wi-Fi','Тихий режим']
  },
  {
    id:'ac3', name:'Xiaomi Mijia KFR-72LW', model:'KFR-72LW/N1A1',
    cat:'Канальный', badge:null, energy:'A+',
    btu:'24k', type:null, price:89990, oldPrice:99990, img:null,
    specs:['24 000 BTU','Канальный','до 70 м²','Центр. управление']
  },
  {
    id:'ac4', name:'Xiaomi Mijia KFR-50LW', model:'KFR-50LW/N1A1',
    cat:'Кондиционер', badge:'sale', badgeText:'-15%', energy:'A++',
    btu:'18k', type:'inverter', price:59990, oldPrice:70490, img:null,
    specs:['18 000 BTU','Инвертор','до 50 м²','Wi-Fi','3D-поток']
  },
  {
    id:'ac5', name:'Xiaomi Mijia KFR-35GW Smart', model:'KFR-35GW/N2A1-NF',
    cat:'Smart Edition', badge:'new', badgeText:'Новинка', energy:'A+++',
    btu:'12k', type:'inverter', price:49990, oldPrice:null, img:null,
    specs:['12 000 BTU','Инвертор','до 35 м²','Mi Home','Голос. упр.','Auto-clean']
  },
  {
    id:'ac6', name:'Xiaomi Mijia KFRd-26GW', model:'KFRd-26GW/N1A1',
    cat:'Кондиционер', badge:null, energy:'A+',
    btu:'9k', type:null, price:27990, oldPrice:32990, img:null,
    specs:['9 000 BTU','On/Off','до 25 м²','Таймер','Ночной режим']
  },
];

/* ══════════════════════════════════════════════════════════════
   3. КОРЗИНА
   ══════════════════════════════════════════════════════════════ */
let cart = [];

function addToCart(id, name, price, emoji) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, emoji: emoji || '📦', qty: 1 });
  }
  renderCart();
  showToast('Добавлено в корзину: ' + name);
  bumpCount();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
}

function renderCart() {
  const items  = document.getElementById('cartItems');
  const empty  = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const count  = document.getElementById('cartCount');
  const total  = document.getElementById('cartTotal');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  count.textContent = totalQty;

  if (!cart.length) {
    empty.style.display  = 'flex';
    footer.style.display = 'none';
    // убираем старые карточки
    items.querySelectorAll('.cart-item').forEach(el => el.remove());
    return;
  }

  empty.style.display  = 'none';
  footer.style.display = 'block';

  // перерисовываем элементы
  items.querySelectorAll('.cart-item').forEach(el => el.remove());
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.id = 'ci-' + item.id;
    div.innerHTML = `
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price * item.qty).toLocaleString('ru-RU')} ₽</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-del" onclick="removeFromCart('${item.id}')">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>`;
    items.appendChild(div);
  });

  const sum = cart.reduce((s, i) => s + i.price * i.qty, 0);
  total.textContent = sum.toLocaleString('ru-RU') + ' ₽';
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function bumpCount() {
  const cnt = document.getElementById('cartCount');
  cnt.classList.add('bump');
  setTimeout(() => cnt.classList.remove('bump'), 300);
}

/* ══════════════════════════════════════════════════════════════
   4. TOAST
   ══════════════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ══════════════════════════════════════════════════════════════
   5. КАТАЛОГ ТОВАРОВ (GRID)
   ══════════════════════════════════════════════════════════════ */
function renderProducts(data) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  data.forEach(p => {
    const badgeHtml = p.badge ? `<div class="product-badge ${p.badge === 'new' ? 'new' : ''}">${p.badgeText || p.badge}</div>` : '';
    const oldHtml   = p.oldPrice ? `<div class="product-price-old">${p.oldPrice.toLocaleString('ru-RU')} ₽</div>` : '';
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      ${badgeHtml}
      <div class="product-img">${p.emoji}</div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div>
            <div class="product-price">${p.price.toLocaleString('ru-RU')} ₽</div>
            ${oldHtml}
          </div>
          <button class="add-to-cart" onclick="addToCart('${p.id}','${p.name}',${p.price},'${p.emoji}')">
            <svg viewBox="0 0 24 24" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>`;
    grid.appendChild(div);
  });
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.catalog-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat));
}

/* ══════════════════════════════════════════════════════════════
   6. AC SWIPE SLIDER
   ══════════════════════════════════════════════════════════════ */
(function () {

  /* SVG-иконка, если нет фото */
  const AC_ICON = `<div class="ac-icon-placeholder">
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="40" height="14" rx="4"/>
      <line x1="12" y1="28" x2="12" y2="34"/><line x1="18" y1="28" x2="18" y2="38"/>
      <line x1="24" y1="28" x2="24" y2="34"/><line x1="30" y1="28" x2="30" y2="38"/>
      <line x1="36" y1="28" x2="36" y2="34"/>
      <line x1="10" y1="20" x2="30" y2="20"/>
      <circle cx="38" cy="20" r="2"/>
    </svg>
  </div>`;

  function renderACCard(ac) {
    const imgHtml  = ac.img ? `<img src="${ac.img}" alt="${ac.name}" loading="lazy">` : AC_ICON;
    const badge    = ac.badge ? `<span class="ac-badge ${ac.badge}">${ac.badgeText}</span>` : '';
    const oldPrice = ac.oldPrice ? `<div class="ac-price-old">${ac.oldPrice.toLocaleString('ru-RU')} ₽</div>` : '';
    const specs    = ac.specs.map((s, i) => `<span class="ac-spec${i===0?' highlight':''}">${s}</span>`).join('');

    const div = document.createElement('div');
    div.className  = 'ac-card';
    div.dataset.btu  = ac.btu  || '';
    div.dataset.type = ac.type || '';
    div.innerHTML = `
      ${badge}
      <div class="ac-energy">${ac.energy}</div>
      <div class="ac-card-img-wrap">${imgHtml}</div>
      <div class="ac-card-body">
        <div class="ac-card-cat">${ac.cat}</div>
        <div class="ac-card-name">${ac.name}</div>
        <div class="ac-card-model">${ac.model}</div>
        <div class="ac-specs">${specs}</div>
        <div class="ac-card-footer">
          <div>
            <div class="ac-price">${ac.price.toLocaleString('ru-RU')} ₽</div>
            ${oldPrice}
          </div>
          <button class="ac-add-btn" onclick="addToCart('${ac.id}','${ac.name}',${ac.price},null)" title="В корзину">
            <svg viewBox="0 0 24 24" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>`;
    return div;
  }

  /* ── Слайдер ── */
  const track   = document.getElementById('acTrack');
  const dotsBox = document.getElementById('acDots');
  const prevBtn = document.getElementById('acPrev');
  const nextBtn = document.getElementById('acNext');
  const wrapper = document.getElementById('acWrapper');
  if (!track || !wrapper) return;

  let current    = 0;
  let startX     = 0;
  let isDragging = false;
  let dragDelta  = 0;
  let visibleData = [...AC_DATA];

  function cardsPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 1;
    return 3;
  }

  function getStepPx() {
    const c = track.querySelector('.ac-card');
    if (!c) return 0;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 20;
    return c.offsetWidth + gap;
  }

  function maxIdx() {
    return Math.max(0, visibleData.length - Math.floor(cardsPerView()));
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIdx()));
    track.style.transform = `translateX(-${current * getStepPx()}px)`;
    dotsBox.querySelectorAll('.app-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= maxIdx();
  }

  function buildDots(count) {
    dotsBox.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      b.className = 'app-dot' + (i === 0 ? ' active' : '');
      b.onclick   = () => goTo(i);
      dotsBox.appendChild(b);
    }
  }

  function renderSlider(data) {
    track.style.transform = 'translateX(0)';
    track.innerHTML = '';
    if (!data.length) {
      track.innerHTML = '<div class="ac-empty">Нет моделей по выбранному фильтру</div>';
      dotsBox.innerHTML = '';
      return;
    }
    data.forEach(ac => track.appendChild(renderACCard(ac)));
    current = 0;
    buildDots(maxIdx() + 1);
    requestAnimationFrame(() => goTo(0));
  }

  /* Публичный фильтр */
  window.acFilter = function (type, btn) {
    document.querySelectorAll('#acFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    visibleData = type === 'all'      ? [...AC_DATA]
                : type === 'inverter' ? AC_DATA.filter(a => a.type === 'inverter')
                :                       AC_DATA.filter(a => a.btu === type);
    renderSlider(visibleData);
  };

  /* Публичные стрелки */
  window.acSlide = function (dir) { goTo(current + dir); };

  /* Touch */
  wrapper.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend',   e => {
    const d = startX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 48) goTo(d > 0 ? current + 1 : current - 1);
  }, { passive: true });

  /* Mouse drag */
  wrapper.addEventListener('mousedown', e => {
    isDragging = true; startX = e.clientX;
    wrapper.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => { if (isDragging) dragDelta = startX - e.clientX; });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    wrapper.classList.remove('dragging');
    if (Math.abs(dragDelta) > 48) goTo(dragDelta > 0 ? current + 1 : current - 1);
    dragDelta = 0;
  });

  /* Resize */
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { buildDots(maxIdx() + 1); goTo(0); }, 200);
  });

  renderSlider(AC_DATA);
})();

/* ══════════════════════════════════════════════════════════════
   7. ЧАТ
   ══════════════════════════════════════════════════════════════ */
const BOT_REPLIES = [
  'Конечно, помогу! Уточните, пожалуйста, модель.',
  'Отличный выбор! Это один из наших хитов.',
  'Есть в наличии. Оформить заказ можно прямо здесь.',
  'Доставка занимает 1–3 рабочих дня.',
  'Для уточнения деталей напишите нам в WhatsApp или Telegram.',
];
let botIdx = 0;
function sendChat() {
  const input = document.getElementById('chatInput');
  const msgs  = document.getElementById('chatMessages');
  const text  = input.value.trim();
  if (!text) return;
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  msgs.appendChild(userMsg);
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-msg bot';
    botMsg.textContent = BOT_REPLIES[botIdx % BOT_REPLIES.length];
    botIdx++;
    msgs.appendChild(botMsg);
    msgs.scrollTop = msgs.scrollHeight;
  }, 700);
}

/* ══════════════════════════════════════════════════════════════
   8. SCROLL
   ══════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 20);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ══════════════════════════════════════════════════════════════
   9. СТАРТ
   ══════════════════════════════════════════════════════════════ */
renderProducts(PRODUCTS);
renderCart();
