import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

// 標準化字串，用於做比對鍵值
function cleanKey(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[\s\(\)（）\-\_\/\xa0]/g, '') // 移去空白、括號、斜線、橫杠與特殊空格
    .trim();
}

try {
  // 1. 讀取貼膜尺寸表
  const filmPath = path.join(cwd, '貼膜尺寸表.xlsx');
  const filmWorkbook = XLSX.readFile(filmPath);
  const filmSheet = filmWorkbook.Sheets[filmWorkbook.SheetNames[0]];
  const filmRows = XLSX.utils.sheet_to_json(filmSheet);
  
  const filmVehicles = [];
  const filmKeys = new Set();

  filmRows.forEach(row => {
    // 總共有 6 組並排欄位：無字尾, _1, _2, _3, _4, _5
    const suffixes = ['', '_1', '_2', '_3', '_4', '_5'];
    suffixes.forEach(suf => {
      const brand = row[`廠牌${suf}`];
      const model = row[`車型${suf}`];
      const size = row[`尺寸${suf}`];
      
      if (brand && model) {
        const bStr = String(brand).trim();
        const mStr = String(model).trim();
        const sStr = String(size || 'M').trim().toUpperCase();
        const key = `${cleanKey(bStr)}_${cleanKey(mStr)}`;
        
        filmVehicles.push({ brand: bStr, model: mStr, size: sStr, key });
        filmKeys.add(key);
      }
    });
  });

  console.log(`貼膜尺寸表 解析出 ${filmVehicles.length} 台車型，其中不重複 Key 有 ${filmKeys.size} 個。`);

  // 2. 讀取洗車尺寸表
  const washPath = path.join(cwd, '洗車尺寸表.xlsx');
  const washWorkbook = XLSX.readFile(washPath);
  const washSheet = washWorkbook.Sheets[washWorkbook.SheetNames[0]];
  const washRows = XLSX.utils.sheet_to_json(washSheet);
  
  const washVehicles = [];
  const washKeys = new Set();

  washRows.forEach(row => {
    const brand = row['廠牌'];
    const model = row['車型'];
    const size = row['尺寸'];
    
    if (brand && model) {
      const bStr = String(brand).trim();
      const mStr = String(model).trim();
      const sStr = String(size || 'M').trim().toUpperCase();
      const key = `${cleanKey(bStr)}_${cleanKey(mStr)}`;
      
      washVehicles.push({ brand: bStr, model: mStr, size: sStr, key });
      washKeys.add(key);
    }
  });

  console.log(`洗車尺寸表 解析出 ${washVehicles.length} 台車型，其中不重複 Key 有 ${washKeys.size} 個。`);

  // 3. 進行交叉分析
  let exactMatchCount = 0;
  const onlyInFilm = [];
  const onlyInWash = [];

  filmKeys.forEach(k => {
    if (washKeys.has(k)) {
      exactMatchCount++;
    } else {
      const v = filmVehicles.find(item => item.key === k);
      onlyInFilm.push(v);
    }
  });

  washKeys.forEach(k => {
    if (!filmKeys.has(k)) {
      const v = washVehicles.find(item => item.key === k);
      onlyInWash.push(v);
    }
  });

  console.log(`\n--- 交叉比對結果 ---`);
  console.log(`Key 完全匹配的車型數: ${exactMatchCount}`);
  console.log(`僅存在於「貼膜尺寸表」的車型數: ${onlyInFilm.length}`);
  console.log(`僅存在於「洗車尺寸表」的車型數: ${onlyInWash.length}`);

  console.log(`\n僅存在於「貼膜尺寸表」的前 5 筆樣品:`);
  console.log(onlyInFilm.slice(0, 5).map(v => `${v.brand} - ${v.model} (${v.size})`));

  console.log(`\n僅存在於「洗車尺寸表」的前 5 筆樣品:`);
  console.log(onlyInWash.slice(0, 5).map(v => `${v.brand} - ${v.model} (${v.size})`));

} catch (e) {
  console.error('分析失敗:', e);
}
