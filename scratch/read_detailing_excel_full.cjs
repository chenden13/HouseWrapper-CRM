const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('汽車美容報價列表.xlsx');
  const sheet = workbook.Sheets['報價單S尺寸'];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(JSON.stringify(data, null, 2));
} catch (e) {
  console.error("Error:", e);
}
