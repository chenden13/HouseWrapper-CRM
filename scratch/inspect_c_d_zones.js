import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('\n--- 檢查 D1-D4 (倒V架) 行 39 起的前 5 行資料 ---');
  data.slice(38, 45).forEach((row, i) => {
    console.log(`Excel Row ${39 + i}:`, {
      colA_C: row.slice(0, 3), // D1
      colE_G: row.slice(4, 7), // D2
      colI_K: row.slice(8, 11), // D3
      colM_O: row.slice(12, 15) // D4
    });
  });

  console.log('\n--- 檢查 C1-1 (層架) 行 58 起的前 5 行資料 ---');
  data.slice(57, 65).forEach((row, i) => {
    console.log(`Excel Row ${58 + i}:`, {
      colA_C: row.slice(0, 3),
      colE_G: row.slice(4, 7),
      colI_K: row.slice(8, 11),
      colM_O: row.slice(12, 15)
    });
  });

} catch (e) {
  console.error('讀取失敗:', e);
}
