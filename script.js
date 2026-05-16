let count = 0;

// Автоматически загружаем товары при открытии страницы
document.addEventListener('DOMContentLoaded', loadProducts);

async function loadProducts() {
    const productsContainer = document.querySelector('.products');
    if (!productsContainer) return;

    try {
        // Запрашиваем товары у нашего сервера Amvera
        const response = await fetch('/api/products');
        const products = await response.json();

        // Очищаем статичные товары, которые были прописаны в HTML вручную
        productsContainer.innerHTML = '';

        // Рисуем карточку для каждого товара из таблицы
        products.forEach(product => {
            if (!product.name) return; // Пропускаем пустые строки
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p>Цена: ${product.price}</p>
                <button onclick="addToCart('${product.name}', '${product.price}')">Купить</button>
            `;
            productsContainer.appendChild(card);
        });
    } catch (err) {
        console.error('Ошибка загрузки товаров на витрину:', err);
    }
}

// Функция покупки товара
async function addToCart(productName, price) {
    count = count + 1;
    document.getElementById('cart-count').innerText = count;

    try {
        await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: productName, price: price })
        });
        alert(`Товар "${productName}" добавлен! Заказ улетел в таблицу.`);
    } catch (err) {
        console.error('Не удалось отправить заказ:', err);
    }
}

