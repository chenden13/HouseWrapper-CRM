const fs = require('fs');
const xlsx = require('xlsx');

const splitModels = (modelStr) => {
  if (!modelStr) return [];
  return String(modelStr).split(/\s*[\/、,]\s*/).filter(Boolean);
};

// 1. 讀取 洗車尺寸表 (Wash)
const washWb = xlsx.readFile('洗車尺寸表.xlsx');
const washWs = washWb.Sheets[washWb.SheetNames[0]];
const washData = xlsx.utils.sheet_to_json(washWs, {header: 1});
const washMap = new Map();

for (let i = 1; i < washData.length; i++) {
  const row = washData[i];
  if (!row || row.length < 3) continue;
  let brand = String(row[0] || '').trim();
  let model = String(row[1] || '').trim();
  let size = String(row[2] || '').trim().toUpperCase();
  
  if (brand && model && brand !== '廠牌') {
    const models = splitModels(model);
    models.forEach(m => {
      washMap.set(`${brand}_${m}`.toLowerCase(), size);
    });
  }
}

// 2. 讀取 貼膜尺寸表 (Wrap)
const wrapWb = xlsx.readFile('貼膜尺寸表.xlsx');
const wrapWs = wrapWb.Sheets[wrapWb.SheetNames[0]];
const wrapData = xlsx.utils.sheet_to_json(wrapWs, {header: 1});
const wrapMap = new Map();
const originalCases = new Map();

for (let i = 1; i < wrapData.length; i++) {
  const row = wrapData[i];
  if (!row) continue;
  
  const groups = [0, 4, 8, 12, 16, 20];
  groups.forEach(colIdx => {
    let brand = String(row[colIdx] || '').trim();
    let model = String(row[colIdx + 1] || '').trim();
    let size = String(row[colIdx + 2] || '').trim().toUpperCase();
    
    if (brand && model && brand !== '廠牌') {
      const models = splitModels(model);
      models.forEach(m => {
        const key = `${brand}_${m}`.toLowerCase();
        wrapMap.set(key, size);
        originalCases.set(key, {brand, model: m});
      });
    }
  });
}

// 3. 結合並輸出
const combined = new Map();

// 先把 Wash 加入
washMap.forEach((size, key) => {
  const [b, ...ms] = key.split('_');
  const m = ms.join('_');
  const orig = originalCases.get(key) || { brand: b.toUpperCase(), model: m };
  combined.set(key, {
    brand: orig.brand,
    model: orig.model,
    size: wrapMap.get(key) || size,
    detailingSize: size
  });
});

// 再把 Wrap 有但 Wash 沒有的加入
wrapMap.forEach((size, key) => {
  if (!combined.has(key)) {
    const orig = originalCases.get(key);
    combined.set(key, {
      brand: orig.brand,
      model: orig.model,
      size: size,
      detailingSize: size
    });
  }
});

const result = Array.from(combined.values()).sort((a,b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
fs.writeFileSync('src/data/vehicles.json', JSON.stringify(result, null, 2));
console.log('Successfully wrote', result.length, 'vehicles to src/data/vehicles.json');
