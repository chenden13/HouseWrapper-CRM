import { execSync } from 'child_process';
import XLSX from 'xlsx';

try {
  console.log('Reading 膜料庫存.xlsx from commit b3f2fa2...');
  const buffer = execSync('git show b3f2fa2:"膜料庫存.xlsx"', { maxBuffer: 50 * 1024 * 1024 });
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const cells = [
    'M4', 'N4', 'O4', 'P4', 'Q4', 'R4', 'S4',
    'M5', 'N5', 'O5', 'P5', 'Q5', 'R5', 'S5',
    'M6', 'N6', 'O6', 'P6', 'Q6', 'R6', 'S6',
    'M7', 'N7', 'O7', 'P7', 'Q7', 'R7', 'S7',
    'M8', 'N8', 'O8', 'P8', 'Q8', 'R8', 'S8',
    'M9', 'N9', 'O9', 'P9', 'Q9', 'R9', 'S9'
  ];

  console.log('--- Git commit b3f2fa2 Excel Cells ---');
  cells.forEach(cell => {
    console.log(`${cell}: ${sheet[cell] ? sheet[cell].v : 'undefined'}`);
  });
} catch (err) {
  console.error('Error reading from git commit:', err);
}
