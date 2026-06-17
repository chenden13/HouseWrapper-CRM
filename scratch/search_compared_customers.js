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
  console.log('正在搜尋 黃偉哲, 黃願禎, 黃照暉 的顧客資料...');
  
  const { data: results, error } = await supabase
    .from('customers')
    .select('*')
    .or('name.ilike.%黃偉哲%,name.ilike.%黃願禎%,name.ilike.%黃照暉%');

  if (error) {
    console.error('查詢失敗:', error);
    return;
  }

  console.log('查詢結果數量:', results.length);
  results.forEach(c => {
    console.log('------------------------------');
    console.log('ID:', c.id);
    console.log('姓名:', c.name);
    console.log('狀態:', c.status);
    console.log('額外資料 (data):', JSON.stringify(c.data, null, 2));
  });
}

run();
