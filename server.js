const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const PORT = process.env.PORT || 80;

// ================= НАСТРОЙКА GOOGLE ТАБЛИЦ =================
const SPREADSHEET_ID = '1DZ8GE-1psAyCCpaPwn5ISuCjg6eSL6RHL547GUpolow';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = 'mitexnobot@logical-carver-496404-j9.iam.gserviceaccount.com';

// Ваш приватный ключ, правильно разбитый на строки с косыми кавычками (OpenSSL Fix)
const GOOGLE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLRcZtNmdqwpqZ
d3+x/VXR6gFysGXluoVhyAj5UgMpD0a5LndFhQX0Lk3pdm8jnyILAFKHL4/547Jr
ob7hfw6fCWwk1KhulAoWzcs5Iowu9WhzWYXH2UhT/bvjgIHetIdI47v3rZl9Cvy8
jxNdn7xcFXGYI/S1nRJWnp2IeegO3g2DdhNoNw06CRShwks4LdQjf4uNMHX7/3qk
K62R24gseE9swZcfYSCn2VhxDQD/KngGIwtHvJw8KhVkpDNPONMlspDJ2E6V7DP6
p0lW8i0eI940a9G3Vaxo9cKik+WtOwkOnUi2/hSqRS6KR8VQizs4qTb6umcRuJLY
dNpMtR+rAgMBAAECggEAA/KGQ0IBNB40qQecX9/O4NVYfdpVwDulB3G+VYkgLUCc
sPqUBQeWRq2iLwcbwBIBCTxSXfRbKWZ15TKDkGwf4+VnnOIm+y6+G2ns/l5gtoYR
fIaf2xz/Ez0kKZYp73c2AVZaz258Qo9fZRH/ivE6foH0GMOUpvThPElhlHA5mhWb
nlBL0GodyRYYtTLqGzUuRsX1JZeawgVrZ5rtnhKGDopr6VyAombeXKcV5VuzQ6oF1
KpDajbdJ85PRHrlzCjb/B/Ma/3gUTAJvh4SryY0AVNFC231Vw3xDbwQvN6a2Iufc
MuUd4/qxaICB4yCCtLoYnPAGK3OIVG3SuE2geMTNcQKBgQD84bZ08+vZo0ia3vVK
20FVtyzxmncbk7knmQNxS1eB4M0GbTZcN7ZRcC1EbOvtn4eOlZdltzI64HYWdGeS
DDlO0Q/TBEpnq1AHFlDp01PQoIXWbEBM0TtCS99Hzq9rX4b+ySuh6rVH2dtX/KtQ
RSyZyRyo/WkdbJFPZNbRzFGdzQKBgQDNx3VKegQ8HDoS/bTSzeWXBN4Fy4x7QNgb
vlKPrff4DoeO2CbX1C8f8N9ZiNvG8B9slhcFd37HxY5Onrj9Uq5E2Cl0+RnRLJMm
MjXKwDU/1FQ0sGUy7ovQT1GSVBui4RToU2TjU1dn/12wz2ACzyF6m0WpDKo9t8NC
wXXqP8N7VwKBgQCQw3Gcv+obG+M7bTlEkgFz3TmoUYGv0sAiz/BtkfDVU+hqrmh5
IBeJxUrUqfnhfPqwACi8PMRPeiF/t0F3FPJVkU6awRELCcH1XKwTPzvy6YHUfwHM
N9bRm/eE9ufq8rOn9We5+E+wgyGS2/0CJadjngJ/JxpeksEYjyR+05VBXQKBgEdM
+UMZDCaX0TeLWQBB/29YbGWtpbt/OGJEi+7k5Kq6vhWsp6jZCIsUtw8a8Kv5v6ms
nR8XJJdCqjyiGrqp335JTI+o39c4Yl9QAScs61jiLpbGr/SSsqx0+npEJO5owS0JE
wwxRcFPEk/4TnLzccEk/S9/LV6GS7sFOr0C/X0h5AoGATur8cuQH995AjvcZmkgl
nrS6rzALGWugOf03eo4KH7ncTdBMpKRNm5ViLnT2KHd8DwwdU+xAYDZGQilGX01br
JgkI/gi7CHGbDJjSL1QBID+fJH2BLagnMH+MY+7ku+xOr7fLe2FJMbMnoTbd9tBf
MXgrF5MHFSRYIYK+p27pBw8=
-----END PRIVATE KEY-----`;
// ============================================================

const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY, // Никаких .replace(), ключ теперь передан идеально!
    scopes: ['https://googleapis.com'],
});
const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

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
        await doc.loadInfo();
        let allProducts = [];

        for (const sheetName of MY_CATEGORIES) {
            const sheet = doc.sheetsByTitle[sheetName];
            if (!sheet) continue;
            
            // Загружаем ячейки: Столбец А (0) и Столбец С (2)
            await sheet.loadCells('A1:D100');
            
            for (let rowIndex = 2; rowIndex < 100; rowIndex++) {
                const nameCell = sheet.getCell(rowIndex, 0); // Столбец A
                const priceCell = sheet.getCell(rowIndex, 2); // Столбец C
                
                const nameValue = nameCell.value;
                const priceValue = priceCell.value;
                
                if (!nameValue) break; // Завершаем лист, если пошли пустые строки
                
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
    // Включаем CORS-заголовки
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
                res.end('Ошибка при создании заказа');
            }
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
