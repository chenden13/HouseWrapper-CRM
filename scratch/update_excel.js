import XLSX from 'xlsx-js-style';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const invPath = path.join(cwd, '膜料庫存.xlsx');
const backupPath = path.join(cwd, '膜料庫存_backup.xlsx');

async function run() {
  try {
    // 1. 備份檔案
    console.log('正在備份 膜料庫存.xlsx...');
    fs.copyFileSync(invPath, backupPath);
    console.log(`備份成功！已複製為: ${backupPath}`);

    // 2. 讀取 Excel 檔案，保留樣式
    console.log('正在讀取 膜料庫存.xlsx (包含儲存格樣式)...');
    const workbook = XLSX.readFile(invPath, { cellStyles: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    let modifiedCount = 0;

    // 3. 尋找與替換
    // 在 xlsx 格式中，工作表是一個以 A1, B2... 等儲存格為鍵值的對象
    for (let key in sheet) {
      if (key.startsWith('!')) continue; // 忽略 !ref, !merges 等 metadata

      const cell = sheet[key];
      if (cell && cell.v !== undefined && cell.v !== null) {
        const val = String(cell.v).trim();
        if (val === '保桿' || val === '新y保' || val === '後保') {
          console.log(`修改儲存格 ${key}: "${val}" -> "260x75"`);
          cell.v = '260x75';
          cell.t = 's'; // 設定為字串類型
          if (cell.w !== undefined) {
            cell.w = '260x75';
          }
          modifiedCount++;
        }
      }
    }

    // 4. 寫回檔案
    if (modifiedCount > 0) {
      console.log(`共計修改了 ${modifiedCount} 個儲存格。正在寫回檔案...`);
      XLSX.writeFile(workbook, invPath, { cellStyles: true });
      console.log('寫回 Excel 檔案完成！');
    } else {
      console.log('未找到需要修改的儲存格。');
    }
  } catch (err) {
    console.error('更新 Excel 失敗:', err);
  }
}

run();
