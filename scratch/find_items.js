import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const colBlocks = [
    { name: 'A-C', cols: [0, 1, 2] },
    { name: 'E-G', cols: [4, 5, 6] },
    { name: 'I-K', cols: [8, 9, 10] },
    { name: 'M-O', cols: [12, 13, 14] }
  ];

  const uniqueCol2 = new Set();
  console.log('Case-insensitive Search Results:');
  for (let r = 0; r < data.length; r++) {
    const row = data[r] || [];
    colBlocks.forEach(block => {
      const col0Val = String(row[block.cols[0]] || '').trim();
      const col1Val = String(row[block.cols[1]] || '').trim();
      const col2Val = String(row[block.cols[2]] || '').trim();

      if (col2Val) {
        uniqueCol2.add(col2Val);
      }

      const matchText = (col1Val + ' ' + col2Val).toLowerCase();
      if (
        matchText.includes('保桿') || 
        matchText.includes('y保') || 
        matchText.includes('新y') || 
        matchText.includes('新y保') || 
        matchText.includes('新 Y') || 
        matchText.includes('新 y')
      ) {
        console.log(`Row ${r} [Block ${block.name}]: Col0=${col0Val}, Col1=${col1Val}, Col2=${col2Val}`);
      }
    });
  }

  console.log('\nUnique Col2 values:');
  console.log(Array.from(uniqueCol2));
} catch (e) {
  console.error('Error:', e);
}
