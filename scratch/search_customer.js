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
  console.log('正在搜尋顧客資料...');
  
  // 搜尋名字包含「顥」的
  const { data: byName, error: errName } = await supabase
    .from('customers')
    .select('*')
    .ilike('name', '%顥%');

  console.log('名字包含「顥」的搜尋結果:', byName || [], errName || '');

  // 搜尋 ID 為 525 或 C001 的
  const { data: byId, error: errId } = await supabase
    .from('customers')
    .select('*')
    .or('id.eq.525,id.eq.C001');

  console.log('ID 為 525 或 C001 的搜尋結果:', byId || [], errId || '');
}

run();
