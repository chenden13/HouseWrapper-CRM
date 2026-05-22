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

async function inspectCIds() {
  const { data: allCustomers, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Error fetching customers:', error);
    return;
  }

  // 尋找 ID 開頭為 C 或包含 C 的
  const cCustomers = allCustomers.filter(c => String(c.id).toUpperCase().startsWith('C'));
  console.log(`以 C 開頭的 ID 紀錄數量: ${cCustomers.length}`);
  cCustomers.forEach(c => {
    console.log(`ID: ${c.id}, Name: ${c.name}, Phone: ${c.phone}, Status: ${c.status}`);
  });
}

inspectCIds();
