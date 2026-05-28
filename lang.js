// lang.js — переключение языков (только интерфейс)

// Функция для уведомлений (если showToast не определена)
function showToastSimple(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    const textSpan = document.getElementById('toastText');
    if (textSpan) textSpan.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  } else {
    alert(message);
  }
}

// Глобальная функция переключения языков
window.switchLang = function(lang) {
  console.log('switchLang called with', lang);
  
  // Обновляем активную кнопку
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });
  
  // Сохраняем выбор
  localStorage.setItem('lang', lang);
  
  // Переводы
  const t = {
    ru: {
      catalog: 'Каталог', tv: 'Телевизоры', ac: 'Кондиционеры', contacts: 'Контакты',
      cart: 'Корзина', btn_catalog: 'Перейти в каталог', btn_contact: 'Связаться',
      filter_all: 'Все', filter_floor: 'Стоячие кондиционеры', filter_wall: 'Настенные кондиционеры',
      cart_empty: 'Корзина пуста', cart_empty_desc: 'Добавьте товары из каталога', cart_total: 'Итого',
      order_title: 'Оформление заказа', order_name: 'Ваше имя', order_phone: 'Номер телефона',
      order_note: 'Менеджер свяжется с вами в течение 15 минут', btn_submit: 'Отправить заказ',
      order_success: 'Заказ принят!', order_success_desc: 'Менеджер свяжется с вами в течение 15 минут.',
      btn_close: 'Закрыть', chat_placeholder: 'Написать сообщение...',
      section_all_models: 'Все модели →', search_hint: 'Введите название товара...',
      burger_categories: 'Категории', burger_account: 'Аккаунт', burger_profile: 'Личный кабинет',
      footer_catalog: 'Каталог', footer_customers: 'Покупателям', footer_contacts: 'Контакты',
      footer_delivery: 'Доставка и оплата', footer_return: 'Возврат', footer_installment: 'Рассрочка Алиф Салом',
      footer_smartphones: 'Смартфоны', footer_tablets: 'Планшеты', footer_tvs: 'Телевизоры', footer_audio: 'Аудио', footer_smart_home: 'Умный дом',
      feature_delivery: 'Быстрая доставка',
      feature_delivery_desc: 'Доставка 1–3 дня по всей стране. Самовывоз из наших магазинов.',
      feature_support: 'Поддержка 24/7',
      feature_support_desc: 'Консультация по выбору и помощь с настройкой устройства.',
      feature_installment: 'Рассрочка Алиф Салом',
      feature_installment_desc: 'Рассрочка 20% на 12 месяцев. Быстрое одобрение за 5 минут.',
      feature_return: 'Лёгкий возврат',
      feature_return_desc: '1 год гарантии на заводской дефект',
      feature_original: '100% оригинал',
      feature_original_desc: 'Все товары Оригинал с самого Китая',
      feature_store: 'Магазин в Худжанде',
      feature_store_desc: 'Приходите, потрогайте вживую. Опытные консультанты всегда рядом.'
    },
    tj: {
      catalog: 'Каталог', tv: 'Телевизорҳо', ac: 'Кондитсионерҳо', contacts: 'Тамос',
      cart: 'Сабад', btn_catalog: 'Гузаштан ба каталог', btn_contact: 'Тамос гиред',
      filter_all: 'Ҳама', filter_floor: 'Кондитсионерҳои истода', filter_wall: 'Кондитсионерҳои деворӣ',
      cart_empty: 'Сабад холӣ аст', cart_empty_desc: 'Маҳсулотро аз каталог илова кунед', cart_total: 'Ҳамагӣ',
      order_title: 'Фармоиш додан', order_name: 'Номи шумо', order_phone: 'Рақами телефон',
      order_note: 'Мудир дар давоми 15 дақиқа бо шумо тамос мегирад', btn_submit: 'Фиристодани фармоиш',
      order_success: 'Фармоиш қабул шуд!', order_success_desc: 'Мудир дар давоми 15 дақиқа тамос мегирад.',
      btn_close: 'Пӯшидан', chat_placeholder: 'Паём нависед...',
      section_all_models: 'Ҳамаи моделҳо →', search_hint: 'Номи маҳсулотро ворид кунед...',
      burger_categories: 'Категорияҳо', burger_account: 'Ҳисоб', burger_profile: 'Ҳисоби шахсӣ',
      footer_catalog: 'Каталог', footer_customers: 'Ба харидорон', footer_contacts: 'Тамос',
      footer_delivery: 'Расонидан ва пардохт', footer_return: 'Баргардонидан', footer_installment: 'Тақсим Алиф Салом',
      footer_smartphones: 'Смартфонҳо', footer_tablets: 'Планшетҳо', footer_tvs: 'Телевизорҳо', footer_audio: 'Аудио', footer_smart_home: 'Хонаи оқил',
      feature_delivery: 'Расонидани зуд',
      feature_delivery_desc: 'Расонидан 1–3 рӯз дар саросари кишвар. Худрав аз мағозаҳои мо.',
      feature_support: 'Дастгирӣ 24/7',
      feature_support_desc: 'Машварат оид ба интихоб ва кӯмак дар танзими дастгоҳ.',
      feature_installment: 'Тақсим Алиф Салом',
      feature_installment_desc: 'Тақсим 20% ба 12 моҳ. Тасдиқи зуд дар 5 дақиқа.',
      feature_return: 'Баргардонидани осон',
      feature_return_desc: '1 сол кафолат ба нуқсони заводӣ',
      feature_original: '100% асл',
      feature_original_desc: 'Ҳама молҳо Асл аз худи Хитой',
      feature_store: 'Мағоза дар Хуҷанд',
      feature_store_desc: 'Биёед, зинда ламс кунед. Машваратчиёни ботаҷриба ҳамеша дар назди ҳастанд.'
    }
  };
  
  // 1. Навигация в шапке
  const navLinks = document.querySelectorAll('header nav a');
  if (navLinks.length >= 4) {
    navLinks[0].innerHTML = t[lang].catalog;
    navLinks[1].innerHTML = t[lang].tv;
    navLinks[2].innerHTML = t[lang].ac;
    navLinks[3].innerHTML = t[lang].contacts;
  }
  
  // 2. Кнопка корзины
  const cartLabel = document.querySelector('.cart-label');
  if (cartLabel) cartLabel.innerHTML = t[lang].cart;
  
  // 3. Кнопки hero
  const btnPrimary = document.querySelector('.btn-primary');
  if (btnPrimary) {
    btnPrimary.innerHTML = t[lang].btn_catalog + ' <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  }
  
  const btnSecondary = document.querySelector('.btn-secondary');
  if (btnSecondary) btnSecondary.innerHTML = t[lang].btn_contact;
  
  // 4. Фильтры кондиционеров
  const filterBtns = document.querySelectorAll('#appliances .filter-btn');
  if (filterBtns.length >= 3) {
    filterBtns[0].innerHTML = t[lang].filter_all;
    filterBtns[1].innerHTML = t[lang].filter_floor;
    filterBtns[2].innerHTML = t[lang].filter_wall;
  }
  
  // 5. Ссылки "Все модели →"
  document.querySelectorAll('.section-link').forEach(link => {
    if (link.innerHTML.includes('Все модели') || link.innerHTML.includes('Ҳамаи моделҳо')) {
      link.innerHTML = t[lang].section_all_models;
    }
  });
  
  // 6. Бургер-меню
  const burgerLabels = document.querySelectorAll('.burger-section-label');
  burgerLabels.forEach(label => {
    const text = label.innerText;
    if (text === 'Категории' || text === 'Категорияҳо') label.innerText = t[lang].burger_categories;
    if (text === 'Аккаунт' || text === 'Ҳисоб') label.innerText = t[lang].burger_account;
  });
  
  const burgerProfile = document.querySelector('#burgerCabinetBtn .burger-item-name');
  if (burgerProfile) burgerProfile.innerText = t[lang].burger_profile;
  
  // 7. Футер
  const footerTitles = document.querySelectorAll('.footer-col h4');
  if (footerTitles.length >= 3) {
    footerTitles[0].innerHTML = t[lang].footer_catalog;
    footerTitles[1].innerHTML = t[lang].footer_customers;
    footerTitles[2].innerHTML = t[lang].footer_contacts;
  }
  
  const footerLinks = document.querySelectorAll('.footer-col a');
  const linkTexts = ['footer_smartphones', 'footer_tablets', 'footer_tvs', 'footer_audio', 'footer_smart_home', 'footer_delivery', 'footer_return', 'footer_installment'];
  footerLinks.forEach((link, i) => {
    if (i < linkTexts.length && t[lang][linkTexts[i]]) {
      link.innerHTML = t[lang][linkTexts[i]];
    }
  });
  
  // 8. Чат
  const chatInput = document.querySelector('.chat-input');
  if (chatInput) chatInput.placeholder = t[lang].chat_placeholder;
  
  // 9. Корзина
  const cartEmpty = document.querySelector('.cart-empty p');
  if (cartEmpty) cartEmpty.innerHTML = t[lang].cart_empty + '<br><small>' + t[lang].cart_empty_desc + '</small>';
  
  const cartTotalLabel = document.querySelector('.cart-total-label');
  if (cartTotalLabel) cartTotalLabel.innerHTML = t[lang].cart_total;
  
  // 10. Модальное окно заказа
  const orderTitle = document.querySelector('.order-modal-title');
  if (orderTitle) orderTitle.innerHTML = t[lang].order_title;
  
  const orderNameLabel = document.querySelector('.order-field:first-child .order-label');
  if (orderNameLabel) orderNameLabel.innerHTML = t[lang].order_name;
  
  const orderPhoneLabel = document.querySelector('.order-field:last-child .order-label');
  if (orderPhoneLabel) orderPhoneLabel.innerHTML = t[lang].order_phone;
  
  const orderNote = document.querySelector('.order-note');
  if (orderNote) orderNote.innerHTML = t[lang].order_note;
  
  const orderSubmit = document.querySelector('#orderFormView .order-submit-btn');
  if (orderSubmit) orderSubmit.innerHTML = t[lang].btn_submit;
  
  const orderSuccessTitle = document.querySelector('.order-success-title');
  if (orderSuccessTitle) orderSuccessTitle.innerHTML = t[lang].order_success;
  
  const orderSuccessDesc = document.querySelector('.order-success-desc');
  if (orderSuccessDesc) orderSuccessDesc.innerHTML = t[lang].order_success_desc;
  
  const closeBtn = document.querySelector('#orderSuccess .order-submit-btn');
  if (closeBtn) closeBtn.innerHTML = t[lang].btn_close;
  
  // 11. Поиск
  const searchHint = document.querySelector('.search-hint');
  if (searchHint) searchHint.innerHTML = t[lang].search_hint;
  
  // 12. Фичи (преимущества)
  const featureTitles = document.querySelectorAll('.feature-title');
  const featureDescs = document.querySelectorAll('.feature-desc');
  const featureTitleKeys = ['feature_delivery', 'feature_support', 'feature_installment', 'feature_return', 'feature_original', 'feature_store'];
  const featureDescKeys = ['feature_delivery_desc', 'feature_support_desc', 'feature_installment_desc', 'feature_return_desc', 'feature_original_desc', 'feature_store_desc'];
  
  featureTitles.forEach((title, index) => {
    if (index < featureTitleKeys.length && t[lang][featureTitleKeys[index]]) {
      title.innerHTML = t[lang][featureTitleKeys[index]];
    }
  });
  
  featureDescs.forEach((desc, index) => {
    if (index < featureDescKeys.length && t[lang][featureDescKeys[index]]) {
      desc.innerHTML = t[lang][featureDescKeys[index]];
    }
  });
  
  // Уведомление
  if (typeof showToast === 'function') {
    showToast(lang === 'ru' ? 'Язык изменён на русский' : 'Забон ба тоҷикӣ иваз карда шуд');
  } else {
    showToastSimple(lang === 'ru' ? 'Язык изменён на русский' : 'Забон ба тоҷикӣ иваз карда шуд');
  }
};

// Загрузка сохранённого языка
document.addEventListener('DOMContentLoaded', function() {
  const savedLang = localStorage.getItem('lang');
  if (savedLang === 'tj') {
    window.switchLang('tj');
  } else {
    window.switchLang('ru');
  }
});

// Для отладки
console.log('lang.js loaded, switchLang available:', typeof window.switchLang);
