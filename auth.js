/* ══════════════════════════════════════════════════════════════
   Mi Техно — auth.js
   Google Sign-In + Email/Password + Личный кабинет
   ══════════════════════════════════════════════════════════════

   ► Как включить Google-вход:
     1. Зайдите на https://console.cloud.google.com/
     2. Создайте проект → API и сервисы → Учётные данные
     3. Создайте OAuth 2.0 → Тип: Веб-приложение
     4. Добавьте в "Разрешённые источники JavaScript" адрес вашего сайта
     5. Скопируйте Client ID и вставьте ниже
   ══════════════════════════════════════════════════════════════ */

const GOOGLE_CLIENT_ID = '528212733361-lmin837nv9b27a3va57a81cujsd67dnq.apps.googleusercontent.com';

const STORAGE_SESSION  = 'mi_session';
const STORAGE_USERS    = 'mi_users';
const STORAGE_BONUSES  = 'mi_bonuses';
const STORAGE_ORDERS   = 'mi_orders';
const STORAGE_WISHLIST = 'mi_wishlist';

/* ══════════════════════════════════════════════════════════════
   ВСПОМОГАТЕЛЬНЫЕ
   ══════════════════════════════════════════════════════════════ */
function getSession()   { try { return JSON.parse(localStorage.getItem(STORAGE_SESSION)); } catch { return null; } }
function saveSession(u) { localStorage.setItem(STORAGE_SESSION, JSON.stringify(u)); }
function clearSession() { localStorage.removeItem(STORAGE_SESSION); }

function getUsers()     { try { return JSON.parse(localStorage.getItem(STORAGE_USERS)) || []; } catch { return []; } }
function saveUsers(u)   { localStorage.setItem(STORAGE_USERS, JSON.stringify(u)); }

function hashPass(p) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = Math.imul(31, h) + p.charCodeAt(i) | 0;
  return h.toString(36);
}

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
  } catch { return null; }
}

function getInitials(name) {
  return (name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('ru-RU', { day:'2-digit', month:'short', year:'numeric' });
}

function genRefCode(userId) {
  const seed = userId.replace(/\D/g,'').slice(-4) || '0000';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MI-';
  for (let i = 0; i < 4; i++) code += chars[(parseInt(seed[i] || i) + i * 7) % chars.length];
  return code;
}

/* ══════════════════════════════════════════════════════════════
   БОНУСНАЯ СИСТЕМА
   ══════════════════════════════════════════════════════════════ */
function getBonusData(uid) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_BONUSES)) || {};
    return all[uid] || { balance: 0, transactions: [] };
  } catch { return { balance: 0, transactions: [] }; }
}

function saveBonusData(uid, data) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_BONUSES)) || {};
    all[uid] = data;
    localStorage.setItem(STORAGE_BONUSES, JSON.stringify(all));
  } catch {}
}

function awardBonuses(uid, amount, desc) {
  const data = getBonusData(uid);
  data.balance = (data.balance || 0) + amount;
  data.transactions = [{ date: Date.now(), desc, amount, type: 'credit' }, ...(data.transactions || [])].slice(0, 50);
  saveBonusData(uid, data);
}

function spendBonuses(uid, amount, desc) {
  const data = getBonusData(uid);
  data.balance = Math.max(0, (data.balance || 0) - amount);
  data.transactions = [{ date: Date.now(), desc, amount: -amount, type: 'debit' }, ...(data.transactions || [])].slice(0, 50);
  saveBonusData(uid, data);
}

function getBonusLevel(totalEarned) {
  if (totalEarned >= 5000) return { name:'Золото',  icon:'🥇', color:'#F59E0B', next: null,  nextVal: null };
  if (totalEarned >= 1000) return { name:'Серебро', icon:'🥈', color:'#94A3B8', next:'Золото', nextVal: 5000 };
  return                          { name:'Бронза',  icon:'🥉', color:'#CD7F32', next:'Серебро', nextVal: 1000 };
}

/* ══════════════════════════════════════════════════════════════
   ИСТОРИЯ ЗАКАЗОВ
   ══════════════════════════════════════════════════════════════ */
function getOrders(uid) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_ORDERS)) || {};
    return all[uid] || [];
  } catch { return []; }
}

function saveOrders(uid, orders) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_ORDERS)) || {};
    all[uid] = orders;
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(all));
  } catch {}
}

window.saveOrder = function(items, total) {
  const user = getSession();
  if (!user) return;
  const orders = getOrders(user.id);
  const bonusEarned = Math.round(total * 0.05);
  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
  orders.unshift({
    id: orderId,
    date: Date.now(),
    items: items.map(i => ({ name:i.name, emoji:i.emoji, qty:i.qty, price:i.price })),
    total,
    bonusEarned,
    status: 'processing'
  });
  saveOrders(user.id, orders.slice(0, 30));
  awardBonuses(user.id, bonusEarned, 'За заказ ' + orderId);
  renderBonusBadge();
};

/* ══════════════════════════════════════════════════════════════
   ИЗБРАННОЕ
   ══════════════════════════════════════════════════════════════ */
function getWishlist(uid) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_WISHLIST)) || {};
    return all[uid] || [];
  } catch { return []; }
}

function saveWishlist(uid, list) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_WISHLIST)) || {};
    all[uid] = list;
    localStorage.setItem(STORAGE_WISHLIST, JSON.stringify(all));
  } catch {}
}

window.isInWishlist = function(id) {
  const user = getSession();
  if (!user) return false;
  return getWishlist(user.id).some(i => i.id === id);
};

window.toggleWishlistItem = function(item, el) {
  const user = getSession();
  if (!user) { openAuthModal('login'); showToast('Войдите, чтобы добавить в избранное'); return; }
  let list = getWishlist(user.id);
  const idx = list.findIndex(i => i.id === item.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    if (el) el.classList.remove('wished');
    showToast('Удалено из избранного');
  } else {
    list.unshift(item);
    if (el) el.classList.add('wished');
    showToast('❤️ Добавлено в избранное');
  }
  saveWishlist(user.id, list);
  renderWishCount();
};

/* ══════════════════════════════════════════════════════════════
   РЕНДЕР ШАПКИ
   ══════════════════════════════════════════════════════════════ */
function renderBonusBadge() {
  const user = getSession();
  const badge = document.getElementById('headerBonusBadge');
  if (!badge || !user) return;
  const d = getBonusData(user.id);
  badge.textContent = d.balance.toLocaleString('ru-RU') + ' ₽';
  badge.style.display = d.balance > 0 ? 'inline-flex' : 'none';
}

function renderWishCount() {
  const user = getSession();
  const el = document.getElementById('headerWishCount');
  if (!el) return;
  if (!user) { el.style.display = 'none'; return; }
  const count = getWishlist(user.id).length;
  el.textContent = count;
  el.style.display = count > 0 ? 'flex' : 'none';
}

function renderAuthState() {
  const user = getSession();
  const wrap = document.getElementById('authArea');
  if (!wrap) return;

  if (!user) {
    wrap.innerHTML = `
      <button class="auth-login-btn" onclick="openAuthModal('login')">
        <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Войти
      </button>`;
  } else {
    const avatarHtml = user.picture
      ? `<img src="${user.picture}" alt="" class="user-avatar-img" referrerpolicy="no-referrer">`
      : `<span class="user-avatar-initials">${getInitials(user.name)}</span>`;

    wrap.innerHTML = `
      <div class="user-chip" onclick="toggleUserMenu(event)">
        <div class="user-avatar">${avatarHtml}</div>
        <span class="user-name">${user.name.split(' ')[0]}</span>
        <svg class="user-chevron" width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-info">
            <div class="user-dropdown-name">${user.name}</div>
            <div class="user-dropdown-email">${user.email}</div>
          </div>
          <div class="user-dropdown-divider"></div>
          <button class="user-dropdown-item" onclick="openCabinet('bonuses')">
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Личный кабинет
          </button>
          <button class="user-dropdown-item" onclick="openCabinet('wishlist')">
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            Избранное
          </button>
          <div class="user-dropdown-divider"></div>
          <button class="user-dropdown-item logout-item" onclick="logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Выйти
          </button>
        </div>
      </div>`;

    setTimeout(renderBonusBadge, 0);
    setTimeout(renderWishCount, 0);
  }

  renderAuthMobBtn(user);
  setTimeout(refreshAllWishHearts, 100);
}

function renderAuthMobBtn(user) {
  const mob = document.getElementById('mobAuthItem');
  if (!mob) return;
  if (!user) {
    mob.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>Войти</span>`;
    mob.onclick = () => openAuthModal('login');
    mob.classList.remove('mob-auth-logged');
  } else {
    const avatarHtml = user.picture
      ? `<img src="${user.picture}" class="mob-user-avatar-img" referrerpolicy="no-referrer">`
      : `<span class="mob-user-initials">${getInitials(user.name)}</span>`;
    mob.innerHTML = `<div class="mob-user-avatar">${avatarHtml}</div><span>${user.name.split(' ')[0]}</span>`;
    mob.onclick = () => openCabinet('overview');
    mob.classList.add('mob-auth-logged');
  }
}

/* ══════════════════════════════════════════════════════════════
   DROPDOWN
   ══════════════════════════════════════════════════════════════ */
window.toggleUserMenu = function(e) {
  e.stopPropagation();
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('open');
};
document.addEventListener('click', () => {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.remove('open');
});

/* ══════════════════════════════════════════════════════════════
   AUTH MODAL (login / register)
   ══════════════════════════════════════════════════════════════ */
window.openAuthModal = function(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchTab(tab);
  clearAuthErrors();
};

window.closeAuthModal = function() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
};

window.switchTab = function(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
  clearAuthErrors();
  if (tab !== 'profile') initGoogleButtons();
};

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(e => { e.textContent = ''; e.style.display = 'none'; });
  document.querySelectorAll('.auth-input').forEach(i => i.classList.remove('error'));
}

function showError(panelSel, msg) {
  const el = document.querySelector(`${panelSel} .auth-error`);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

/* ══════════════════════════════════════════════════════════════
   ЛИЧНЫЙ КАБИНЕТ — DRAWER
   ══════════════════════════════════════════════════════════════ */
window.openCabinet = function(tab = 'overview') {
  const user = getSession();
  if (!user) { openAuthModal('login'); return; }
  const el = document.getElementById('cabinetDrawer');
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.remove('open');
  switchCabinetTab(tab);
};

window.closeCabinet = function() {
  const el = document.getElementById('cabinetDrawer');
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
};

window.switchCabinetTab = function(tab) {
  document.querySelectorAll('.cab-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.cab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
  const renders = { overview: renderCabOverview, bonuses: renderCabBonuses, orders: renderCabOrders, wishlist: renderCabWishlist, referral: renderCabReferral };
  if (renders[tab]) renders[tab]();
};

/* ── Overview ────────────────────────────────────────────── */
function renderCabOverview() {
  const user = getSession();
  if (!user) return;
  const panel = document.querySelector('.cab-panel[data-panel="overview"]');
  if (!panel) return;

  const bonus  = getBonusData(user.id);
  const orders = getOrders(user.id);
  const wish   = getWishlist(user.id);
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalEarned = bonus.transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const level  = getBonusLevel(totalEarned);
  const avatarHtml = user.picture
    ? `<img src="${user.picture}" class="cab-avatar-img" referrerpolicy="no-referrer">`
    : `<span class="cab-avatar-initials">${getInitials(user.name)}</span>`;

  panel.innerHTML = `
    <div class="cab-overview-hero">
      <div class="cab-ov-avatar">${avatarHtml}</div>
      <div class="cab-ov-info">
        <div class="cab-ov-name">${user.name}</div>
        <div class="cab-ov-email">${user.email}</div>
        <div class="cab-ov-level" style="color:${level.color}">${level.icon} ${level.name}</div>
      </div>
    </div>
    <div class="cab-stats-grid">
      <div class="cab-stat" onclick="switchCabinetTab('bonuses')">
        <div class="cab-stat-icon">💰</div>
        <div class="cab-stat-val">${bonus.balance.toLocaleString('ru-RU')}</div>
        <div class="cab-stat-label">Бонусов сом.</div>
      </div>
      <div class="cab-stat" onclick="switchCabinetTab('orders')">
        <div class="cab-stat-icon">📦</div>
        <div class="cab-stat-val">${orders.length}</div>
        <div class="cab-stat-label">Заказов</div>
      </div>
      <div class="cab-stat" onclick="switchCabinetTab('wishlist')">
        <div class="cab-stat-icon">❤️</div>
        <div class="cab-stat-val">${wish.length}</div>
        <div class="cab-stat-label">Избранных</div>
      </div>
      <div class="cab-stat">
        <div class="cab-stat-icon">🛍️</div>
        <div class="cab-stat-val">${totalSpent.toLocaleString('ru-RU')}</div>
        <div class="cab-stat-label">Потрачено сом.</div>
      </div>
    </div>
    ${user.provider === 'google' ? '<div class="cab-provider-note"><svg width="12" height="12" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Вход через Google</div>' : ''}
  `;
}

/* ── Бонусы ──────────────────────────────────────────────── */
function renderCabBonuses() {
  const user = getSession();
  if (!user) return;
  const panel = document.querySelector('.cab-panel[data-panel="bonuses"]');
  if (!panel) return;

  const bonus  = getBonusData(user.id);
  const totalEarned = bonus.transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const level  = getBonusLevel(totalEarned);
  const progressPct = level.nextVal
    ? Math.min(100, Math.round((totalEarned / level.nextVal) * 100))
    : 100;

  const txHtml = bonus.transactions.length
    ? bonus.transactions.map(t => `
        <div class="bonus-tx ${t.type}">
          <div class="bonus-tx-icon">${t.type === 'credit' ? '➕' : '➖'}</div>
          <div class="bonus-tx-info">
            <div class="bonus-tx-desc">${t.desc}</div>
            <div class="bonus-tx-date">${formatDate(t.date)}</div>
          </div>
          <div class="bonus-tx-amount ${t.type}">${t.type === 'credit' ? '+' : ''}${t.amount.toLocaleString('ru-RU')} сом.</div>
        </div>`).join('')
    : '<div class="cab-empty">Пока нет транзакций. Сделайте первый заказ!</div>';

  panel.innerHTML = `
    <div class="bonus-balance-card" style="--level-color:${level.color}">
      <div class="bonus-balance-label">Ваш баланс</div>
      <div class="bonus-balance-val">${bonus.balance.toLocaleString('ru-RU')} <span>сом.</span></div>
      <div class="bonus-balance-level">${level.icon} Уровень ${level.name}</div>
      ${level.nextVal ? `
        <div class="bonus-progress-wrap">
          <div class="bonus-progress-bar"><div class="bonus-progress-fill" style="width:${progressPct}%"></div></div>
          <div class="bonus-progress-labels">
            <span>${totalEarned.toLocaleString('ru-RU')} сом.</span>
            <span>до ${level.next}: ${level.nextVal.toLocaleString('ru-RU')} сом.</span>
          </div>
        </div>` : '<div class="bonus-max-badge">🏆 Максимальный уровень!</div>'}
    </div>
    <div class="bonus-how">
      <div class="bonus-how-title">Как зарабатывать бонусы</div>
      <div class="bonus-how-list">
        <div class="bonus-how-item"><span class="bonus-how-icon">🛍️</span><div><strong>5% от каждого заказа</strong><small>Начисляется автоматически</small></div></div>
        <div class="bonus-how-item"><span class="bonus-how-icon">👥</span><div><strong>300 сом. за реферала</strong><small>Пригласите друга в Mi Техно</small></div></div>
        <div class="bonus-how-item"><span class="bonus-how-icon">🎁</span><div><strong>200 сом. за регистрацию</strong><small>Приветственный подарок</small></div></div>
      </div>
    </div>
    <div class="bonus-tx-list">
      <div class="bonus-tx-title">История транзакций</div>
      ${txHtml}
    </div>`;
}

/* ── Заказы ──────────────────────────────────────────────── */
function renderCabOrders() {
  const user = getSession();
  if (!user) return;
  const panel = document.querySelector('.cab-panel[data-panel="orders"]');
  if (!panel) return;

  const orders = getOrders(user.id);
  const STATUS = { processing:'🟡 Обрабатывается', shipped:'🚚 Доставляется', done:'✅ Доставлен' };

  if (!orders.length) {
    panel.innerHTML = `
      <div class="cab-empty-big">
        <div class="cab-empty-icon">📦</div>
        <div class="cab-empty-title">Заказов пока нет</div>
        <div class="cab-empty-sub">Выберите товары в каталоге и оформите первый заказ</div>
        <button class="cab-empty-btn" onclick="closeCabinet()">Перейти в каталог</button>
      </div>`;
    return;
  }

  panel.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-card-head">
        <div>
          <div class="order-id">${o.id}</div>
          <div class="order-date">${formatDate(o.date)}</div>
        </div>
        <div class="order-status">${STATUS[o.status] || STATUS.processing}</div>
      </div>
      <div class="order-items">
        ${o.items.map(i => `<div class="order-item"><span class="order-item-emoji">${i.emoji}</span><span class="order-item-name">${i.name}</span><span class="order-item-qty">×${i.qty}</span><span class="order-item-price">${(i.price*i.qty).toLocaleString('ru-RU')} сом.</span></div>`).join('')}
      </div>
      <div class="order-card-foot">
        <div class="order-total">Итого: <strong>${o.total.toLocaleString('ru-RU')} сом.</strong></div>
        ${o.bonusEarned ? `<div class="order-bonus-earned">+${o.bonusEarned} бонусов начислено</div>` : ''}
      </div>
    </div>`).join('');
}

/* ── Избранное ───────────────────────────────────────────── */
function renderCabWishlist() {
  const user = getSession();
  if (!user) return;
  const panel = document.querySelector('.cab-panel[data-panel="wishlist"]');
  if (!panel) return;

  const list = getWishlist(user.id);
  if (!list.length) {
    panel.innerHTML = `
      <div class="cab-empty-big">
        <div class="cab-empty-icon">❤️</div>
        <div class="cab-empty-title">Избранное пусто</div>
        <div class="cab-empty-sub">Нажмите ❤️ на любом товаре, чтобы сохранить</div>
        <button class="cab-empty-btn" onclick="closeCabinet()">Смотреть товары</button>
      </div>`;
    return;
  }

  panel.innerHTML = `<div class="wish-grid">` + list.map(item => `
    <div class="wish-card">
      <button class="wish-remove" onclick="removeFromWishlist('${item.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="wish-emoji">${item.emoji}</div>
      <div class="wish-name">${item.name}</div>
      <div class="wish-price">${item.price.toLocaleString('ru-RU')} сом.</div>
      <button class="wish-add-btn" onclick="addToCart('${item.id}','${item.name}',${item.price},'${item.emoji}');closeCabinet()">В корзину</button>
    </div>`).join('') + `</div>`;
}

window.removeFromWishlist = function(id) {
  const user = getSession();
  if (!user) return;
  let list = getWishlist(user.id);
  list = list.filter(i => i.id !== id);
  saveWishlist(user.id, list);
  refreshAllWishHearts();
  renderWishCount();
  renderCabWishlist();
};

/* ── Реферальная программа ──────────────────────────────── */
function renderCabReferral() {
  const user = getSession();
  if (!user) return;
  const panel = document.querySelector('.cab-panel[data-panel="referral"]');
  if (!panel) return;

  const code = genRefCode(user.id);
  const link = window.location.origin + '/?ref=' + code;

  panel.innerHTML = `
    <div class="ref-hero">
      <div class="ref-hero-icon">🎁</div>
      <div class="ref-hero-title">Пригласите друзей</div>
      <div class="ref-hero-sub">Вы получите <strong>300 сом. бонусов</strong> за каждого друга, который зарегистрируется по вашей ссылке</div>
    </div>
    <div class="ref-code-wrap">
      <div class="ref-code-label">Ваш промокод</div>
      <div class="ref-code-box">
        <span class="ref-code">${code}</span>
        <button class="ref-copy-btn" onclick="copyRef('${code}', this)">
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Копировать
        </button>
      </div>
    </div>
    <div class="ref-link-wrap">
      <div class="ref-code-label">Или поделитесь ссылкой</div>
      <div class="ref-link-box">
        <span class="ref-link-text">${link}</span>
        <button class="ref-copy-btn" onclick="copyRef('${link}', this)">Копировать</button>
      </div>
    </div>
    <div class="ref-how">
      <div class="ref-how-step"><div class="ref-step-num">1</div><div>Поделитесь кодом или ссылкой с другом</div></div>
      <div class="ref-how-step"><div class="ref-step-num">2</div><div>Друг регистрируется в Mi Техно</div></div>
      <div class="ref-how-step"><div class="ref-step-num">3</div><div>Вы получаете <strong>300 сом.</strong> бонусов сразу</div></div>
    </div>`;
}

window.copyRef = function(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Скопировано';
    btn.style.color = '#22C55E';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
  }).catch(() => showToast('Не удалось скопировать'));
};

/* ══════════════════════════════════════════════════════════════
   WISHLIST HEARTS (на карточках товаров)
   ══════════════════════════════════════════════════════════════ */
function refreshAllWishHearts() {
  document.querySelectorAll('.wish-heart').forEach(btn => {
    const id = btn.dataset.id;
    btn.classList.toggle('wished', isInWishlist(id));
  });
}

/* ══════════════════════════════════════════════════════════════
   GOOGLE SIGN-IN
   ══════════════════════════════════════════════════════════════ */
function initGoogleAuth() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') return;
  if (typeof google === 'undefined') return;

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin',
    ux_mode: 'popup',
  });

  initGoogleButtons();
}

function initGoogleButtons() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') return;
  if (typeof google === 'undefined') return;

  setTimeout(() => {
    ['googleBtnLogin','googleBtnRegister'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '';
      google.accounts.id.renderButton(el, {
        type: 'standard', shape: 'rectangular', theme: 'outline',
        text: id === 'googleBtnRegister' ? 'signup_with' : 'signin_with',
        size: 'large', width: el.offsetWidth || 320, locale: 'ru',
      });
    });
  }, 50);
}

function handleGoogleCredential(response) {
  const payload = decodeJWT(response.credential);
  if (!payload) { showError('[data-panel="login"]', 'Ошибка Google Sign-In'); return; }

  const isNew = !getUsers().find(u => u.id === payload.sub);
  const user = { id: payload.sub, name: payload.name, email: payload.email, picture: payload.picture, provider: 'google' };

  saveSession(user);
  const users = getUsers();
  if (!users.find(u => u.id === user.id)) { users.push(user); saveUsers(users); }

  if (isNew) {
    awardBonuses(user.id, 200, 'Приветственный бонус за регистрацию');
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) awardBonuses(user.id, 100, 'Бонус за приход по реферальной ссылке');
  }

  closeAuthModal();
  renderAuthState();
  showToast('Добро пожаловать, ' + user.name.split(' ')[0] + '! 🎉');
  if (isNew) setTimeout(() => openCabinet('bonuses'), 500);
}

/* ══════════════════════════════════════════════════════════════
   EMAIL / PASSWORD AUTH
   ══════════════════════════════════════════════════════════════ */
window.doLogin = function() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  clearAuthErrors();

  if (!email || !pass) { showError('[data-panel="login"]', 'Заполните все поля'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { showError('[data-panel="login"]', 'Неверный email'); return; }

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.hash === hashPass(pass));
  if (!user) { showError('[data-panel="login"]', 'Неверный email или пароль'); return; }

  saveSession(user);
  closeAuthModal();
  renderAuthState();
  showToast('Добро пожаловать, ' + user.name.split(' ')[0] + '!');
};

window.doRegister = function() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass  = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  clearAuthErrors();

  if (!name || !email || !pass || !pass2) { showError('[data-panel="register"]', 'Заполните все поля'); return; }
  if (!/\S+@\S+\.\S+/.test(email)) { showError('[data-panel="register"]', 'Неверный формат email'); return; }
  if (pass.length < 6) { showError('[data-panel="register"]', 'Пароль минимум 6 символов'); return; }
  if (pass !== pass2) { showError('[data-panel="register"]', 'Пароли не совпадают'); return; }

  const users = getUsers();
  if (users.find(u => u.email === email)) { showError('[data-panel="register"]', 'Email уже зарегистрирован'); return; }

  const newUser = { id: 'local_' + Date.now(), name, email, picture: null, provider: 'email', hash: hashPass(pass) };
  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);

  awardBonuses(newUser.id, 200, 'Приветственный бонус за регистрацию');
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) awardBonuses(newUser.id, 100, 'Бонус за приход по реферальной ссылке');

  closeAuthModal();
  renderAuthState();
  showToast('Аккаунт создан! Добро пожаловать, ' + name.split(' ')[0] + '! 🎉');
  setTimeout(() => openCabinet('bonuses'), 500);
};

window.logout = function() {
  clearSession();
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.remove('open');
  closeCabinet();
  closeAuthModal();
  renderAuthState();
  showToast('Вы вышли из аккаунта');
};

/* ══════════════════════════════════════════════════════════════
   KEYBOARD
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeAuthModal(); closeCabinet(); }
});

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
let _googleInited = false;
function tryInitGoogle() {
  if (_googleInited) return;
  if (typeof google === 'undefined') return;
  _googleInited = true;
  initGoogleAuth();
}

window.addEventListener('load', () => {
  renderAuthState();
  tryInitGoogle();
});
window.addEventListener('google-loaded', tryInitGoogle);
