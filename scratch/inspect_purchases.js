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

async function checkPurchases() {
  const { data, error } = await supabase
    .from('purchase_records')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`\nTotal purchase records: ${data.length}`);
  data.forEach((rec, index) => {
    console.log(`${index}: ${JSON.stringify(rec)}`);
  });
}

checkPurchases();
