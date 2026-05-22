const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('汽車美容報價列表.xlsx');
  const sheet = workbook.Sheets['報價單S尺寸'];
  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  const parsedData = [];
  
  // start from index 2, because 0 is header, 1 is '滿額升級會員'
  for (let i = 2; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0 || !row[0]) continue;
    
    const itemName = row[0];
    const subtitle = row[1] || '';
    const details = row[2] || '';
    
    // prices are at indices: N:3, S:4, SR:5, UR:6
    const priceN = parseInt(row[3]) || 0;
    const priceS = parseInt(row[4]) || 0;
    const priceSR = parseInt(row[5]) || 0;
    const priceUR = parseInt(row[6]) || 0;
    
    let stepPrice = 0;
    
    if (['經典洗', '光澤整備'].includes(itemName)) {
      stepPrice = 200;
    } else if (['深層特勤', '膜淨行動', '鏡透打底Lv.1', '淨透打底lv1'].includes(itemName)) {
      stepPrice = 500;
    } else if (['鏡透打底Lv.2', '膜車專護方案', 'S1單層護盾', 'S1雙層護盾', 'S2單層護盾', 'S2雙層護盾'].includes(itemName)) {
      stepPrice = 1000;
    } else if (['視界強化', '鋁圈守護', '視界去污'].includes(itemName)) {
      stepPrice = 0;
    }
    
    // Discount Rates based on S size
    const discountS = priceN > 0 ? priceS / priceN : 0;
    const discountSR = priceN > 0 ? priceSR / priceN : 0;
    const discountUR = priceN > 0 ? priceUR / priceN : 0;
    
    parsedData.push({
      itemName,
      subtitle,
      details,
      basePriceN: priceN,
      discountS,
      discountSR,
      discountUR,
      stepPrice
    });
  }
  
  const outputPath = '../housewrapper-price/src/data/detailing_prices.json';
  fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2), 'utf-8');
  console.log(`Successfully extracted ${parsedData.length} detailing items to ${outputPath}`);
} catch (e) {
  console.error("Error:", e);
}
