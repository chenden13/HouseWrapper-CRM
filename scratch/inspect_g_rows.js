import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`Total rows in sheet: ${data.length}`);
  for (let r = 0; r < data.length; r++) {
    const row = data[r] || [];
    const col12_14 = row.slice(12, 15).map(v => v === undefined ? '' : String(v));
    const col16_18 = row.slice(16, 19).map(v => v === undefined ? '' : String(v));
    const hasVal = col12_14.some(x => x.trim()) || col16_18.some(x => x.trim());
    if (hasVal) {
      console.log(`Row ${r+1} | M-O: ${JSON.stringify(col12_14)} | Q-S: ${JSON.stringify(col16_18)}`);
    }
  }
} catch (e) {
  console.error(e);
}
