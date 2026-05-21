/* ══════════════════════════════════════════════════════════════
   Mi Техно — script.js
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   1. ДАННЫЕ ТОВАРОВ (цены в сомони)
   ══════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  { id:'p1',  name:'Xiaomi 14 Pro',         cat:'phone',    badge:'sale', badgeText:'−10%',    emoji:'📱', desc:'12/256 ГБ · Titanium Black · Snapdragon 8 Gen 3', price:8990,  oldPrice:9990 },
  { id:'p2',  name:'Xiaomi 14',             cat:'phone',    badge:'new',  badgeText:'Новинка', emoji:'📱', desc:'8/256 ГБ · White · Snapdragon 8 Gen 3',           price:6990,  oldPrice:null },
  { id:'p3',  name:'Redmi Note 13 Pro',     cat:'phone',    badge:null,   badgeText:null,      emoji:'📱', desc:'8/256 ГБ · Midnight Black · 200 МП камера',        price:3490,  oldPrice:3990 },
  { id:'p4',  name:'Xiaomi Pad 6',          cat:'tablet',   badge:'sale', badgeText:'−15%',    emoji:'📟', desc:'8/256 ГБ · Snapdragon 870 · 144 Гц',               price:4490,  oldPrice:5290 },
  { id:'p5',  name:'Redmi Pad SE',          cat:'tablet',   badge:null,   badgeText:null,      emoji:'📟', desc:'6/128 ГБ · 90 Гц · 8650 мАч',                      price:1990,  oldPrice:null },
  { id:'p6',  name:'Mi Band 8',             cat:'wearable', badge:'new',  badgeText:'Новинка', emoji:'⌚', desc:'1.62" AMOLED · 16 дней · 150 режимов',             price:490,   oldPrice:null },
  { id:'p7',  name:'Xiaomi Watch S3',       cat:'wearable', badge:null,   badgeText:null,      emoji:'⌚', desc:'AMOLED · HyperOS · GPS · NFC',                      price:1490,  oldPrice:1790 },
  { id:'p8',  name:'Redmi Buds 5 Pro',      cat:'audio',    badge:'sale', badgeText:'−20%',    emoji:'🎧', desc:'ANC 52 дБ · Hi-Res Audio · 38 ч',                   price:790,   oldPrice:990 },
  { id:'p9',  name:'Mi True Wireless 3',    cat:'audio',    badge:null,   badgeText:null,      emoji:'🎧', desc:'ANC · 32 ч · Bluetooth 5.2',                        price:590,   oldPrice:null },
  { id:'p10', name:'Mi Robot Vacuum S20',   cat:'smart',    badge:'new',  badgeText:'Новинка', emoji:'🤖', desc:'5500 Па · Лазерная навигация · Mop',                price:2990,  oldPrice:null },
  { id:'p11', name:'Mi Air Purifier 4 Pro', cat:'smart',    badge:null,   badgeText:null,      emoji:'💨', desc:'500 м³/ч · HEPA · Wi-Fi · 31 м²',                   price:1890,  oldPrice:2290 },
  { id:'p12', name:'Mi Smart Bulb 2',       cat:'smart',    badge:null,   badgeText:null,      emoji:'💡', desc:'RGBW · 810 лм · Wi-Fi · Голос',                     price:99,    oldPrice:null },
];

const AC_DATA = [
  { id:'ac1', name:'Xiaomi Mijia KFR-35GW',        model:'KFR-35GW/N1A1',    cat:'Кондиционер',   badge:'hot',  badgeText:'Хит',     energy:'A+++', btu:'12k', type:'inverter', price:4290,  oldPrice:5290, img:null, specs:['12 000 BTU','Инвертор','до 35 м²','Wi-Fi','-15°C старт'] },
  { id:'ac2', name:'Xiaomi Mijia KFR-26GW',        model:'KFR-26GW/N1A1',    cat:'Кондиционер',   badge:'new',  badgeText:'Новинка', energy:'A++',  btu:'9k',  type:'inverter', price:3490,  oldPrice:null, img:'img/53c1adcb19d5f3d100277b9548f0dd8b.webp', specs:['9 000 BTU','Инвертор','до 25 м²','Wi-Fi','Тихий режим'] },
  { id:'ac3', name:'Xiaomi Mijia KFR-72LW',        model:'KFR-72LW/N1A1',    cat:'Канальный',     badge:null,   badgeText:null,      energy:'A+',   btu:'24k', type:null,       price:8990,  oldPrice:9990, img:null, specs:['24 000 BTU','Канальный','до 70 м²','Центр. управление'] },
  { id:'ac4', name:'Xiaomi Mijia KFR-50LW',        model:'KFR-50LW/N1A1',    cat:'Кондиционер',   badge:'sale', badgeText:'-15%',    energy:'A++',  btu:'18k', type:'inverter', price:5990,  oldPrice:7040, img:null, specs:['18 000 BTU','Инвертор','до 50 м²','Wi-Fi','3D-поток'] },
  { id:'ac5', name:'Xiaomi Mijia KFR-35GW Smart',  model:'KFR-35GW/N2A1-NF', cat:'Smart Edition', badge:'new',  badgeText:'Новинка', energy:'A+++', btu:'12k', type:'inverter', price:4990,  oldPrice:null, img:null, specs:['12 000 BTU','Инвертор','до 35 м²','Mi Home','Голос. упр.','Auto-clean'] },
  { id:'ac6', name:'Xiaomi Mijia KFRd-26GW',       model:'KFRd-26GW/N1A1',   cat:'Кондиционер',   badge:null,   badgeText:null,      energy:'A+',   btu:'9k',  type:null,       price:2790,  oldPrice:3290, img:null, specs:['9 000 BTU','On/Off','до 25 м²','Таймер','Ночной режим'] },
];

const CUR = ' сом.';

/* ══════════════════════════════════════════════════════════════
   2. КОРЗИНА
   ══════════════════════════════════════════════════════════════ */
let cart = [];

function addToCart(id, name, price, emoji) {
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id, name, price, emoji: emoji || '📦', qty: 1 }); }
  renderCart();
  showToast('Добавлено: ' + name);
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
  const items    = document.getElementById('cartItems');
  const empty    = document.getElementById('cartEmpty');
  const footer   = document.getElementById('cartFooter');
  const count    = document.getElementById('cartCount');
  const mobCount = document.getElementById('mobCartCount');
  const total    = document.getElementById('cartTotal');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  count.textContent = totalQty;
  if (mobCount) {
    mobCount.textContent = totalQty;
    mobCount.classList.toggle('show', totalQty > 0);
  }

  items.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (!cart.length) {
    empty.style.display = 'flex';
    footer.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  footer.style.display = 'block';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price * item.qty).toLocaleString('ru-RU')}${CUR}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-del" onclick="removeFromCart('${item.id}')">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>`;
    items.appendChild(div);
  });

  total.textContent = cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('ru-RU') + CUR;
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
   3. TOAST
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
   4. КАТАЛОГ
   ══════════════════════════════════════════════════════════════ */
function renderProducts(data) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  data.forEach(p => {
    const badgeHtml = p.badge
      ? `<div class="product-badge ${p.badge === 'new' ? 'new' : ''}">${p.badgeText || p.badge}</div>`
      : '';
    const oldHtml = p.oldPrice
      ? `<div class="product-price-old">${p.oldPrice.toLocaleString('ru-RU')}${CUR}</div>`
      : '';
    const wished = (typeof isInWishlist === 'function') ? isInWishlist(p.id) : false;
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      ${badgeHtml}
      <button class="wish-heart ${wished ? 'wished' : ''}" data-id="${p.id}"
        onclick="toggleWishlistItem({id:'${p.id}',name:'${p.name.replace(/'/g,"\\'")}',price:${p.price},emoji:'${p.emoji}'},this)"
        title="В избранное">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>
      <div class="product-img">${p.emoji}</div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div>
            <div class="product-price">${p.price.toLocaleString('ru-RU')}${CUR}</div>
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

/* ══════════════════════════════════════════════════════════════
   ОФОРМЛЕНИЕ ЗАКАЗА — открывает форму с именем + телефоном
   ══════════════════════════════════════════════════════════════ */
window.checkoutCart = function() {
  if (!cart.length) { showToast('Корзина пуста!'); return; }
  toggleCart();
  const modal = document.getElementById('orderModal');
  const summary = document.getElementById('orderSummary');
  const formView = document.getElementById('orderFormView');
  const successView = document.getElementById('orderSuccess');
  if (!modal) return;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  summary.innerHTML = cart.map(i =>
    `<div class="order-item-row"><span>${i.emoji} ${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}</span><span>${(i.price * i.qty).toLocaleString('ru-RU')}${CUR}</span></div>`
  ).join('') + `<div class="order-total-row"><span>Итого</span><span>${total.toLocaleString('ru-RU')}${CUR}</span></div>`;

  formView.style.display = '';
  successView.style.display = 'none';
  document.getElementById('orderName').value = '';
  document.getElementById('orderPhone').value = '';

  const session = typeof getSession === 'function' ? getSession() : null;
  if (session) {
    document.getElementById('orderName').value = session.name || '';
    document.getElementById('orderPhone').value = session.phone || '';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('orderName').focus(), 200);
};

window.closeOrderModal = function() {
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
};

window.submitOrder = function() {
  const name  = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  if (!name)  { document.getElementById('orderName').focus();  showToast('Введите ваше имя'); return; }
  if (!phone) { document.getElementById('orderPhone').focus(); showToast('Введите телефон'); return; }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const items = [...cart];
  if (typeof saveOrder === 'function') saveOrder(items, total);

  const bonusEarned = Math.round(total * 0.05);
  const isLoggedIn  = typeof getSession === 'function' && getSession();
  if (isLoggedIn && typeof awardBonuses === 'function') awardBonuses(bonusEarned);

  cart = [];
  renderCart();

  document.getElementById('orderFormView').style.display = 'none';
  document.getElementById('orderSuccess').style.display  = '';

  const tgText = encodeURIComponent(`🛒 Новый заказ!\nИмя: ${name}\nТел: ${phone}\nСумма: ${total.toLocaleString('ru-RU')} сом.\nТовары:\n${items.map(i => `• ${i.name} ×${i.qty} — ${(i.price*i.qty).toLocaleString('ru-RU')} сом.`).join('\n')}`);
  window.open(`https://t.me/Mi_Techn0?text=${tgText}`, '_blank');

  if (isLoggedIn) setTimeout(() => openCabinet('orders'), 1500);
};

function filterProducts(cat, btn) {
  document.querySelectorAll('.catalog-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat));
}

/* ══════════════════════════════════════════════════════════════
   5. УНИВЕРСАЛЬНЫЙ СВАЙП-СЛАЙДЕР
   ══════════════════════════════════════════════════════════════ */
function createSlider({ wrapperId, trackId, dotsId, prevId, nextId, getCards }) {
  const wrapper = document.getElementById(wrapperId);
  const track   = document.getElementById(trackId);
  const dotsBox = document.getElementById(dotsId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  if (!wrapper || !track) return null;

  let current    = 0;
  let startX     = 0;
  let isDragging = false;
  let dragDelta  = 0;

  function cpv() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 1;
    return 3;
  }

  function stepPx() {
    const c = track.querySelector('.tv-card, .ac-card');
    if (!c) return 0;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 16;
    return c.offsetWidth + gap;
  }

  function cards() { return typeof getCards === 'function' ? getCards() : []; }
  function maxIdx() { return Math.max(0, cards().length - Math.floor(cpv())); }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIdx()));
    track.style.transform = `translateX(-${current * stepPx()}px)`;
    if (dotsBox) {
      dotsBox.querySelectorAll('.dot-item, .app-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= maxIdx();
  }

  function buildDots(count) {
    if (!dotsBox) return;
    dotsBox.innerHTML = '';
    const cls = dotsId === 'acDots' ? 'app-dot' : 'dot-item';
    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      b.className = cls + (i === 0 ? ' active' : '');
      b.onclick = () => goTo(i);
      dotsBox.appendChild(b);
    }
  }

  function init() {
    current = 0;
    track.style.transform = 'translateX(0)';
    buildDots(maxIdx() + 1);
    requestAnimationFrame(() => goTo(0));
  }

  /* Touch */
  wrapper.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend',   e => {
    const d = startX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 44) goTo(d > 0 ? current + 1 : current - 1);
  }, { passive: true });

  /* Mouse drag */
  wrapper.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; wrapper.classList.add('dragging'); });
  window.addEventListener('mousemove',  e => { if (isDragging) dragDelta = startX - e.clientX; });
  window.addEventListener('mouseup',    () => {
    if (!isDragging) return;
    isDragging = false; wrapper.classList.remove('dragging');
    if (Math.abs(dragDelta) > 44) goTo(dragDelta > 0 ? current + 1 : current - 1);
    dragDelta = 0;
  });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { buildDots(maxIdx() + 1); goTo(0); }, 200);
  });

  init();
  return { goTo, slide: (dir) => goTo(current + dir), init };
}

/* ══════════════════════════════════════════════════════════════
   6. TV SLIDER
   ══════════════════════════════════════════════════════════════ */
let tvSlider;
(function () {
  const track = document.getElementById('tvTrack');
  if (!track) return;
  tvSlider = createSlider({
    wrapperId: 'tvWrapper',
    trackId:   'tvTrack',
    dotsId:    'tvDots',
    prevId:    'tvPrev',
    nextId:    'tvNext',
    getCards:  () => track.querySelectorAll('.tv-card'),
  });
})();
window.tvSlide = dir => { if (tvSlider) tvSlider.slide(dir); };

/* ══════════════════════════════════════════════════════════════
   7. AC SLIDER
   ══════════════════════════════════════════════════════════════ */
(function () {
  const AC_ICON = `<div class="ac-icon-placeholder">
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="40" height="14" rx="4"/>
      <line x1="12" y1="28" x2="12" y2="34"/><line x1="18" y1="28" x2="18" y2="38"/>
      <line x1="24" y1="28" x2="24" y2="34"/><line x1="30" y1="28" x2="30" y2="38"/>
      <line x1="36" y1="28" x2="36" y2="34"/>
      <line x1="10" y1="20" x2="30" y2="20"/><circle cx="38" cy="20" r="2"/>
    </svg>
  </div>`;

  function renderACCard(ac) {
    const imgHtml  = ac.img ? `<img src="${ac.img}" alt="${ac.name}" loading="lazy">` : AC_ICON;
    const badge    = ac.badge ? `<span class="ac-badge ${ac.badge}">${ac.badgeText}</span>` : '';
    const oldPrice = ac.oldPrice ? `<div class="ac-price-old">${ac.oldPrice.toLocaleString('ru-RU')}${CUR}</div>` : '';
    const specs    = ac.specs.map((s, i) => `<span class="ac-spec${i===0?' highlight':''}">${s}</span>`).join('');
    const div = document.createElement('div');
    div.className    = 'ac-card';
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
            <div class="ac-price">${ac.price.toLocaleString('ru-RU')}${CUR}</div>
            ${oldPrice}
          </div>
          <button class="ac-add-btn" onclick="addToCart('${ac.id}','${ac.name}',${ac.price},null)">
            <svg viewBox="0 0 24 24" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>`;
    return div;
  }

  const track   = document.getElementById('acTrack');
  const wrapper = document.getElementById('acWrapper');
  if (!track || !wrapper) return;

  let acSliderCtrl;

  function renderSlider(data) {
    track.innerHTML = '';
    if (!data.length) {
      track.innerHTML = '<div class="ac-empty">Нет моделей по выбранному фильтру</div>';
      return;
    }
    data.forEach(ac => track.appendChild(renderACCard(ac)));
    if (acSliderCtrl) acSliderCtrl.init();
  }

  acSliderCtrl = createSlider({
    wrapperId: 'acWrapper',
    trackId:   'acTrack',
    dotsId:    'acDots',
    prevId:    'acPrev',
    nextId:    'acNext',
    getCards:  () => track.querySelectorAll('.ac-card'),
  });

  window.acFilter = function(type, btn) {
    document.querySelectorAll('#acFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const data = type === 'all'      ? [...AC_DATA]
               : type === 'inverter' ? AC_DATA.filter(a => a.type === 'inverter')
               :                       AC_DATA.filter(a => a.btu === type);
    renderSlider(data);
  };
  window.acSlide = dir => { if (acSliderCtrl) acSliderCtrl.slide(dir); };

  renderSlider(AC_DATA);
})();

/* ══════════════════════════════════════════════════════════════
   8. ЧАТ
   ══════════════════════════════════════════════════════════════ */
const BOT_REPLIES = [
  'Конечно, помогу! Уточните, пожалуйста, модель.',
  'Отличный выбор! Это один из наших хитов.',
  'Есть в наличии. Оформить заказ можно прямо здесь.',
  'Доставка занимает 1–3 рабочих дня.',
  'Для уточнения деталей напишите нам в WhatsApp или Telegram.',
];
let botIdx = 0;
window.sendChat = function () {
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
};

/* ══════════════════════════════════════════════════════════════
   9. SCROLL & FADE-UP
   ══════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ══════════════════════════════════════════════════════════════
   10. ПОИСК
   ══════════════════════════════════════════════════════════════ */
const ALL_SEARCH_ITEMS = [
  ...PRODUCTS.map(p => ({ id:p.id, name:p.name, desc:p.desc, emoji:p.emoji, price:p.price, section:'catalog' })),
  ...AC_DATA.map(a => ({ id:a.id, name:a.name, desc:a.specs.join(' · '), emoji:'❄️', price:a.price, section:'appliances' })),
];
try {
  const TV_DATA_RAW = window.TV_DATA_RAW || [];
  TV_DATA_RAW.forEach(t => ALL_SEARCH_ITEMS.push({ id:t.id, name:t.name, desc:t.specs ? t.specs.join(' · ') : '', emoji:'📺', price:t.price, section:'tvs' }));
} catch(e){}

window.openSearch = function() {
  const ov = document.getElementById('searchOverlay');
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchInput').focus(), 150);
};
window.closeSearch = function() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.body.style.overflow = '';
};
window.runSearch = function(query) {
  const box = document.getElementById('searchResults');
  const q = query.trim().toLowerCase();
  if (!q) { box.innerHTML = '<div class="search-hint">Введите название товара, модель или категорию</div>'; return; }
  const hits = ALL_SEARCH_ITEMS.filter(p =>
    p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  ).slice(0, 12);
  if (!hits.length) { box.innerHTML = '<div class="search-no-results">Ничего не найдено 😔 Попробуйте другой запрос</div>'; return; }
  box.innerHTML = hits.map(p => `
    <a class="search-result-card" href="#${p.section}" onclick="closeSearch()">
      <div class="search-result-emoji">${p.emoji}</div>
      <div style="flex:1">
        <div class="search-result-name">${p.name}</div>
        <div class="search-result-desc">${p.desc}</div>
      </div>
      <div class="search-result-price">${p.price.toLocaleString('ru-RU')} сом.</div>
    </a>`).join('');
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSearch(); closeOrderModal(); }
});

/* ══════════════════════════════════════════════════════════════
   11. СТАРТ
   ══════════════════════════════════════════════════════════════ */
renderProducts(PRODUCTS);
renderCart();
