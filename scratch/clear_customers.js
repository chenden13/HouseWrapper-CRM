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

async function run() {
  const mode = process.argv[2]; // 'all' or 'active'

  if (!mode || (mode !== 'all' && mode !== 'active')) {
    console.log('請指定清除模式:');
    console.log('  node scratch/clear_customers.js active   <- 只清除「排程/待施工/施工中/收訂」的資料');
    console.log('  node scratch/clear_customers.js all      <- 清除「全部」資料 (包含 1000 筆歷史完工資料)');
    return;
  }

  // Fetch current list
  const { data: customers, error: fetchError } = await supabase.from('customers').select('id, name, status');
  if (fetchError) {
    console.error('取得顧客失敗:', fetchError);
    return;
  }

  let targets = [];
  if (mode === 'active') {
    const activeStatuses = ['deposit', 'scheduled', 'construction'];
    targets = customers.filter(c => activeStatuses.includes(c.status) || String(c.id).startsWith('EVENT-'));
  } else {
    targets = customers;
  }

  if (targets.length === 0) {
    console.log('沒有符合條件的資料可供清除。');
    return;
  }

  console.log(`準備刪除 ${targets.length} 筆資料...`);
  
  const ids = targets.map(c => c.id);
  
  // Batch delete in chunks of 100 to avoid query size limits
  const chunkSize = 100;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const { error: deleteError } = await supabase.from('customers').delete().in('id', chunk);
    if (deleteError) {
      console.error(`刪除區段 ${i} ~ ${i + chunk.length} 失敗:`, deleteError);
      return;
    }
    console.log(`已成功刪除 ${i + chunk.length} / ${ids.length} 筆`);
  }

  console.log('✅ 清空完成！請重新整理 CRM 網頁查看效果。');
}

run();
