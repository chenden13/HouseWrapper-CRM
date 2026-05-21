import XLSX from 'xlsx';
import path from 'path';

const cwd = process.cwd();

try {
  const invPath = path.join(cwd, '膜料庫存.xlsx');
  const workbook = XLSX.readFile(invPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // 讀取為 2D 陣列
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`\n讀取工作表成功！總共 ${data.length} 行。`);

  // 我們來掃描所有可能包含「儲位名稱 / 名稱 / 尺寸」的區域
  // 橫向有 4 個主要區塊：
  // 區塊 1: Col 0, 1, 2 (A, B, C)
  // 區塊 2: Col 4, 5, 6 (E, F, G)
  // 區塊 3: Col 8, 9, 10 (I, J, K)
  // 區塊 4: Col 12, 13, 14 (M, N, O)
  
  const colBlocks = [
    { name: '第一大欄 (A-C)', cols: [0, 1, 2] },
    { name: '第二大欄 (E-G)', cols: [4, 5, 6] },
    { name: '第三大欄 (I-K)', cols: [8, 9, 10] },
    { name: '第四大欄 (M-O)', cols: [12, 13, 14] }
  ];

  // 讓我們印出每行在各分欄的關鍵地標（例如含有 "牆面"、"上層"、"下層" 等字眼的標題，以及儲位起迄）
  for (let r = 0; r < data.length; r++) {
    const row = data[r] || [];
    
    // 檢查這一行是不是一個大標題（通常是合併儲存格，其他欄位為空）
    colBlocks.forEach(block => {
      const titleVal = row[block.cols[0]];
      const nextVal1 = row[block.cols[1]];
      const nextVal2 = row[block.cols[2]];
      
      if (titleVal && !nextVal1 && !nextVal2 && String(titleVal).includes('（')) {
        console.log(`Row ${r + 1} | ${block.name} 發現地標標題: "${titleVal}"`);
      } else if (titleVal && nextVal1 === '名稱' && nextVal2 === '尺寸') {
        console.log(`Row ${r + 1} | ${block.name} 發現欄位頭: "${titleVal}"`);
      }
    });
  }

} catch (e) {
  console.error('掃描失敗:', e);
}
