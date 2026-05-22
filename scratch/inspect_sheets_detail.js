import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

fs.readdirSync(rootDir).forEach(file => {
  if (file.endsWith('.xlsx') && !file.startsWith('~$')) {
    const filePath = path.join(rootDir, file);
    try {
      const workbook = XLSX.readFile(filePath);
      console.log(`\n=== File: ${file} ===`);
      console.log('Sheet Names:', workbook.SheetNames);
      workbook.SheetNames.forEach((name, idx) => {
        const sheet = workbook.Sheets[name];
        const range = sheet['!ref'];
        console.log(`  Sheet ${idx}: "${name}" - Range: ${range}`);
        const rawGrid = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`    Rows: ${rawGrid.length}`);
        if (rawGrid.length > 0) {
          console.log('    First row sample:', rawGrid[0].slice(0, 10));
        }
      });
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
});
