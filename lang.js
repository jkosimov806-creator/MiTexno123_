lang.js

/* ══════════════════════════════════════════════════════════════
   Mi Техно — lang.js   Language switcher RU / TJ
   ══════════════════════════════════════════════════════════════ */

const LANG_KEY = 'mi_lang';

const T = {
  ru: {
    nav_catalog:   'Каталог',
    nav_tvs:       'Телевизоры',
    nav_ac:        'Кондиционеры',
    nav_contacts:  'Контакты',
    cart_label:    'Корзина',
    login_btn:     'Войти',
    hero_title:    'Технологии,<br>которым<br><em>доверяют</em>',
    hero_desc:     'Магазин Xiaomi в Таджикистане. Смартфоны, гаджеты и умные устройства с быстрой доставкой.',
    hero_cta:      'Перейти в каталог',
    hero_connect:  'Связаться',
    stat_clients:  'Клиентов',
    stat_products: 'Товаров',
    stat_years:    'На рынке',
    cat_eyebrow:   'Каталог',
    cat_title:     'Популярные товары',
    cat_all:       'Все товары →',
    filter_all:    'Все',
    filter_phones: 'Смартфоны',
    filter_tablets:'Планшеты',
    filter_wear:   'Носимые',
    filter_audio:  'Аудио',
    filter_smart:  'Умный дом',
    promo_eyebrow: 'Акции',
    promo_title:   'Лучшие предложения',
    reviews_eyebrow: 'Отзывы',
    reviews_title:   'Что говорят клиенты',
    checkout_btn:  'Оформить заказ',
    order_title:   'Оформление заказа',
    order_name:    'Ваше имя',
    order_phone:   'Номер телефона',
    order_submit:  'Отправить заказ',
    order_note:    'Менеджер свяжется с вами в течение 15 минут',
    support_title: 'Мы всегда на связи',
  },
  tj: {
    nav_catalog:   'Каталог',
    nav_tvs:       'Телевизорҳо',
    nav_ac:        'Кондитсионерҳо',
    nav_contacts:  'Тамос',
    cart_label:    'Сабад',
    login_btn:     'Даромадан',
    hero_title:    'Технологияҳое,<br>ки ба онҳо<br><em>бовар мекунанд</em>',
    hero_desc:     'Мағозаи Xiaomi дар Тоҷикистон. Смартфонҳо, гаҷетҳо ва дастгоҳҳои зирак бо таҳвили зуд.',
    hero_cta:      'Ба каталог',
    hero_connect:  'Тамос гирифтан',
    stat_clients:  'Харидорон',
    stat_products: 'Молҳо',
    stat_years:    'Дар бозор',
    cat_eyebrow:   'Каталог',
    cat_title:     'Молҳои машҳур',
    cat_all:       'Ҳама молҳо →',
    filter_all:    'Ҳама',
    filter_phones: 'Смартфонҳо',
    filter_tablets:'Планшетҳо',
    filter_wear:   'Пӯшиданиҳо',
    filter_audio:  'Аудио',
    filter_smart:  'Хонаи зирак',
    promo_eyebrow: 'Акциялар',
    promo_title:   'Беҳтарин пешниҳодҳо',
    reviews_eyebrow: 'Шарҳҳо',
    reviews_title:   'Харидорон чӣ мегӯянд',
    checkout_btn:  'Фармоиш додан',
    order_title:   'Расмиятдарории фармоиш',
    order_name:    'Номи шумо',
    order_phone:   'Рақами телефон',
    order_submit:  'Фиристодан',
    order_note:    'Менеҷер дар давоми 15 дақиқа бо шумо тамос мегирад',
    support_title: 'Мо ҳамеша дар тамосем',
  }
};

function getLang() { return localStorage.getItem(LANG_KEY) || 'ru'; }
function setLang(l) { localStorage.setItem(LANG_KEY, l); applyLang(l); }

function t(key) { return T[getLang()][key]  T['ru'][key]  key; }

function applyLang(lang) {
  const d = T[lang];
  if (!d) return;

  /* Header nav */
  document.querySelectorAll('nav a[href="#catalog"]').forEach(el => el.textContent = d.nav_catalog);
  document.querySelectorAll('nav a[href="#tvs"]').forEach(el => el.textContent = d.nav_tvs);
  document.querySelectorAll('nav a[href="#appliances"]').forEach(el => el.textContent = d.nav_ac);
  document.querySelectorAll('nav a[href="#support"]').forEach(el => el.textContent = d.nav_contacts);

  /* Cart button label */
  const cartLabel = document.querySelector('.cart-label');
  if (cartLabel) cartLabel.textContent = d.cart_label;

  /* Login button */
  const loginBtn = document.querySelector('.auth-login-btn');
  if (loginBtn) loginBtn.innerHTML = <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${d.login_btn};

/* Hero */
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) heroH1.innerHTML = d.hero_title;
  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc) heroDesc.textContent = d.hero_desc;
  const heroCta = document.querySelector('.btn-primary');
  if (heroCta) heroCta.innerHTML = ${d.hero_cta}<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
  const heroConnect = document.querySelector('.btn-secondary');
  if (heroConnect) heroConnect.textContent = d.hero_connect;

  /* Stats */
  const statLabels = document.querySelectorAll('.stat-label');
  const statKeys = ['stat_clients','stat_products','stat_years'];
  statLabels.forEach((el,i) => { if (statKeys[i]) el.textContent = d[statKeys[i]] || el.textContent; });

  /* Catalog section */
  const catEyebrow = document.querySelector('#catalog .section-eyebrow');
  if (catEyebrow) catEyebrow.textContent = d.cat_eyebrow;
  const catTitle = document.querySelector('#catalog .section-title');
  if (catTitle) catTitle.textContent = d.cat_title;
  const catAll = document.querySelector('#catalog .section-link');
  if (catAll) catAll.textContent = d.cat_all;

  /* Filter buttons */
  const filterBtns = document.querySelectorAll('.catalog-filters .filter-btn');
  const filterKeys = ['filter_all','filter_phones','filter_tablets','filter_wear','filter_audio','filter_smart'];
  filterBtns.forEach((b,i) => { if (filterKeys[i]) b.textContent = d[filterKeys[i]] || b.textContent; });

  /* Promo section */
  const promoEy = document.querySelector('#promos .section-eyebrow');
  if (promoEy) promoEy.textContent = d.promo_eyebrow;
  const promoTi = document.querySelector('#promos .section-title');
  if (promoTi) promoTi.textContent = d.promo_title;

  /* Reviews section */
  const revEy = document.querySelector('#reviews .section-eyebrow');
  if (revEy) revEy.textContent = d.reviews_eyebrow;
  const revTi = document.querySelector('#reviews .section-title');
  if (revTi) revTi.textContent = d.reviews_title;

  /* Checkout button */
  document.querySelectorAll('.btn-checkout').forEach(b => {
    b.innerHTML = ${d.checkout_btn}<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
    b.onclick = () => checkoutCart();
  });

  /* Order modal */
  const ordTi = document.querySelector('.order-modal-title');
  if (ordTi) ordTi.textContent = d.order_title;
  const ordName = document.getElementById('orderName');
  if (ordName) ordName.placeholder = d.order_name;
  const ordPhone = document.getElementById('orderPhone');
  if (ordPhone) ordPhone.placeholder = d.order_phone;
  const ordSubmit = document.querySelector('.order-submit-btn');
  if (ordSubmit) ordSubmit.textContent = d.order_submit;
  const ordNote = document.querySelector('.order-note');
  if (ordNote) ordNote.textContent = d.order_note;

  /* Lang toggle active state */
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
}

window.switchLang = function(lang) { setLang(lang); };

window.addEventListener('load', () => { applyLang(getLang()); });
