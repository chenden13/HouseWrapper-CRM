import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const searchFolders = [
  'c:/car-shop-projects/car-shop-crm',
  'C:/Users/chend/Downloads'
];

const nameToSearch = '黃重欽';

searchFolders.forEach(folder => {
  try {
    const files = fs.readdirSync(folder);
    files.forEach(file => {
      if (file.endsWith('.xlsx') && !file.startsWith('~$')) {
        const filePath = path.join(folder, file);
        try {
          const workbook = XLSX.readFile(filePath);
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            jsonData.forEach((row, rowIndex) => {
              const rowStr = JSON.stringify(row);
              if (rowStr.includes(nameToSearch) || rowStr.includes('重欽')) {
                console.log(`找到匹配於 檔案: ${file}, 分頁: ${sheetName}, 行: ${rowIndex + 1}`);
                console.log('行內容:', row);
              }
            });
          });
        } catch (e) {
          console.error(`讀取檔案 ${file} 失敗:`, e.message);
        }
      }
    });
  } catch (err) {
    console.error(`讀取目錄 ${folder} 失敗:`, err.message);
  }
});
