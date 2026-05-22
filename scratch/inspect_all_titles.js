import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('All titles found in the spreadsheet:');
  for (let r = 0; r < data.length; r++) {
    const row = data[r] || [];
    row.forEach((val, colIndex) => {
      if (val !== undefined && val !== null) {
        const str = String(val).trim();
        if (str.includes('（') || str.includes('(') || str.includes('層架') || str.includes('倒V') || str === 'A4' || str === 'A5') {
          console.log(`Row ${r + 1}, Col ${colIndex} (${XLSX.utils.encode_col(colIndex)}): "${str}"`);
        }
      }
    });
  }
} catch (e) {
  console.error(e);
}
