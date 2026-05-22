import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const printRow = (rowIndex) => {
    console.log(`\n--- Row ${rowIndex + 1} ---`);
    const row = data[rowIndex] || [];
    row.forEach((val, colIndex) => {
      if (val !== undefined && val !== null) {
        console.log(`Col ${colIndex} (${XLSX.utils.encode_col(colIndex)}): "${val}"`);
      }
    });
  };

  printRow(0);
  printRow(1);
  printRow(57);
  printRow(58);
} catch (e) {
  console.error(e);
}
