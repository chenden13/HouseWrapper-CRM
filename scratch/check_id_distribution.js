import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

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

async function checkIds() {
  console.log('正在取得所有客戶的 ID...');
  let allData = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, status')
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('讀取失敗:', error);
      break;
    }
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += pageSize;
    } else {
      hasMore = false;
    }
    if (data && data.length < pageSize) {
      hasMore = false;
    }
  }

  console.log(`總共取得 ${allData.length} 筆客戶資料。`);

  // 分析 ID 種類
  const numericIds = [];
  const nonNumericIds = [];

  allData.forEach(c => {
    const match = String(c.id).trim().match(/^(?:C-)?(\d+)/i);
    if (match) {
      numericIds.push({ id: c.id, num: parseInt(match[1], 10), name: c.name, status: c.status });
    } else {
      nonNumericIds.push(c.id);
    }
  });

  console.log(`數值型 ID 數量: ${numericIds.length}`);
  console.log(`非數值型 ID 數量: ${nonNumericIds.length}`);

  // 排序數值型 ID
  numericIds.sort((a, b) => a.num - b.num);

  console.log('前 10 個最小的數值型 ID:');
  console.log(numericIds.slice(0, 10));

  console.log('後 10 個最大的數值型 ID:');
  console.log(numericIds.slice(-10));

  // 尋找有沒有斷號 (gaps)
  const idSet = new Set(numericIds.map(x => x.num));
  const min = Math.min(...numericIds.map(x => x.num));
  const max = Math.max(...numericIds.map(x => x.num));
  console.log(`數值型 ID 範圍: ${min} ~ ${max}`);

  const gaps = [];
  for (let i = min; i <= max; i++) {
    if (!idSet.has(i)) {
      gaps.push(i);
    }
  }
  console.log(`數值型 ID 中的斷號數量: ${gaps.length}`);
  console.log('前 20 個斷號:', gaps.slice(0, 20));
}

checkIds();
