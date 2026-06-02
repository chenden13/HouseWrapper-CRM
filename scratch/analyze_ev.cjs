const XLSX = require('xlsx');
const wb = XLSX.readFile('C:\\car-shop-projects\\housewrapper-price\\2026 EV系列.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Find unique series
const seriesSet = new Set();
data.forEach(r => { if (r[1] && typeof r[1] === 'string') seriesSet.add(r[1]); });
console.log('Series:', [...seriesSet]);

// Find unique extra prices
const priceSet = new Set();
data.forEach(r => { if (r[7]) priceSet.add(r[7]); });
console.log('Extra prices:', [...priceSet]);

// Count colors per series
let currentSeries = '';
const counts = {};
data.forEach(r => {
  if (r[1] && typeof r[1] === 'string') currentSeries = r[1];
  if (typeof r[0] === 'number' && r[2]) {
    counts[currentSeries] = (counts[currentSeries] || 0) + 1;
  }
});
console.log('Colors per series:', counts);

// Show sample of each series
console.log('\n=== Sample rows ===');
const shown = new Set();
data.forEach(r => {
  if (typeof r[0] === 'number' && r[2] && r[4]) {
    const key = r[1] || 'unknown';
    if (!shown.has(key)) {
      shown.add(key);
      console.log('Series sample:', JSON.stringify(r));
    }
  }
});
