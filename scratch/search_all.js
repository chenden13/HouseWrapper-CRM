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
  console.error(err);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchAll() {
  const { data, error } = await supabase.from('inventory').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Total database records: ${data.length}`);
  const matches = [];
  data.forEach(item => {
    const itemStr = JSON.stringify(item).toLowerCase();
    if (itemStr.includes('新y') || itemStr.includes('y保') || itemStr.includes('保') || itemStr.includes('桿')) {
      matches.push(item);
    }
  });
  
  console.log(`Found ${matches.length} matching records containing '新y', 'y保', '保', or '桿':`);
  matches.forEach(m => {
    console.log(`ID: ${m.id}, Brand: ${m.brand}, Color: ${m.color}, Size: ${m.size}, Location:`, m.location);
  });
}

searchAll();
