import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const files = [
  'C:/Users/chend/Downloads/HouseWrapper_正式匯入範本.xlsx',
  'c:/car-shop-projects/car-shop-crm/CRM_匯入範本_全功能版.xlsx',
  'c:/car-shop-projects/car-shop-crm/汽車美容報價列表.xlsx'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`檔案不存在: ${filePath}`);
    return;
  }
  console.log(`\n讀取檔案: ${filePath}`);
  try {
    const workbook = XLSX.readFile(filePath);
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      for (let r = 0; r < data.length; r++) {
        const row = data[r] || [];
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim();
          if (val.includes('黃願禎') || val.includes('願禎') || val.includes('0933011012') || val.includes('525') || val.includes('C001')) {
            console.log(`  [工作表: ${sheetName}] 儲存格 [Row ${r+1}, Col ${c+1} (${XLSX.utils.encode_col(c)}${r+1})]: "${val}"`);
            console.log(`    完整列資料:`, row);
          }
        }
      }
    });
  } catch (e) {
    console.error(`讀取 ${filePath} 失敗:`, e.message);
  }
});
