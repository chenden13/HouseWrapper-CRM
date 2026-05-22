import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log('Non-empty items in Columns 16-18 and 20-22:');
  
  let currentTitle5 = '';
  let currentTitle6 = '';

  for (let r = 0; r < data.length; r++) {
    const row = data[r] || [];
    
    // Check titles
    const col16Val = String(row[16] || '').trim();
    const col20Val = String(row[20] || '').trim();

    if (col16Val && (col16Val.includes('（') || col16Val.includes('(') || col16Val.includes('層架') || col16Val.includes('倒V') || col16Val === 'A5')) {
      currentTitle5 = col16Val;
    }
    if (col20Val && (col20Val.includes('（') || col20Val.includes('(') || col20Val.includes('層架') || col20Val.includes('倒V'))) {
      currentTitle6 = col20Val;
    }

    const col17Val = String(row[17] || '').trim();
    const col18Val = String(row[18] || '').trim();
    const col21Val = String(row[21] || '').trim();
    const col22Val = String(row[22] || '').trim();

    if (col17Val && col17Val !== '名稱') {
      console.log(`Row ${r+1} Block 5 [${currentTitle5}]: Col16=${row[16]}, Col17=${col17Val}, Col18=${col18Val}`);
    }
    if (col21Val && col21Val !== '名稱') {
      console.log(`Row ${r+1} Block 6 [${currentTitle6}]: Col20=${row[20]}, Col21=${col21Val}, Col22=${col22Val}`);
    }
  }
} catch (e) {
  console.error(e);
}
