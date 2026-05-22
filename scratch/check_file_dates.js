import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const files = [
  '膜料庫存.xlsx',
  '膜料庫存_backup.xlsx',
  '貼膜尺寸表.xlsx',
  '汽車美容報價列表.xlsx',
  '洗車尺寸表.xlsx'
];

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`${file}:`);
    console.log(`  Size: ${stats.size} bytes`);
    console.log(`  Created: ${stats.birthtime.toISOString()}`);
    console.log(`  Modified: ${stats.mtime.toISOString()}`);
  } else {
    console.log(`${file} does not exist.`);
  }
});
