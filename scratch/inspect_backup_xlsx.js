import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '../膜料庫存_backup.xlsx');
const workbook = XLSX.readFile(file);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const cells = [
  'M4', 'N4', 'O4', 'P4', 'Q4', 'R4', 'S4',
  'M5', 'N5', 'O5', 'P5', 'Q5', 'R5', 'S5',
  'M6', 'N6', 'O6', 'P6', 'Q6', 'R6', 'S6',
  'M7', 'N7', 'O7', 'P7', 'Q7', 'R7', 'S7',
  'M8', 'N8', 'O8', 'P8', 'Q8', 'R8', 'S8',
  'M9', 'N9', 'O9', 'P9', 'Q9', 'R9', 'S9'
];

console.log('--- Backup Excel Cells ---');
cells.forEach(cell => {
  console.log(`${cell}: ${sheet[cell] ? sheet[cell].v : 'undefined'}`);
});
