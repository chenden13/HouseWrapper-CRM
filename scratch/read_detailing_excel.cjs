const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('汽車美容報價列表.xlsx');
  const sheetNames = workbook.SheetNames;
  console.log("Sheet names:", sheetNames);
  
  sheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\n--- Sheet: ${name} ---`);
    console.log(JSON.stringify(data.slice(0, 15), null, 2)); // Print first 15 rows
  });
} catch (e) {
  console.error("Error:", e);
}
