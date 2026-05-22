import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invPath = path.join(__dirname, '../膜料庫存.xlsx');

const workbook = XLSX.readFile(invPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawGrid = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const colBlocks = [
  { name: 'A-C', cols: [0, 1, 2] },
  { name: 'E-G', cols: [4, 5, 6] },
  { name: 'I-K', cols: [8, 9, 10] },
  { name: 'M-O', cols: [12, 13, 14] },
  { name: 'Q-S', cols: [16, 17, 18] },
  { name: 'U-W', cols: [20, 21, 22] }
];

const uniqueSizes = new Set();

for (let r = 0; r < rawGrid.length; r++) {
  const row = rawGrid[r] || [];
  colBlocks.forEach(block => {
    const col1Val = String(row[block.cols[1]] || '').trim();
    const col2Val = String(row[block.cols[2]] || '').trim();
    
    // Ignore header
    if (col1Val === '名稱' && col2Val === '尺寸') {
      return;
    }
    
    if (col1Val && col2Val) {
      uniqueSizes.add(col2Val);
    }
  });
}

console.log('Unique sizes found in Excel:');
console.log(Array.from(uniqueSizes).sort());
