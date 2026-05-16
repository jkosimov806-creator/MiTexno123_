const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const PORT = process.env.PORT || 80;
const SPREADSHEET_ID = '1DZ8GE-1psAyCCpaPwn5ISuCjg6eSL6RHL547GUpolow';

let doc;

try {
    // 🆕 Читаем переменную с ПРАВИЛЬНЫМ именем, в котором лежит Base64 строка
    const base64Data = process.env.GOOGLE_JSON_KEY_BASE64;
    
    if (!base64Data) {
        throw new Error('Переменная GOOGLE_JSON_KEY_BASE64 не найдена в Amvera!');
    }

    // Декодируем Base64 обратно в понятный для Node.js текст JSON
    const decodedText = Buffer.from(base64Data, 'base64').toString('utf8');
    const credentials = JSON.parse(decodedText);

    const serviceAccountAuth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key.replace(/\\n/g, '\n'), // Железобетонный фикс OpenSSL
        scopes: ['https://googleapis.com'],
    });
    doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    console.log('✅ Авторизация в Google успешно настроена через Base64!');
} catch (err) {
    console.error('❌ Ошибка инициализации Google Ключа:', err.message);
}

const MY_CATEGORIES = [
    'Кондиционеры и обогреватели',
    'Телевизоры',
    'Стиральная машина',
    'Холодильник',
    'Очистители, увлажнители воздуха',
    'Всё для дома',
    'Пылесос и фен',
    'Гаджеты',
    'Мониторы и дисплеи',
    'Камеры'
];

async function getProductsFromSheet() {
    try {
        if (!doc) return [];
        await doc.loadInfo();
        let allProducts = [];

        for (const sheetName of MY_CATEGORIES) {
            const sheet = doc.sheetsByTitle[sheetName];
            if (!sheet) continue;
            
            await sheet.loadCells('A1:D100');
            
            for (let rowIndex = 2; rowIndex < 100; rowIndex++) {
                const nameCell = sheet.getCell(rowIndex, 0); // Столбец A (наименование)
                const priceCell = sheet.getCell(rowIndex, 2); // Столбец C (цена)
                
                const nameValue = nameCell.value;
                const priceValue = priceCell.value;
                
                if (!nameValue) break; 
                
                allProducts.push({
                    name: nameValue.toString().trim(),
                    price: priceValue ? priceValue.toString().trim() + ' руб.' : 'Цену уточняйте',
                    category: sheetName
                });
            }
        }
        console.log(`Успешно загружено товаров для каталога: ${allProducts.length}`);
        return allProducts;
    } catch (e) {
        console.error('Ошибка при чтении каталога товаров:', e);
        return [];
    }
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/products' && req.method === 'GET') {
        const products = await getProductsFromSheet();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(products));
        return;
    }

    if (req.url === '/api/order' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (!doc) throw new Error('Google Скрипт не инициализирован');
                await doc.loadInfo();
                const orderSheet = doc.sheetsByIndex[0]; // Заказы падают на самую первую вкладку
                await orderSheet.addRow({
                    'ID': Math.floor(Math.random() * 10000),
                    'Товар': data.name,
                    'Цена': data.price,
                    'Дата': new Date().toLocaleString("ru-RU")
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка при создании заказа: ' + err.message);
            }
        });
        return;
    }

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
