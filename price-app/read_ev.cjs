const XLSX = require('xlsx');
const wb = XLSX.readFile('2026 EV系列.xlsx');
console.log('Sheets:', wb.SheetNames);
wb.SheetNames.forEach(s => {
  const ws = wb.Sheets[s];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log('\n=== Sheet:', s, '===');
  data.slice(0, 30).forEach((r, i) => console.log(i, JSON.stringify(r)));
});
