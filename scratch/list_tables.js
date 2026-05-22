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

async function listTables() {
  // Query Supabase tables using postgres catalog if possible,
  // or fetch from common tables.
  const { data, error } = await supabase
    .rpc('get_tables'); // Check if there is an rpc

  if (error) {
    console.log('rpc get_tables failed, trying sql execution via REST if possible...');
    console.error(error);
  } else {
    console.log('Tables:', data);
  }
}

listTables();
