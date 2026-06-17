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
  const { data: rawCustomers, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Error fetching customers:', error);
    return;
  }

  const matches = rawCustomers.filter(item => {
    const str = JSON.stringify(item).toLowerCase();
    return str.includes('曜石灰') || str.includes('泰霖') || str.includes('tai-lin');
  });

  console.log(`Found ${matches.length} matching records:`);
  matches.forEach(m => {
    console.log(`ID: ${m.id}, Name: ${m.name}, Data:`, m.data);
  });
}

run();
