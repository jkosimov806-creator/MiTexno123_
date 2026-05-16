async function getProductsFromSheet() {
    try {
        if (!doc) return [];
        await doc.loadInfo();
        let allProducts = [];

        // Выводим в консоль все листы, которые сервер РЕАЛЬНО видит в вашей таблице
        const realSheetTitles = doc.sheetsByIndex.map(s => s.title);
        console.log('📚 Листы, найденные в Google Таблице:', realSheetTitles);

        for (const sheetName of MY_CATEGORIES) {
            // Ищем лист, игнорируя лишние пробелы и регистр букв
            const sheet = doc.sheetsByIndex.find(s => s.title.trim().toLowerCase() === sheetName.trim().toLowerCase());
            
            if (!sheet) {
                console.log(`⚠️ Предупреждение: Вкладка "${sheetName}" не найдена в документе Google.`);
                continue;
            }
            
            // Загружаем ячейки (берём с запасом первые 60 строк и 5 колонок)
            await sheet.loadCells('A1:E60');
            console.log(`📖 Читаем лист: "${sheet.title}"...`);
            
            // Внимание: Строка 1 в Google = индекс 0, Строка 2 = индекс 1, Строка 3 = индекс 2
            // Если ваши товары начинаются ровно со СТРОКИ 3 (под синей шапкой), rowIndex должен быть = 2
            // Если товары начинаются со СТРОКИ 2, поменяйте 2 на 1 ниже:
            for (let rowIndex = 2; rowIndex < 60; rowIndex++) {
                const nameCell = sheet.getCell(rowIndex, 0); // Столбец A (наименование)
                const priceCell = sheet.getCell(rowIndex, 2); // Столбец C (цена)
                
                const nameValue = nameCell.value;
                const priceValue = priceCell.value;
                
                // Если ячейка пустая, просто идём дальше (вдруг там есть пропуски строк)
                if (!nameValue) continue; 
                
                allProducts.push({
                    name: nameValue.toString().trim(),
                    price: priceValue ? priceValue.toString().trim() + ' руб.' : 'Цену уточняйте',
                    category: sheetName
                });
            }
        }
        console.log(`🔥 ИТОГО: Успешно загружено товаров для сайта: ${allProducts.length}`);
        return allProducts;
    } catch (e) {
        console.error('❌ Критическая ошибка при чтении ячеек каталога:', e);
        return [];
    }
}
