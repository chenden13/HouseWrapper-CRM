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
    console.log('正在讀取 膜料庫存.xlsx...');
    const workbook = XLSX.readFile(invPath, { cellStyles: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 3. 設定新值，並套用樣式範本
    const templateStyle = sheet['N4'] ? sheet['N4'].s : undefined;
    const templateStyleSize = sheet['O4'] ? sheet['O4'].s : undefined;

    function setCell(cellRef, value, isSize = false) {
      if (!sheet[cellRef]) {
        sheet[cellRef] = { t: 's', v: value };
      } else {
        sheet[cellRef].v = value;
        sheet[cellRef].t = 's';
      }
      sheet[cellRef].w = String(value);
      
      const style = isSize ? templateStyleSize : templateStyle;
      if (style) {
        sheet[cellRef].s = style;
      }
    }

    // 由於 import_inventory.js 是以「Row 為主（由左至右、由上至下）」的方式依序累加未拆區域的儲位，
    // 我們必須交錯填入 M-O (N列) 和 Q-S (R列)，才能使 Slot 1-12 對應到正確的品項。
    const updates = {
      // Row 4
      N4: 'ax 液態金屬星翰銀', O4: '全新', // Slot 1
      R4: 'ax 啞液態金屬銀',   S4: '300', // Slot 2

      // Row 5
      N5: 'ax 蒙札灰',         O5: '全新', // Slot 3
      R5: '啞灰',              S5: '全新', // Slot 4

      // Row 6
      N6: 'ax 超啞灰藍',       O6: '全新', // Slot 5
      R6: '煙雨藍',            S6: '全新', // Slot 6

      // Row 7
      N7: 'ax 羅莉塔粉',       O7: '全新', // Slot 7
      R7: 'ax 液態金屬銀 補料', S7: '全新', // Slot 8

      // Row 8
      N8: '8bit 消光',         O8: '全新', // Slot 9
      R8: '3m 200g',           S8: '全新', // Slot 10

      // Row 9
      N9: '3m 200m',           O9: '全新', // Slot 11
      R9: '3m 150g',           S9: '全新'  // Slot 12
    };

    console.log('正在更新 G區 (A4 & A5) 儲存格資料...');
    for (const [cellRef, val] of Object.entries(updates)) {
      const isSize = cellRef.startsWith('O') || cellRef.startsWith('S');
      setCell(cellRef, val, isSize);
    }

    // 4. 寫回檔案
    console.log('正在寫回 Excel 檔案...');
    XLSX.writeFile(workbook, invPath, { cellStyles: true });
    console.log('🎉 Excel 檔案交錯更新成功！已成功對齊 Slot 1 至 Slot 12。');

  } catch (err) {
    console.error('❌ 更新 Excel 失敗:', err);
  }
}

run();
