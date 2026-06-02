const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('C:\\car-shop-projects\\housewrapper-price\\2026 EV系列.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Parse extra price
function parseExtraPrice(val) {
  if (!val || val === '原價') return 0;
  const match = String(val).match(/\+(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Remove PET prefix from color names
function cleanName(name) {
  if (!name) return '';
  return String(name)
    .replace(/^PET\s*/i, '')
    .replace(/^PET$/i, '')
    .trim();
}

const colors = [];
let currentSeries = '';
let currentSeriesLabel = '';

// Map series labels
const seriesMap = {
  'E系列': 'E系列',
  'G-漸變系列': 'G系列（漸變）',
  'T-特調系列': 'T系列（特調）',
  'V系列': 'V系列（液態金屬）',
};

data.forEach(row => {
  // Detect series header row
  if (row[1] && typeof row[1] === 'string' && row[1] !== '系列') {
    currentSeries = row[1];
    currentSeriesLabel = seriesMap[row[1]] || row[1];
  }

  // Detect color row (first col is number, col 2 has code)
  if (typeof row[0] === 'number' && row[2] && row[4]) {
    const extraPrice = parseExtraPrice(row[7]);
    const colorNameRaw = String(row[4] || '');
    const colorName = cleanName(colorNameRaw);
    const englishName = cleanName(String(row[3] || ''));
    
    colors.push({
      seq: row[0],
      series: currentSeries,
      seriesLabel: currentSeriesLabel,
      code: String(row[2]).trim(),
      englishName,
      colorName,
      basePrice: row[6] || 0,
      extraPrice,
    });
  }
});

console.log('Total colors:', colors.length);
console.log('Sample:', JSON.stringify(colors.slice(0, 3), null, 2));

// Write to JSON
fs.writeFileSync(
  'C:\\car-shop-projects\\car-shop-crm\\src\\data\\axColors2026.json',
  JSON.stringify(colors, null, 2),
  'utf8'
);
console.log('\nWritten to src/data/axColors2026.json');
