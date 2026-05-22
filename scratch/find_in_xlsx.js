import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`Scanning sheet: ${sheetName}`);
    for (let r = 0; r < data.length; r++) {
      const row = data[r] || [];
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').trim();
        if (val) {
          const valLower = val.toLowerCase();
          if (valLower.includes('保桿') || valLower.includes('y保') || valLower.includes('新y') || valLower.includes('新y保')) {
            console.log(`Cell [Row ${r+1}, Col ${c+1} (${XLSX.utils.encode_col(c)}${r+1})]: "${val}"`);
          }
        }
      }
    }
  });
} catch (e) {
  console.error(e);
}
