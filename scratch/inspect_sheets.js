import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();
console.log('Current Cwd:', cwd);

try {
  // 檢查貼膜尺寸表
  const filmPath = path.join(cwd, '貼膜尺寸表.xlsx');
  const filmWorkbook = XLSX.readFile(filmPath);
  console.log('\n--- 貼膜尺寸表 Sheet Names ---');
  console.log(filmWorkbook.SheetNames);
  
  const filmSheetName = filmWorkbook.SheetNames[0];
  const filmSheet = filmWorkbook.Sheets[filmSheetName];
  const filmData = XLSX.utils.sheet_to_json(filmSheet);
  console.log('貼膜尺寸表 所有欄位（鍵值）:');
  if (filmData.length > 0) {
    console.log(Object.keys(filmData[0]));
  }
  console.log(`貼膜尺寸表 總共有 ${filmData.length} 行資料。`);

  // 檢查洗車尺寸表
  const washPath = path.join(cwd, '洗車尺寸表.xlsx');
  const washWorkbook = XLSX.readFile(washPath);
  console.log('\n--- 洗車尺寸表 Sheet Names ---');
  console.log(washWorkbook.SheetNames);
  
  const washSheetName = washWorkbook.SheetNames[0];
  const washSheet = washWorkbook.Sheets[washSheetName];
  const washData = XLSX.utils.sheet_to_json(washSheet);
  console.log('洗車尺寸表 前三行資料:');
  console.log(washData.slice(0, 3));

} catch (e) {
  console.error('讀取失敗:', e);
}
