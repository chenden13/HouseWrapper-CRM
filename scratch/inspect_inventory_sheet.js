import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  console.log('Sheet Names:', workbook.SheetNames);

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // 讀取為 2D 陣列
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`\n工作表 "${sheetName}" 總共含有 ${data.length} 行資料。`);
  console.log('\n--- 前 15 行的原始 2D Grid 預覽 ---');
  data.slice(0, 15).forEach((row, i) => {
    console.log(`Row ${i}:`, row);
  });
} catch (e) {
  console.error('讀取失敗:', e);
}
