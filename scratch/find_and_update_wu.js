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
  console.log('--- 查詢包含「吳」且狀態為「施工中」的客戶 ---');
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('status', 'construction');

  if (error) {
    console.error('查詢失敗:', error);
    return;
  }

  const targets = customers.filter(c => String(c.name).includes('吳'));
  console.log(`找到 ${targets.length} 筆符合的「施工中」客戶:`);
  
  for (const c of targets) {
    console.log(`ID: ${c.id}, Name: ${c.name}, Plate: ${c.plate_number}, Status: ${c.status}`);
    
    // 將狀態改為 completed
    const today = new Date().toISOString().split('T')[0];
    const checkup = new Date();
    checkup.setMonth(checkup.getMonth() + 1);
    
    const updatedData = {
      ...(c.data || {}),
      deliveryDate: today,
      checkupDate: checkup.toISOString().split('T')[0]
    };

    console.log(`正在更新 ${c.name} 為 completed (已完工)...`);
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        status: 'completed',
        data: updatedData
      })
      .eq('id', c.id);

    if (updateError) {
      console.error(`更新 ${c.name} 失敗:`, updateError);
    } else {
      console.log(`更新 ${c.name} 成功！`);
    }
  }
}

run();
