import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('Row index | A4 (cols 12-14) | A5 (cols 16-18)');
  for (let r = 0; r < 20; r++) {
    const row = data[r] || [];
    const a4 = row.slice(12, 15).map(v => v === undefined ? '' : String(v));
    const a5 = row.slice(16, 19).map(v => v === undefined ? '' : String(v));
    if (a4.join('').trim() || a5.join('').trim()) {
      console.log(`Row ${r+1} | ${JSON.stringify(a4)} | ${JSON.stringify(a5)}`);
    }
  }
} catch (e) {
  console.error(e);
}
