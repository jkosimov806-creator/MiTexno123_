const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library'); // Нужен для авторизации в новых версиях библиотеки

const PORT = process.env.PORT || 80;

// ================= НАСТРОЙКА GOOGLE ТАБЛИЦ =================
const SPREADSHEET_ID = '1DZ8GE-1psAyCCpaPwn5ISuCjg6eSL6RHL547GUpolow'; // Ваш ID таблицы подставил!

// ⚠️ СЮДА ВСТАВЬТЕ ДАННЫЕ ИЗ ВАШЕГО СТАРОГО JSON ФАЙЛА КЛЮЧЕЙ:
const GOOGLE_SERVICE_ACCOUNT_EMAIL = 'ВСТАВЬТЕ_СЮДА_CLIENT_EMAIL_ИЗ_JSON'; 
const GOOGLE_PRIVATE_KEY = 'ВСТАВЬТЕ_СЮДА_PRIVATE_KEY_ИЗ_JSON';
// ============================================================

// Функция отправки заказа в Google Таблицу
async function addOrderToSheet(productName, price) {
    try {
        // Создаем современное подключение через JWT-токен
        const serviceAccountAuth = new JWT({
            email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Корректно обрабатываем переносы строк ключа
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        await doc.loadInfo(); // Загружаем информацию о таблице
        
        const sheet = doc.sheetsByIndex[0]; // Берем самый первый лист таблицы
        
        // Добавляем строчку с заказом в таблицу
        await sheet.addRow({
            'ID': Math.floor(Math.random() * 10000),
            'Товар': productName,
            'Цена': price,
            'Дата': new Date().toLocaleString("ru-RU")
        });
        console.log('🎉 Заказ успешно записан в Google Таблицу!');
    } catch (e) {
        console.error('❌ Ошибка записи в таблицу:', e);
    }
}

const server = http.createServer((req, res) => {
    // Обработка клика по кнопке "Купить" (отправка на сервер)
    if (req.url === '/api/order' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                await addOrderToSheet(data.name, data.price);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка сервера при обработке заказа');
            }
        });
        return;
    }

    // Стандартная раздача файлов вашего интернет-магазина
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
    console.log(`🚀 Сервер запущен и работает на порту ${PORT}`);
});
