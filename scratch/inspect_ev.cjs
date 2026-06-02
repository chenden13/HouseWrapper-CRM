const XLSX = require('xlsx');
const wb = XLSX.readFile('C:\\car-shop-projects\\housewrapper-price\\2026 EV系列.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Show all rows
console.log('Total rows:', data.length);

// Show first few rows to understand headers
data.slice(0, 5).forEach((r, i) => console.log('HEADER', i, JSON.stringify(r)));

// Find unique values in 附加價格 column (col 7)
const prices = new Set();
const series = new Set();
data.forEach(r => {
  if (r[7]) prices.add(r[7]);
  if (r[1]) series.add(r[1]);
});
console.log('\n附加價格 values:', [...prices]);
console.log('Series values:', [...series]);

// Show rows with non-原價 附加價格
console.log('\n=== Rows with extra price ===');
data.filter(r => r[7] && r[7] !== '原價' && typeof r[7] !== 'string').forEach(r => console.log(JSON.stringify(r)));

// Show all rows to see the full structure
console.log('\n=== ALL DATA ===');
data.forEach((r, i) => {
  if (r.length > 0) console.log(i, JSON.stringify(r));
});
