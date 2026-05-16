const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const PORT = process.env.PORT || 80;

// НАСТРОЙКА GOOGLE ТАБЛИЦ (Ваши ключи уже должны быть здесь!)
const SPREADSHEET_ID = '1DZ8GE-1psAyCCpaPwn5ISuCjg6eSL6RHL547GUpolow';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = 'ВСТАВЬТЕ_СЮДА_CLIENT_EMAIL_ИЗ_JSON'; 
const GOOGLE_PRIVATE_KEY = 'ВСТАВЬТЕ_СЮДА_PRIVATE_KEY_ИЗ_JSON';

// Создаем подключение к Google
const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://googleapis.com'],
});
const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

// 🆕 Новая функция: Получение списка товаров из Листа №2 (или создайте вкладку "Товары")
async function getProductsFromSheet() {
    try {
        await doc.loadInfo();
        // Предположим, что товары лежат на ВТОРОЙ вкладке вашей таблицы (индекс 1)
        // Назовите колонки на этой вкладке: Название, Цена
        const sheet = doc.sheetsByIndex[1] || doc.sheetsByIndex[0]; 
        const rows = await sheet.getRows();
        
        return rows.map(row => ({
            name: row.get('Название') || row.get('Товар'),
            price: row.get('Цена')
        }));
    } catch (e) {
        console.error('Ошибка чтения товаров:', e);
        return [];
    }
}

// Функция отправки заказа (осталась прежней, пишет на Лист №1)
async function addOrderToSheet(productName, price) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // Заказы пишем на первый лист
        await sheet.addRow({
            'ID': Math.floor(Math.random() * 10000),
            'Товар': productName,
            'Цена': price,
            'Дата': new Date().toLocaleString("ru-RU")
        });
    } catch (e) {
        console.error('Ошибка записи заказа:', e);
    }
}

const server = http.createServer(async (req, res) => {
    // 🆕 Маршрут получения товаров для витрины
    if (req.url === '/api/products' && req.method === 'GET') {
        const products = await getProductsFromSheet();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(products));
        return;
    }

    // Маршрут оформления заказа
    if (req.url === '/api/order' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const data = JSON.parse(body);
            await addOrderToSheet(data.name, data.price);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    // Раздача файлов сайта
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    let extname = path.extname(filePath);
    let contentType = 'text/html';
    if (extname === '.css') contentType = 'text/css';
    if (extname === '.js') contentType = 'text/javascript';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Файл не найден');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
