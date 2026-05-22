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

async function testDelete() {
  const testId = '無編號-1778927180677-172';
  
  // 先查詢
  const { data: before, error: err1 } = await supabase
    .from('customers')
    .select('id, name')
    .eq('id', testId);
  
  console.log('查詢該 ID 結果:', before, '錯誤:', err1);
  
  if (before && before.length > 0) {
    console.log('嘗試刪除該 ID...');
    const { data: deleted, error: err2 } = await supabase
      .from('customers')
      .delete()
      .eq('id', testId)
      .select();
      
    console.log('刪除結果:', deleted, '錯誤:', err2);
  }
}

testDelete();
