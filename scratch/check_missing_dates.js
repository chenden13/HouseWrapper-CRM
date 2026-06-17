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
  const { data: allData, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('getCustomers error:', error);
    return;
  }

  const customers = allData.map(item => {
    const extraData = (typeof item.data === 'object' && item.data !== null) ? item.data : {};
    return {
      ...extraData,
      id: item.id,
      name: item.name,
      status: item.status
    };
  });

  const activeCustomers = customers.filter(c => {
    if (c.id.startsWith('EVENT-')) return true;
    return ['deposit', 'scheduled', 'construction'].includes(c.status);
  });

  console.log(`活躍客戶總數: ${activeCustomers.length}`);
  
  let missingDatesCount = 0;
  activeCustomers.forEach(c => {
    const hasStart = !!c.expectedStartDate;
    const hasEnd = !!c.expectedEndDate || !!c.deliveryDate;
    if (!hasStart || !hasEnd) {
      missingDatesCount++;
      console.log(`- 客戶: ${c.name} (ID: ${c.id}) 缺少日期! Start: ${hasStart ? c.expectedStartDate : '無'}, End/Delivery: ${hasEnd ? (c.expectedEndDate || c.deliveryDate) : '無'}`);
    }
  });
  console.log(`缺少日期的活躍客戶總數: ${missingDatesCount}`);
}

run();
