import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const keywords = [
  '星翰銀', '蒙札灰', '羅莉塔粉', '煙雨藍', '消光', '3m 200g', '3m 200m', '3m 150g', '啞液態'
];

function searchExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    console.log(`\nChecking file: ${path.basename(filePath)}`);
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const rawGrid = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      let found = false;
      rawGrid.forEach((row, r) => {
        row.forEach((cellVal, c) => {
          if (cellVal) {
            const strVal = String(cellVal);
            keywords.forEach(kw => {
              if (strVal.includes(kw)) {
                console.log(`  [Sheet: ${sheetName}] Row ${r + 1}, Col ${c + 1} (${XLSX.utils.encode_cell({r, c})}): "${strVal}"`);
                // Print surrounding cells to find dimensions
                const surrounding = [];
                for (let offset = -2; offset <= 2; offset++) {
                  const checkC = c + offset;
                  if (checkC >= 0 && row[checkC] !== undefined) {
                    surrounding.push(`${XLSX.utils.encode_col(checkC)}: "${row[checkC]}"`);
                  }
                }
                console.log(`    Surrounding: ${surrounding.join(', ')}`);
                found = true;
              }
            });
          }
        });
      });
    });
  } catch (err) {
    console.error(`Error reading ${path.basename(filePath)}:`, err.message);
  }
}

// Find all xlsx files in rootDir
fs.readdirSync(rootDir).forEach(file => {
  if (file.endsWith('.xlsx') && !file.startsWith('~$')) {
    searchExcel(path.join(rootDir, file));
  }
});
