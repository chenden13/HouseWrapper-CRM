import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

// 1. 手動解析 .env
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

async function checkDb() {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*');

    if (error) {
      console.error('Error fetching inventory:', error);
      return;
    }

    console.log(`Database count: ${data.length}`);
    const matches = [];
    data.forEach(item => {
      const locationStr = JSON.stringify(item.location || {});
      const colorStr = String(item.color || '');
      const brandStr = String(item.brand || '');
      const sizeStr = String(item.size || '');

      const searchStr = `${brandStr} ${colorStr} ${sizeStr} ${locationStr}`.toLowerCase();
      if (searchStr.includes('保桿') || searchStr.includes('新y保') || searchStr.includes('y保') || searchStr.includes('新y')) {
        matches.push(item);
      }
    });

    console.log(`Found ${matches.length} matching records in database:`);
    matches.forEach(m => {
      console.log(`ID: ${m.id}, Brand: ${m.brand}, Color: ${m.color}, Size: ${m.size}, Location:`, m.location);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

checkDb();
