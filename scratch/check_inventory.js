import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

// 手動解析 .env
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
}

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少環境變數！');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    console.log('正在連線至 Supabase 讀取現有庫存...');
    const { data, error } = await supabase.from('inventory').select('*').limit(5);
    
    if (error) {
      console.error('查詢出錯:', error);
      return;
    }
    
    console.log('\n--- 目前資料庫中的現有庫存樣品 (前 5 筆) ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('連線出錯:', e);
  }
}

check();
