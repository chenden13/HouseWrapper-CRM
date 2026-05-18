import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('--- 正在探查資料表結構 ---');
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .limit(1);

  if (error) {
    console.error('探查失敗:', error);
    return;
  }

  if (data && data[0]) {
    console.log('欄位清單:', Object.keys(data[0]));
    console.log('範例資料:', data[0]);
  } else {
    console.log('資料庫是空的。');
  }
}

inspectSchema();
