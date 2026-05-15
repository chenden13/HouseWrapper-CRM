const XLSX = require('xlsx');

function probeExcel() {
  const workbook = XLSX.readFile('尺寸表.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('Sheet Name:', sheetName);
  console.log('First 5 rows:');
  rows.slice(0, 5).forEach((row, i) => {
    console.log(`Row ${i}:`, row);
  });
}

probeExcel();
