const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const PORT = process.env.PORT || 80;
const SPREADSHEET_ID = '1DZ8GE-1psAyCCpaPwn5ISuCjg6eSL6RHL547GUpolow';

// Ваш email из сервисного аккаунта Google
const GOOGLE_SERVICE_ACCOUNT_EMAIL = 'mitexnobot@://gserviceaccount.com';

// ВАШ ПРИВАТНЫЙ КЛЮЧ, ПЕРЕВЕДЕННЫЙ В ОДНУ СТРОКУ (Символы \n заменены на обычный текст)
const GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLRcZtNmdqwpqZ\\nd3+x/VXR6gFysGXluoVhyAj5UgMpD0a5LndFhQX0Lk3pdm8jnyILAFKHL4/547Jr\\nob7hfw6fCWwk1KhulAoWzcs5Iowu9WhzWYXH2UhT/bvjgIHetIdI47v3rZl9Cvy8\\njxNdn7xcFXGYI/S1nRJWnp2IeegO3g2DdhNoNw06CRShwks4LdQjf4uNMHX7/3qk\\nK62R24gseE9swZcfYSCn2VhxDQD/KngGIwtHvJw8KhVkpDNPONMlspDJ2E6V7DP6\\np0lW8i0eI940a9G3Vaxo9cKik+WtOwkOnUi2/hSqRS6KR8VQizs4qTb6umcRuJLY\\ndNpMtR+rAgMBAAECggEAA/KGQ0IBNB40qQecX9/O4NVYfdpVwDulB3G+VYkgLUCc\\nsPqUBQeWRq2iLwcbwBIBCTxSXfRbKWZ15TKDkGwf4+VnnOIm+y6+G2ns/l5gtoYR\\nfIaf2xz/Ez0kKZYp73c2AVZaz258Qo9fZRH/ivE6foH0GMOUpvThPElhlHA5mhWb\\nlBL0GodyRYYtTLqGzUuRsX1JZeawgVrZ5rtnhKGDopr6VyAombeXKcV5VuzQ6oF1\\nKpDajbdJ85PRHrlzCjb/B/Ma/3gUTAJvh4SryY0AVNFC231Vw3xDbwQvN6a2Iufc\\nMuUd4/qxaICB4yCCtLoYnPAGK3OIVG3SuE2geMTNcQKBgQD84bZ08+vZo0ia3vVK\\n20FVtyzxmncbk7knmQNxS1eB4M0GbTZcN7ZRcC1EbOvtn4eOlZdltzI64HYWdGeS\\nDDlO0Q/TBEpnq1AHFlDp01PQoIXWbEBM0TtCS99Hzq9rX4b+ySuh6rVH2dtX/KtQ\\nRSyZyRyo/WkdbJFPZNbRzFGdzQKBgQDNx3VKegQ8HDoS/bTSzeWXBN4Fy4x7QNgb\\nvlKPrff4DoeO2CbX1C8f8N9ZiNvG8B9slhcFd37HxY5Onrj9Uq5E2Cl0+RnRLJMm\\nMjXKwDU/1FQ0sGUy7ovQT1GSVBui4RToU2TjU1dn/12wz2ACzyF6m0WpDKo9t8NC\\nwXXqP8N7VwKBgQCQw3Gcv+obG+M7bTlEkgFz3TmoUYGv0sAiz/BtkfDVU+hqrmh5\\nIBeJxUrUqfnhfPqwACi8PMRPeiF/t0F3FPJVkU6awRELCcH1XKwTPzvy6YHUfwHM\\nM9bRm/eE9ufq8rOn9We5+E+wgyGS2/0CJadjngJ/JxpeksEYjyR+05VBXQKBgEdM\\n+UMZDCaX0TeLWQBB/29YbGWtpbt/OGJEi+7k5Kq6vhWsp6jZCIsUtw8a8Kv5v6ms\\nR8XJJdCqjyiGrqp335JTI+o39c4Yl9QAScs61jiLpbGr/SSsqx0+npEJO5owS0JE\\nmwxRcFPEk/4TnLzccEk/S9/LV6GS7sFOr0C/X0h5AoGATur8cuQH995AjvcZmkgl\\nrS6rzALGWugOf03eo4KH7ncTdBMpKRNm5ViLnT2KHd8DwwdU+xAYDZGQilGX01br\\nJgkI/gi7CHGbDJjSL1QBID+fJH2BLagnMH+MY+7ku+xOr7fLe2FJMbMnoTbd9tBf\\nMXgrF5MHFSRYIYK+p27pBw8=\\n-----END PRIVATE KEY-----\\n";

let doc;

try {
    const serviceAccountAuth = new JWT({
        email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // Жесткая замена текстовых \n на реальные отступы для OpenSSL
        key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
        scopes: ['https://googleapis.com'],
    });
    doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    console.log('✅ УСПЕХ: Авторизация в Google Sheets выполнена напрямую из кода!');
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
