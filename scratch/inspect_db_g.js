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

async function checkG() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  const gItems = data.filter(item => item.location && item.location.zone === 'G');
  console.log(`\nZone G items in database (Total ${gItems.length}):`);
  gItems.forEach(item => {
    console.log(`ID: ${item.id}, Brand: ${item.brand}, Color: ${item.color}, Meters: ${item.location.currentMeters}, Notes: ${item.location.notes}, Slot: ${item.location.slot}`);
  });

  // Check for duplicate IDs or slots
  const ids = gItems.map(item => item.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    console.error('❌ Found duplicate IDs in Zone G:', duplicates);
  } else {
    console.log('✅ No duplicate IDs in Zone G!');
  }
}

checkG();
