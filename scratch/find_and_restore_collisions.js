import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

// 1. 讀取 .env 檔案
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

// 2. 讀取備份資料
const backupPath = path.join(cwd, 'scratch', 'backups', 'backup_data_2026-06-08T08-59-49-795Z', 'customers.json');
if (!fs.existsSync(backupPath)) {
  console.error('找不到備份檔案:', backupPath);
  process.exit(1);
}

const backupCustomers = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
console.log(`已讀取備份檔案，共 ${backupCustomers.length} 筆客戶資料。`);

async function run() {
  console.log('正在取得目前雲端資料庫的所有客戶資料...');
  let liveCustomers = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('讀取失敗:', error);
      return;
    }
    if (data && data.length > 0) {
      liveCustomers = [...liveCustomers, ...data];
      from += pageSize;
    } else {
      hasMore = false;
    }
    if (data && data.length < pageSize) {
      hasMore = false;
    }
  }

  console.log(`目前雲端資料庫共有 ${liveCustomers.length} 筆客戶資料。`);

  // 將雲端資料以 ID 建立 Map
  const liveMap = new Map();
  liveCustomers.forEach(c => {
    liveMap.set(String(c.id).trim(), c);
  });

  // 找出目前所有已使用的 ID
  const allUsedIds = new Set(liveCustomers.map(c => String(c.id).trim()));

  // 尋找碰撞 (ID 相同，但姓名與電話完全不同)
  const collisions = [];

  backupCustomers.forEach(bc => {
    const bcId = String(bc.id).trim();
    if (liveMap.has(bcId)) {
      const lc = liveMap.get(bcId);
      
      const bcName = String(bc.name || '').trim();
      const lcName = String(lc.name || '').trim();
      const bcPhone = String(bc.phone || '').trim();
      const lcPhone = String(lc.phone || '').trim();

      // 如果姓名不同，且電話也不同 (若有一邊為空，則看姓名是否完全不同)
      let isDifferent = false;
      if (bcName !== lcName) {
        if (bcPhone && lcPhone) {
          if (bcPhone !== lcPhone) {
            isDifferent = true;
          }
        } else {
          // 其中一方電話為空，只要姓名完全不一樣且不是子字串關係，就算不同
          const cleanBcName = bcName.replace(/\(.*\)/g, '').trim();
          const cleanLcName = lcName.replace(/\(.*\)/g, '').trim();
          if (cleanBcName !== cleanLcName && !cleanBcName.includes(cleanLcName) && !cleanLcName.includes(cleanBcName)) {
            isDifferent = true;
          }
        }
      }

      if (isDifferent) {
        collisions.push({
          id: bcId,
          backup: bc,
          live: lc
        });
      }
    }
  });

  console.log(`\n🔍 共發現 ${collisions.length} 筆 ID 碰撞覆蓋的資料！`);

  if (collisions.length === 0) {
    console.log('✅ 沒有發現其他 ID 被他人覆蓋的碰撞情況。');
    return;
  }

  // 找出目前最大的數值型 ID 作為分配新 ID 的起點
  let maxNum = 522;
  liveCustomers.forEach(c => {
    if (c.id) {
      const match = String(c.id).trim().match(/^(?:C-)?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum && num < 100000) {
          maxNum = num;
        }
      }
    }
  });

  let nextId = maxNum + 1;
  console.log(`目前最大數值型 ID: ${maxNum}，將從 ${nextId} 開始分配安全編號。`);

  // 開始復原碰撞的備份資料
  for (const col of collisions) {
    const newId = String(nextId++);
    console.log(`\n[碰撞檢測] ID ${col.id}:`);
    console.log(`  <- 備份覆蓋者 (舊資料): ${col.backup.name} (${col.backup.phone || '無電話'}) | 金額: ${col.backup.total_amount}`);
    console.log(`  -> 現存佔用者 (新資料): ${col.live.name} (${col.live.phone || '無電話'}) | 金額: ${col.live.total_amount}`);
    
    // 準備復原的 payload
    const payload = {
      ...col.backup,
      id: newId
    };

    console.log(`  => 正在復原 ${col.backup.name} 的資料至新安全編號: ${newId}...`);

    const { error: insertError } = await supabase
      .from('customers')
      .upsert(payload);

    if (insertError) {
      console.error(`  ❌ 復原失敗:`, insertError.message);
    } else {
      console.log(`  ✅ 成功復原！`);
      allUsedIds.add(newId);
    }
  }

  console.log('\n🎉 所有碰撞客戶已成功復原完成！');
}

run().catch(console.error);
