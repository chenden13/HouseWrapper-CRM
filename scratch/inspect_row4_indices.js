import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const row4 = data[3] || [];
  console.log('Row 4 exact mapping:');
  row4.forEach((val, idx) => {
    console.log(`Col ${idx} (${XLSX.utils.encode_col(idx)}): "${val}"`);
  });
} catch (e) {
  console.error(e);
}
