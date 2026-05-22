import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Print row 58, 59, 60
  for (let r = 56; r < 62; r++) {
    console.log(`Row ${r+1}:`, data[r]);
  }
} catch (e) {
  console.error(e);
}
