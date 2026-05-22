import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

// 1. 讀取 Supabase 金鑰
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

// 2. 建立比對特徵 Key 函數
function getDedupeKey(c) {
  const d = c.data || {};
  
  return JSON.stringify({
    name: String(c.name || '').trim(),
    phone: String(c.phone || '').trim(),
    plate_number: String(c.plate_number || '').trim(),
    brand: String(c.brand || '').trim(),
    model: String(c.model || '').trim(),
    status: String(c.status || '').trim(),
    total_amount: Number(c.total_amount || 0),
    cost: Number(c.cost || 0),
    revenue: Number(c.revenue || 0),
    
    // data JSONB 內的重要欄位
    filmColor: String(d.filmColor || '').trim(),
    mainService: String(d.mainService || '').trim(),
    mainServiceBrand: String(d.mainServiceBrand || '').trim(),
    expectedStartDate: String(d.expectedStartDate || '').trim(),
    expectedEndDate: String(d.expectedEndDate || '').trim(),
    deliveryDate: String(d.deliveryDate || '').trim(),
    notes: String(d.notes || '').trim(),
  });
}

async function run() {
  const execute = process.argv.includes('--execute');
  
  console.log('--- 正在從 Supabase 取得所有完工/案件資料 ---');
  let customers = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('取得資料庫失敗:', error.message);
      return;
    }

    customers = customers.concat(data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`總共讀取到 ${customers.length} 筆資料。`);

  // 用 Map 來分組，Key 是比對特徵字串，Value 是該特徵下的所有紀錄陣列
  const groups = new Map();

  customers.forEach(c => {
    const key = getDedupeKey(c);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(c);
  });

  const toKeep = [];
  const toDelete = [];
  let totalDuplicatesFound = 0;

  for (const [keyStr, group] of groups.entries()) {
    if (group.length > 1) {
      // 找到重複！保留第一筆，其餘的加入刪除名單
      const keepItem = group[0];
      toKeep.push(keepItem);
      
      const dupes = group.slice(1);
      dupes.forEach(item => {
        toDelete.push(item);
      });
      
      totalDuplicatesFound += dupes.length;

      const parsedKey = JSON.parse(keyStr);
      console.log(`\n[重複特徵] 姓名: ${parsedKey.name} | 電話: ${parsedKey.phone} | 車牌: ${parsedKey.plate_number} | 顏色: ${parsedKey.filmColor}`);
      console.log(`  -> 保留: ${keepItem.id}`);
      dupes.forEach(item => {
        console.log(`  -> 刪除: ${item.id}`);
      });
    }
  }

  console.log(`\n--- 掃描報告 ---`);
  console.log(`- 發現完全重複資料筆數: ${totalDuplicatesFound} 筆`);
  console.log(`- 唯一不重複特徵組數: ${groups.size} 組`);

  if (toDelete.length === 0) {
    console.log('✅ 資料庫非常乾淨，未發現任何完全重複的紀錄。');
    return;
  }

  if (!execute) {
    console.log('\n⚠️ 目前為 [預覽模式 (Dry-Run)]，尚未對資料庫進行修改。');
    console.log('💡 若確認無誤，請執行以下命令以實際刪除重複資料：');
    console.log('   node scratch/cleanup_exact_duplicates.js --execute');
  } else {
    console.log(`\n🚀 [執行模式] 正在從 Supabase 刪除這 ${toDelete.length} 筆完全重複的資料...`);
    
    // 批次刪除，每次最多 100 筆
    const batchSize = 100;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batchIds = toDelete.slice(i, i + batchSize).map(item => item.id);
      console.log(`正在刪除批次 ${i / batchSize + 1} (${batchIds.length} 筆)...`);
      
      const { error: delError } = await supabase
        .from('customers')
        .delete()
        .in('id', batchIds);

      if (delError) {
        console.error('批次刪除失敗:', delError.message);
      } else {
        console.log('批次刪除成功。');
      }
    }
    console.log('\n🎉 所有重複資料已清理完畢！');
  }
}

run();
