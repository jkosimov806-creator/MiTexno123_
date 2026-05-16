let allProducts = [];
let cart = {};

document.addEventListener('DOMContentLoaded', initStore);

async function initStore() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        
        renderCategoriesMenu();
        renderProducts('all');
    } catch (err) {
        document.getElementById('products-grid').innerHTML = '<p>Не удалось загрузить товары.</p>';
    }
}

// Автоматически строим меню категорий на основе листов Гугл Таблицы
function renderCategoriesMenu() {
    const menu = document.getElementById('categories-menu');
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.innerText = cat;
        li.onclick = () => filterCategory(cat, li);
        menu.appendChild(li);
    });
}

function filterCategory(category, element) {
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');
    else document.querySelector('.category-item').classList.add('active');

    document.getElementById('catalog-title').innerText = category === 'all' ? '📦 Все товары' : `Category: ${category}`;
    renderProducts(category);
}

function renderProducts(category) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
    
    if(filtered.length === 0) {
        grid.innerHTML = '<p>В этой категории пока нет товаров.</p>';
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${p.name}</h3>
            <div class="product-price">${p.price}</div>
            <button class="buy-btn" onclick="addToCart('${btoa(unescape(encodeURIComponent(p.name)))}', '${p.price}')">В корзину</button>
        `;
        grid.appendChild(card);
    });
}

function addToCart(encodedName, price) {
    const name = decodeURIComponent(escape(atob(encodedName)));
    if (cart[name]) {
        cart[name].count++;
    } else {
        cart[name] = { price: parseInt(price) || 0, count: 1 };
    }
    updateCartUI();
}

function updateCartUI() {
    let totalItems = 0;
    let totalSum = 0;
    const itemsList = document.getElementById('cartItemsList');
    itemsList.innerHTML = '';

    Object.keys(cart).forEach(name => {
        totalItems += cart[name].count;
        totalSum += cart[name].price * cart[name].count;

        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `
            <span>${name} (${cart[name].count} шт.)</span>
            <span>${cart[name].price * cart[name].count} руб.</span>
        `;
        itemsList.appendChild(item);
    });

    if (totalItems === 0) {
        itemsList.innerHTML = '<p class="empty-cart-text">В корзине пока пусто</p>';
    }

    document.getElementById('cart-count').innerText = totalItems;
    document.getElementById('total-sum').innerText = totalSum;
}

function toggleCartModal() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

// Отправка всего заказа в Google Таблицу на Лист 1
async function sendOrder() {
    if (Object.keys(cart).length === 0) return alert('Добавьте товары в корзину!');
    
    try {
        for (const name of Object.keys(cart)) {
            await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `${name} [x${cart[name].count}]`, price: `${cart[name].price * cart[name].count} руб.` })
            });
        }
        alert('Заказ успешно оформлен и передан в обработку!');
        cart = {};
        updateCartUI();
        toggleCartModal();
    } catch (err) {
        alert('Ошибка при оформлении заказа.');
    }
}
