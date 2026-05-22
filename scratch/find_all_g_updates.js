import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = path.join(__dirname, '..');

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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllGLogs() {
  const { data: logs, error } = await supabase
    .from('inventory_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log('--- All G-zone logs in DB ---');
  logs.forEach(log => {
    if (log.details.includes('G1-') || log.item_id.includes('INV-G-') || log.details.includes('G區')) {
      console.log(`Time: ${log.timestamp}, Action: ${log.action}, Details: ${log.details}, ItemID: ${log.item_id}`);
    }
  });
}

checkAllGLogs();
