import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const cwd = process.cwd();

// 標準化鍵值，過濾掉所有空格、括號、斜線、連接線等特殊符號，實現智慧比對
function cleanKey(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[\s\(\)（）\-\_\/\xa0]/g, '')
    .trim();
}

try {
  // 1. 讀取貼膜尺寸表 (Film Size)
  const filmPath = path.join(cwd, '貼膜尺寸表.xlsx');
  const filmWorkbook = XLSX.readFile(filmPath);
  const filmSheet = filmWorkbook.Sheets[filmWorkbook.SheetNames[0]];
  const filmRows = XLSX.utils.sheet_to_json(filmSheet);
  
  const mergedMap = new Map();

  filmRows.forEach(row => {
    // 6 組並排欄位：無字尾, _1, _2, _3, _4, _5
    const suffixes = ['', '_1', '_2', '_3', '_4', '_5'];
    suffixes.forEach(suf => {
      const brand = row[`廠牌${suf}`];
      const model = row[`車型${suf}`];
      const size = row[`尺寸${suf}`];
      
      if (brand && model) {
        const bStr = String(brand).trim();
        const mStr = String(model).trim();
        let sStr = String(size || 'M').trim().toUpperCase();
        
        // 使用者特別指示強制修正：Audi A4 相關貼膜尺寸應為 M 尺寸
        if (bStr.toUpperCase() === 'AUDI' && mStr.toUpperCase().includes('A4')) {
          sStr = 'M';
        }
        
        const key = `${cleanKey(bStr)}_${cleanKey(mStr)}`;
        
        mergedMap.set(key, {
          brand: bStr,
          model: mStr,
          size: sStr,
          detailingSize: sStr // 預設洗車尺寸為貼膜尺寸
        });
      }
    });
  });

  console.log(`貼膜尺寸表解析完畢，匯入不重複車型基礎：${mergedMap.size} 筆。`);

  // 2. 讀取洗車尺寸表 (Wash/Detailing Size) 並進行智慧合併
  const washPath = path.join(cwd, '洗車尺寸表.xlsx');
  const washWorkbook = XLSX.readFile(washPath);
  const washSheet = washWorkbook.Sheets[washWorkbook.SheetNames[0]];
  const washRows = XLSX.utils.sheet_to_json(washSheet);
  
  let mergedCount = 0;
  let newWashCount = 0;

  washRows.forEach(row => {
    const brand = row['廠牌'];
    const model = row['車型'];
    const size = row['尺寸'];
    
    if (brand && model) {
      const bStr = String(brand).trim();
      const mStr = String(model).trim();
      const sStr = String(size || 'M').trim().toUpperCase();
      const key = `${cleanKey(bStr)}_${cleanKey(mStr)}`;
      
      if (mergedMap.has(key)) {
        // 交集：更新洗車尺寸
        const existing = mergedMap.get(key);
        existing.detailingSize = sStr;
        mergedCount++;
      } else {
        // 洗車表獨有：新增至資料庫，貼膜尺寸預設與洗車相同
        mergedMap.set(key, {
          brand: bStr,
          model: mStr,
          size: sStr,
          detailingSize: sStr
        });
        newWashCount++;
      }
    }
  });

  console.log(`洗車尺寸表合併完畢：`);
  console.log(`- 成功與現有貼膜車型精確匹配並對齊尺寸：${mergedCount} 筆`);
  console.log(`- 洗車表獨有並新增至對照表的車型：${newWashCount} 筆`);
  console.log(`- 合併後最終車型聯集總數：${mergedMap.size} 筆。`);

  // 3. 轉成乾淨的 Array 並排序 (依 廠牌 字母升冪排序)
  const finalVehicles = Array.from(mergedMap.values()).sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand, 'en');
    if (brandCompare !== 0) return brandCompare;
    return a.model.localeCompare(b.model, 'en');
  });

  const jsonContent = JSON.stringify(finalVehicles, null, 2);

  // 4. 寫入到兩大專案的 data 目錄下
  const crmDestPath = path.join(cwd, 'src', 'data', 'vehicles.json');
  const priceAppDestPath = path.join(cwd, 'price-app', 'src', 'data', 'vehicles.json');

  fs.writeFileSync(crmDestPath, jsonContent, 'utf-8');
  console.log(`成功寫入 CRM 車型檔：${crmDestPath}`);

  fs.writeFileSync(priceAppDestPath, jsonContent, 'utf-8');
  console.log(`成功寫入獨立報價系統車型檔：${priceAppDestPath}`);

  console.log('--- 尺寸表完美更新成功！ ---');

} catch (e) {
  console.error('尺寸表合併與寫入失敗:', e);
}
