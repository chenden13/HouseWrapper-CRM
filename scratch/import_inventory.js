import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

// 1. 手動解析 .env
let supabaseUrl = '';
let supabaseKey = '';
try {
  const envContent = fs.readFileSync(path.join(cwd, '.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('VITE_SUPABASE_URL=')[1].trim();
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.split('VITE_SUPABASE_ANON_KEY=')[1].trim();
    }
  });
} catch (err) {
  console.error('讀取 .env 失敗:', err);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. 智慧提取品牌與顏色
function extractBrandAndColor(name) {
  if (!name) return { brand: '通用', color: '' };
  
  const rawName = String(name).trim();
  const upper = rawName.toUpperCase();
  const brands = ['AWF', '3M', 'AX', 'STEK', 'TECKWRAP', 'SUNTEK', 'SMT', 'SUNTOP', 'LB', 'AXWRAP'];
  
  for (let b of brands) {
    if (upper.startsWith(b)) {
      const color = rawName.substring(b.length).trim();
      return { brand: b, color: color || rawName };
    }
  }
  
  return { brand: '通用', color: rawName };
}

// 3. 智慧解析米數與備註
function parseSizeAndNotes(sizeVal) {
  const clean = String(sizeVal || '').trim();
  if (!clean) return { meters: 0, size: '1.52m x 15m', notes: '' };
  
  if (clean === '全新') {
    return { meters: 15, size: '1.52m x 15m', notes: '全新完整一捲' };
  }
  
  // 檢查是否為長x寬規格 (例如 260x75, 230X80, 185X130)
  const matchCustom = clean.match(/^(\d+)[xX](\d+)$/);
  if (matchCustom) {
    const lengthCm = parseInt(matchCustom[1], 10);
    const widthCm = parseInt(matchCustom[2], 10);
    const meters = lengthCm / 100;
    const widthM = widthCm / 100;
    const size = `${widthM}m x ${meters}m`;
    const isBumper = (clean === '260x75');
    return {
      meters: meters,
      size: size,
      notes: isBumper ? '保桿' : `規格: ${clean}`
    };
  }
  
  if (clean === '保桿' || clean === '新y保' || clean === '後保') {
    return { meters: 2.6, size: '0.75m x 2.6m', notes: '保桿' };
  }
  
  // 檢查是否為純數字 (代表標準寬度 1.52m，只剩下指定公分長度)
  const num = Number(clean);
  if (!isNaN(num) && clean !== '') {
    return { meters: num / 100, size: '1.52m x 15m', notes: '' };
  }
  
  // 其他特殊情況的 fallback
  return { meters: 0, size: '1.52m x 15m', notes: `庫存備註: ${clean}` };
}

// 4. 定位儲位（與 ZONE_CONFIG 一致）
function parseLocation(currentTitle, col0Val, sequentialSlotCounter, blockIndex) {
  let zone = 'A';
  let section = 1;
  let slot = sequentialSlotCounter;

  // 過濾掉空白
  const titleClean = currentTitle.replace(/\s+/g, '');
  
  if (titleClean.includes('A1')) { zone = 'A'; section = 1; }
  else if (titleClean.includes('A2')) { zone = 'A'; section = 2; }
  else if (titleClean.includes('A3')) { zone = 'A'; section = 3; }
  else if (titleClean.includes('A4') || titleClean.includes('A5')) { zone = 'G'; section = 1; } // A4 & A5 映射至未拆區域 G1
  
  else if (titleClean.includes('B1')) { zone = 'B'; section = 1; }
  else if (titleClean.includes('B2')) { zone = 'B'; section = 2; }
  
  else if (titleClean.includes('D1')) { zone = 'C'; section = 1; }
  else if (titleClean.includes('D2')) { zone = 'C'; section = 2; }
  else if (titleClean.includes('D3')) { zone = 'C'; section = 3; }
  else if (titleClean.includes('D4')) { zone = 'C'; section = 4; }
  else if (titleClean.includes('D5')) { zone = 'C'; section = 5; }
  else if (titleClean.includes('D6')) { zone = 'C'; section = 6; }
  
  else if (titleClean.includes('C1-1')) { zone = 'D'; section = 1; }
  else if (titleClean.includes('C1-2')) { zone = 'D'; section = 2; }
  else if (titleClean.includes('C1-3')) { zone = 'D'; section = 3; }
  else if (titleClean.includes('C1-4')) { zone = 'D'; section = 4; }
  else if (titleClean.includes('C1-5')) {
    zone = 'D';
    if (blockIndex === 4) {
      section = 5;
    } else if (blockIndex === 5) {
      section = 6;
    }
  }
  
  else if (titleClean.includes('C2-1')) { zone = 'E'; section = 1; }
  else if (titleClean.includes('C2-2')) { zone = 'E'; section = 2; }
  else if (titleClean.includes('C2-3')) { zone = 'E'; section = 3; }
  else if (titleClean.includes('C2-4')) { zone = 'E'; section = 4; }
  else if (titleClean.includes('C2-5')) { zone = 'E'; section = 5; }
  
  else if (titleClean.includes('C3-1')) { zone = 'F'; section = 1; }
  else if (titleClean.includes('C3-2')) { zone = 'F'; section = 2; }
  else if (titleClean.includes('C3-3')) { zone = 'F'; section = 3; }
  else if (titleClean.includes('C3-4')) { zone = 'F'; section = 4; }
  else if (titleClean.includes('C3-5')) { zone = 'F'; section = 5; }

  // 判斷孔位編號
  const isSequentialSlot = titleClean.includes('層架') || titleClean.includes('A4') || titleClean.includes('A5');
  if (!isSequentialSlot && col0Val && col0Val.includes('-')) {
    const parts = col0Val.split('-');
    const parsedSlot = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(parsedSlot)) {
      slot = parsedSlot;
    }
  }

  return { zone, section, slot };
}

async function main() {
  try {
    // A. 匯入前先清空 Supabase 中的舊庫存
    console.log('正在清空舊有庫存紀錄...');
    const { error: delError } = await supabase
      .from('inventory')
      .delete()
      .neq('id', 'clear_all_records_placeholder');
      
    if (delError) {
      console.error('清空庫存失敗:', delError);
      process.exit(1);
    }
    console.log('舊庫存紀錄已順利清空。');

    // B. 讀取 Excel 膜料庫存表
    const invPath = path.join(cwd, '膜料庫存.xlsx');
    const workbook = XLSX.readFile(invPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawGrid = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const colBlocks = [
      { name: 'A-C', cols: [0, 1, 2], currentTitle: '', sequentialSlot: 0 },
      { name: 'E-G', cols: [4, 5, 6], currentTitle: '', sequentialSlot: 0 },
      { name: 'I-K', cols: [8, 9, 10], currentTitle: '', sequentialSlot: 0 },
      { name: 'M-O', cols: [12, 13, 14], currentTitle: '', sequentialSlot: 0 },
      { name: 'Q-S', cols: [16, 17, 18], currentTitle: '', sequentialSlot: 0 },
      { name: 'U-W', cols: [20, 21, 22], currentTitle: '', sequentialSlot: 0 }
    ];

    let zoneGSlotCounter = 0;
    const parsedItems = [];

    // C. 雙重迴圈解析
    for (let r = 0; r < rawGrid.length; r++) {
      const row = rawGrid[r] || [];
      
      colBlocks.forEach((block, blockIndex) => {
        const col0Val = String(row[block.cols[0]] || '').trim();
        const col1Val = String(row[block.cols[1]] || '').trim();
        const col2Val = String(row[block.cols[2]] || '').trim();
        
        // 1. 判斷地標大標題
        let isTitle = false;
        let titleText = '';
        
        if (col0Val && (col0Val.includes('（') || col0Val.includes('(') || col0Val.includes('層架') || col0Val.includes('倒V') || col0Val === 'A4' || col0Val === 'A5')) {
          isTitle = true;
          titleText = col0Val;
        } else if (col1Val && (col1Val === 'A4' || col1Val === 'A5' || col1Val.includes('A4') || col1Val.includes('A5')) && !col0Val && !col2Val) {
          isTitle = true;
          titleText = col1Val;
        }
        
        if (isTitle) {
          block.currentTitle = titleText;
          block.sequentialSlot = 0; // 重設孔位計數器
          return;
        }
        
        // 2. 忽略欄位頭
        if (col1Val === '名稱' && col2Val === '尺寸') {
          return;
        }
        
        // 3. 解析有效的品項
        if (block.currentTitle && col1Val && col1Val !== '') {
          block.sequentialSlot++; // 自動遞增孔位
          
          const { brand, color } = extractBrandAndColor(col1Val);
          let { meters, size, notes } = parseSizeAndNotes(col2Val);
          let { zone, section, slot } = parseLocation(block.currentTitle, col0Val, block.sequentialSlot, blockIndex);
          
          // 如果是未拆區域的膜料，且自動標註備註
          if (zone === 'G') {
            if (!notes) notes = '全新未拆膜料';
            zoneGSlotCounter++;
            slot = zoneGSlotCounter;
          }
          
          // 生成唯一 ID 避免重複插入
          const uniqueId = `INV-${zone}-${section}-${slot}`;
          
          parsedItems.push({
            id: uniqueId,
            brand: brand,
            color: color,
            size: size, // 使用動態解析的規格尺寸
            location: {
              zone: zone,
              section: section,
              slot: slot,
              currentMeters: meters,
              notes: notes || '' // 將備註放入 location JSON 中
            },
            last_updated: new Date().toISOString().split('T')[0]
          });
        }
      });
    }

    console.log(`\nExcel 解析完成！共萃取到 ${parsedItems.length} 筆膜料庫存品項。`);
    
    // D. 批量寫入 Supabase 中
    if (parsedItems.length > 0) {
      console.log('正在批量寫入庫存資料到 Supabase...');
      const { error: insError } = await supabase
        .from('inventory')
        .insert(parsedItems);
        
      if (insError) {
        console.error('批量寫入庫存出錯:', insError);
        process.exit(1);
      }
      
      console.log(`\n🎉 膜料庫存完美匯入成功！總計匯入：${parsedItems.length} 筆品項。`);
      
      // 按分區印出簡易報告
      const stats = {};
      parsedItems.forEach(item => {
        stats[item.location.zone] = (stats[item.location.zone] || 0) + 1;
      });
      console.log('\n--- 儲存區域匯入統計報告 ---');
      console.log(`- 牆面 A區 (A1~A3): ${stats['A'] || 0} 捲`);
      console.log(`- 靠牆架 B區 (B1~B2): ${stats['B'] || 0} 捲`);
      console.log(`- 倒V架 C區 (D1~D4): ${stats['C'] || 0} 捲`);
      console.log(`- 直立層架1 D區 (C1): ${stats['D'] || 0} 捲`);
      console.log(`- 直立層架2 E區 (C2): ${stats['E'] || 0} 捲`);
      console.log(`- 直立層架3 F區 (C3): ${stats['F'] || 0} 捲`);
      console.log(`- 未拆區域 G區 (G1): ${stats['G'] || 0} 捲`);
    }
  } catch (e) {
    console.error('匯入主流程出錯:', e);
  }
}

main();
